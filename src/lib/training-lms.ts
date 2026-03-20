import {
  assessmentTemplates,
  candidateAssessmentAttempts,
  candidateAttendanceRecords,
  candidateTrainingEnrollments,
  candidateWorkflowInstances,
  certificateRecords,
  candidates,
  trainingBatches,
  trainingCourses,
  trainingSessions,
  workflowEvents,
  workflowStages,
} from "@/lib/data";
import type {
  CandidateAssessmentAttempt,
  CandidateAttendanceRecord,
} from "@/lib/definitions";

export type GradeScale = {
  aMin: number;
  bPlusMin: number;
  bMin: number;
};

type GradeAssessmentOptions = {
  passThreshold?: number;
  gradeScale?: GradeScale;
};

function addHours(baseDateIso: string, hours: number): string {
  const date = new Date(baseDateIso);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function getAttendancePercent(candidateId: string, courseId: string) {
  const relatedBatches = trainingBatches.filter((batch) => batch.courseId === courseId).map((batch) => batch.id);
  const relatedSessions = trainingSessions.filter((session) => relatedBatches.includes(session.batchId)).map((session) => session.id);
  if (relatedSessions.length === 0) {
    return 0;
  }

  const records = candidateAttendanceRecords.filter(
    (record) => record.candidateId === candidateId && relatedSessions.includes(record.sessionId)
  );
  if (records.length === 0) {
    return 0;
  }

  const presentPoints = records.reduce((score, record) => {
    if (record.status === "Present") {
      return score + 1;
    }

    if (record.status === "Late") {
      return score + 0.5;
    }

    return score;
  }, 0);

  return Math.round((presentPoints / relatedSessions.length) * 100);
}

export function getCandidateTrainingMatrix() {
  return candidateTrainingEnrollments.map((enrollment) => {
    const candidate = candidates.find((item) => item.id === enrollment.candidateId);
    const course = trainingCourses.find((item) => item.id === enrollment.courseId);
    const attempts = candidateAssessmentAttempts.filter(
      (attempt) =>
        attempt.candidateId === enrollment.candidateId &&
        assessmentTemplates.find((template) => template.id === attempt.templateId)?.courseId === enrollment.courseId
    );
    const latestAttempt = attempts.sort((a, b) => Date.parse(b.attemptedAt) - Date.parse(a.attemptedAt))[0];
    const certificate = certificateRecords.find(
      (cert) => cert.candidateId === enrollment.candidateId && cert.courseId === enrollment.courseId
    );

    return {
      enrollmentId: enrollment.id,
      candidateId: enrollment.candidateId,
      candidateName: candidate?.name ?? "Unknown",
      courseTitle: course?.title ?? enrollment.courseId,
      progressPercent: enrollment.progressPercent,
      attendancePercent: getAttendancePercent(enrollment.candidateId, enrollment.courseId),
      latestScore: latestAttempt?.score ?? null,
      passed: latestAttempt?.passed ?? false,
      certified: Boolean(certificate),
      status: enrollment.status,
    };
  });
}

export function markAttendance(recordId: string, status: CandidateAttendanceRecord["status"]) {
  const record = candidateAttendanceRecords.find((item) => item.id === recordId);
  if (!record) {
    return null;
  }

  record.status = status;
  record.markedAt = new Date().toISOString();
  record.markedBy = "lms-console";

  return record;
}

function resolveGrade(score: number, gradeScale: GradeScale) {
  if (score >= gradeScale.aMin) {
    return "A";
  }

  if (score >= gradeScale.bPlusMin) {
    return "B+";
  }

  if (score >= gradeScale.bMin) {
    return "B";
  }

  return "C";
}

export function gradeAssessment(attemptId: string, score: number, options?: GradeAssessmentOptions) {
  const attempt = candidateAssessmentAttempts.find((item) => item.id === attemptId);
  if (!attempt) {
    return { ok: false as const, error: "Assessment attempt not found." };
  }

  const template = assessmentTemplates.find((item) => item.id === attempt.templateId);
  if (!template) {
    return { ok: false as const, error: "Assessment template not found." };
  }

  const passThreshold = options?.passThreshold ?? template.passingScore;
  const gradeScale: GradeScale = options?.gradeScale ?? {
    aMin: 85,
    bPlusMin: 75,
    bMin: passThreshold,
  };

  attempt.score = score;
  attempt.passed = score >= passThreshold;
  attempt.gradedBy = "lms-console";
  attempt.attemptedAt = new Date().toISOString();

  if (attempt.passed) {
    const enrollment = candidateTrainingEnrollments.find(
      (item) => item.candidateId === attempt.candidateId && item.courseId === template.courseId
    );
    if (enrollment) {
      enrollment.status = "Completed";
      enrollment.progressPercent = 100;
      enrollment.completedAt = new Date().toISOString();
    }

    const hasCert = certificateRecords.some(
      (cert) => cert.candidateId === attempt.candidateId && cert.courseId === template.courseId
    );
    if (!hasCert) {
      certificateRecords.unshift({
        id: `cert-${certificateRecords.length + 1}`,
        candidateId: attempt.candidateId,
        courseId: template.courseId,
        certificateCode: `GTS-${template.courseId.toUpperCase()}-${Date.now()}`,
        issuedAt: new Date().toISOString(),
        issuedBy: "lms-system",
        grade: resolveGrade(score, gradeScale),
      });
    }
  }

  return { ok: true as const, attempt };
}

export function syncTrainingWorkflowUnlock(candidateId: string) {
  const instance = candidateWorkflowInstances.find((item) => item.candidateId === candidateId);
  if (!instance || instance.currentStageCode !== "LANGUAGE_B2") {
    return null;
  }

  const b2Course = trainingCourses.find((course) => course.level === "B2" && course.category === "Language");
  if (!b2Course) {
    return null;
  }

  const completedB2Enrollment = candidateTrainingEnrollments.find(
    (enrollment) =>
      enrollment.candidateId === candidateId &&
      enrollment.courseId === b2Course.id &&
      enrollment.status === "Completed"
  );

  const b2TemplateIds = assessmentTemplates
    .filter((template) => template.courseId === b2Course.id)
    .map((template) => template.id);
  const passedB2Assessment = candidateAssessmentAttempts.some(
    (attempt) => attempt.candidateId === candidateId && b2TemplateIds.includes(attempt.templateId) && attempt.passed
  );

  if (!completedB2Enrollment || !passedB2Assessment) {
    return null;
  }

  const nextStage = workflowStages.find(
    (stage) => stage.workflowTemplateId === instance.workflowTemplateId && stage.code === "INTERVIEW"
  );
  if (!nextStage) {
    return null;
  }

  const previousStage = instance.currentStageCode;
  const now = new Date().toISOString();

  instance.currentStageCode = "INTERVIEW";
  instance.stageEnteredAt = now;
  instance.stageDueAt = addHours(now, nextStage.slaHours);

  const candidate = candidates.find((item) => item.id === candidateId);
  if (candidate && !candidate.languageLevel) {
    candidate.languageLevel = "B2";
  }

  workflowEvents.unshift({
    id: `wfe-${workflowEvents.length + 1}`,
    instanceId: instance.id,
    eventType: "transition",
    actorId: "lms-auto-unlock",
    payload: {
      fromStage: previousStage,
      toStage: "INTERVIEW",
      note: "Auto-unlocked after B2 completion and passed assessment",
    },
    createdAt: now,
  });

  return {
    from: previousStage,
    to: "INTERVIEW",
  };
}

export function getLmsCollections() {
  return {
    batches: trainingBatches,
    sessions: trainingSessions,
    attendance: candidateAttendanceRecords,
    assessments: candidateAssessmentAttempts,
    templates: assessmentTemplates,
    certificates: certificateRecords,
    enrollments: candidateTrainingEnrollments,
  };
}
