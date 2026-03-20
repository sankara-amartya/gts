import {
  candidateCommunications,
  candidateDocuments,
  candidateIdentityProfiles,
  candidatePaymentRecords,
  candidateTrainingEnrollments,
  candidates,
  mandates,
  transactions,
  trainingCourses,
} from "@/lib/data";
import { getCandidateMigrationCountry, getCandidateMigrationMilestones } from "@/lib/migration-milestones";
import type {
  CandidateLifecycleSnapshot,
  CandidateTimelineEvent,
  WorkflowEvent,
} from "@/lib/definitions";
import {
  getCandidateWorkflowInstance,
  getSlaState,
  getStageByCode,
  getWorkflowHistory,
} from "@/lib/workflow-engine";

function mapWorkflowHistoryEventToTimeline(event: WorkflowEvent): CandidateTimelineEvent {
  const fromStage = event.payload.fromStage ?? "Unknown";
  const toStage = event.payload.toStage ?? "Unknown";

  return {
    id: `timeline-${event.id}`,
    timestamp: event.createdAt,
    type: "workflow",
    title: event.eventType === "trigger" ? "Workflow Trigger Executed" : "Workflow Transition",
    detail:
      event.eventType === "trigger"
        ? event.payload.title ?? "Workflow trigger fired."
        : `Moved from ${fromStage} to ${toStage}`,
  };
}

export function getCandidateLifecycleSnapshot(candidateId: string): CandidateLifecycleSnapshot | undefined {
  const candidate = candidates.find((item) => item.id === candidateId);
  if (!candidate) {
    return undefined;
  }

  const identity = candidateIdentityProfiles.find((item) => item.candidateId === candidateId);
  const workflow = getCandidateWorkflowInstance(candidateId);
  const currentStageLabel = workflow
    ? getStageByCode(workflow.workflowTemplateId, workflow.currentStageCode)?.label
    : undefined;
  const slaState = workflow ? getSlaState(workflow) : undefined;

  const documents = candidateDocuments.filter((item) => item.candidateId === candidateId);
  const training = candidateTrainingEnrollments.filter((item) => item.candidateId === candidateId);
  const payments = candidatePaymentRecords.filter((item) => item.candidateId === candidateId);
  const communications = candidateCommunications.filter((item) => item.candidateId === candidateId);
  const migrationCountry = getCandidateMigrationCountry(candidateId);
  const migrationMilestones = getCandidateMigrationMilestones(candidateId);

  const riskFlags: string[] = [];
  if (slaState === "Breached") {
    riskFlags.push("Workflow SLA breached");
  }
  if (documents.some((item) => item.status === "Missing" || item.status === "Rejected")) {
    riskFlags.push("Critical documents missing or rejected");
  }
  if (payments.some((item) => transactions.find((txn) => txn.id === item.transactionId)?.status === "Pending")) {
    riskFlags.push("Pending candidate payment");
  }
  if (migrationMilestones.some((item) => item.status === "Blocked")) {
    riskFlags.push("Blocked migration milestone");
  }

  return {
    candidate,
    identity,
    workflow,
    currentStageLabel,
    slaState,
    documents,
    training,
    payments,
    communications,
    migrationCountry,
    migrationMilestones,
    riskFlags,
  };
}

export function getCandidateTimeline(candidateId: string): CandidateTimelineEvent[] {
  const snapshot = getCandidateLifecycleSnapshot(candidateId);
  if (!snapshot) {
    return [];
  }

  const workflowEvents = snapshot.workflow ? getWorkflowHistory(snapshot.workflow.id) : [];
  const workflowTimeline = workflowEvents.map(mapWorkflowHistoryEventToTimeline);

  const documentTimeline: CandidateTimelineEvent[] = snapshot.documents.map((doc) => ({
    id: `timeline-${doc.id}`,
    timestamp: doc.lastUpdatedAt,
    type: "document",
    title: `Document ${doc.status}`,
    detail: doc.documentName,
  }));

  const trainingTimeline: CandidateTimelineEvent[] = snapshot.training.map((enrollment) => {
    const courseName = trainingCourses.find((course) => course.id === enrollment.courseId)?.title ?? "Course";
    return {
      id: `timeline-${enrollment.id}`,
      timestamp: enrollment.completedAt ?? enrollment.startedAt ?? snapshot.candidate.createdAt,
      type: "training",
      title: `Training ${enrollment.status}`,
      detail: `${courseName} (${enrollment.progressPercent}% complete)`,
    };
  });

  const paymentTimeline: CandidateTimelineEvent[] = snapshot.payments.map((payment) => {
    const txn = transactions.find((item) => item.id === payment.transactionId);
    return {
      id: `timeline-${payment.id}`,
      timestamp: txn?.createdAt ?? snapshot.candidate.createdAt,
      type: "payment",
      title: `Payment ${txn?.status ?? "Logged"}`,
      detail: txn
        ? `${txn.description} (${new Intl.NumberFormat("en-US", { style: "currency", currency: txn.currency }).format(txn.amount)})`
        : payment.notes ?? "Payment record",
    };
  });

  const communicationTimeline: CandidateTimelineEvent[] = snapshot.communications.map((message) => ({
    id: `timeline-${message.id}`,
    timestamp: message.createdAt,
    type: "communication",
    title: `${message.channel} ${message.direction}`,
    detail: message.summary,
  }));

  const migrationTimeline: CandidateTimelineEvent[] = snapshot.migrationMilestones.map((milestone) => ({
    id: `timeline-${milestone.id}`,
    timestamp: milestone.updatedAt,
    type: "migration",
    title: `Migration ${milestone.status}`,
    detail: `${milestone.code} (${snapshot.migrationCountry})`,
  }));

  return [
    ...workflowTimeline,
    ...documentTimeline,
    ...trainingTimeline,
    ...paymentTimeline,
    ...communicationTimeline,
    ...migrationTimeline,
  ].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export function getLifecycleListItems() {
  return candidates.map((candidate) => {
    const snapshot = getCandidateLifecycleSnapshot(candidate.id);
    const mandate = mandates.find((item) => item.id === candidate.mandateId);

    return {
      candidateId: candidate.id,
      name: candidate.name,
      email: candidate.email,
      mandate: mandate?.role ?? "N/A",
      stage: snapshot?.currentStageLabel ?? "Not assigned",
      migrationStatus: candidate.migrationStatus,
      openRisks: snapshot?.riskFlags.length ?? 0,
    };
  });
}
