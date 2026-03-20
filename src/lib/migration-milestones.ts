import { candidateMigrationMilestones, migrationMilestoneTemplates } from "@/lib/data";
import type {
  CandidateMigrationMilestone,
  MigrationCountry,
  MigrationMilestoneCode,
  MigrationMilestoneStatus,
} from "@/lib/definitions";

const milestoneOrder: MigrationMilestoneCode[] = [
  "MEDICAL_EXAMS",
  "PCC",
  "BIOMETRICS",
  "VISA_APPLICATION",
  "EMBASSY_INTERVIEW",
  "TICKETING",
  "DEPLOYMENT",
];

function addDays(baseIso: string, days: number) {
  const value = new Date(baseIso);
  value.setDate(value.getDate() + days);
  return value.toISOString();
}

export function getMigrationTemplateByCountry(country: MigrationCountry) {
  return migrationMilestoneTemplates
    .filter((item) => item.country === country)
    .sort((a, b) => a.sequence - b.sequence);
}

export function getCandidateMigrationCountry(candidateId: string): MigrationCountry {
  const record = candidateMigrationMilestones.find((item) => item.candidateId === candidateId);
  return record?.country ?? "Germany";
}

export function getCandidateMigrationMilestones(candidateId: string) {
  const country = getCandidateMigrationCountry(candidateId);
  const template = getMigrationTemplateByCountry(country);

  return template.map((item) => {
    const existing = candidateMigrationMilestones.find(
      (milestone) => milestone.candidateId === candidateId && milestone.code === item.code && milestone.country === country
    );

    if (existing) {
      return existing;
    }

    return {
      id: `cmm-${candidateMigrationMilestones.length + 1}-${item.code}`,
      candidateId,
      country,
      code: item.code,
      status: "Not Started" as MigrationMilestoneStatus,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function updateCandidateMigrationMilestone(
  candidateId: string,
  code: MigrationMilestoneCode,
  status: MigrationMilestoneStatus,
  actorId: string,
  note?: string
): CandidateMigrationMilestone | null {
  const country = getCandidateMigrationCountry(candidateId);
  const now = new Date().toISOString();

  const existing = candidateMigrationMilestones.find(
    (item) => item.candidateId === candidateId && item.code === code && item.country === country
  );

  if (existing) {
    existing.status = status;
    existing.updatedBy = actorId;
    existing.updatedAt = now;
    existing.notes = note ?? existing.notes;
    if (status === "Completed") {
      existing.completedAt = now;
    }
    return existing;
  }

  const template = getMigrationTemplateByCountry(country).find((item) => item.code === code);
  if (!template) {
    return null;
  }

  const created: CandidateMigrationMilestone = {
    id: `cmm-${candidateMigrationMilestones.length + 1}`,
    candidateId,
    country,
    code,
    status,
    updatedBy: actorId,
    updatedAt: now,
    notes: note,
    dueDate: template.slaDays ? addDays(now, template.slaDays) : undefined,
    completedAt: status === "Completed" ? now : undefined,
  };

  candidateMigrationMilestones.unshift(created);
  return created;
}

export function getMigrationCompletion(candidateId: string) {
  const milestones = getCandidateMigrationMilestones(candidateId);
  const completed = milestones.filter((item) => item.status === "Completed").length;
  return {
    completed,
    total: milestoneOrder.length,
    percent: Math.round((completed / milestoneOrder.length) * 100),
  };
}
