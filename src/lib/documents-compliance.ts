import {
  candidateWorkflowInstances,
  documentPacks,
  workflowEvents,
  workflowStages,
} from "@/lib/data";
import type {
  Candidate,
  CandidateDocumentRecord,
  DocumentPack,
} from "@/lib/definitions";

export function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) {
    return null;
  }

  const now = new Date();
  const expiry = new Date(expiryDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((expiry.getTime() - now.getTime()) / msPerDay);
}

export function getExpiryBadge(expiryDate?: string, reminderWindowDays = 30) {
  const daysLeft = getDaysUntilExpiry(expiryDate);

  if (daysLeft === null) {
    return { label: "No Expiry", variant: "outline" as const };
  }

  if (daysLeft < 0) {
    return { label: "Expired", variant: "destructive" as const };
  }

  if (daysLeft <= reminderWindowDays) {
    return { label: `Expiring in ${daysLeft}d`, variant: "outline" as const };
  }

  return { label: `Valid (${daysLeft}d)`, variant: "secondary" as const };
}

export function getCandidateComplianceStatus(documents: CandidateDocumentRecord[]) {
  if (documents.some((doc) => doc.status === "Missing" || doc.status === "Rejected")) {
    return "Non-Compliant" as const;
  }

  const hasExpiringSoon = documents.some((doc) => {
    const daysLeft = getDaysUntilExpiry(doc.expiryDate);
    const window = doc.reminderWindowDays ?? 30;
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= window;
  });

  if (hasExpiringSoon || documents.some((doc) => doc.status === "Submitted")) {
    return "At Risk" as const;
  }

  return "Compliant" as const;
}

export function getPackRequirementStats(
  candidateId: string,
  documents: CandidateDocumentRecord[],
  packs: DocumentPack[]
) {
  const candidateDocs = documents.filter((doc) => doc.candidateId === candidateId);
  const packIds = Array.from(new Set(candidateDocs.map((doc) => doc.packId).filter(Boolean))) as string[];

  return packIds.map((packId) => {
    const pack = packs.find((item) => item.id === packId);
    const requiredDocuments = pack?.documentList ?? [];
    const requiredCount = requiredDocuments.length;

    const docsByName = new Map(candidateDocs.filter((doc) => doc.packId === packId).map((doc) => [doc.documentName, doc]));
    const submittedCount = requiredDocuments.filter((docName) => {
      const doc = docsByName.get(docName);
      return doc && (doc.status === "Submitted" || doc.status === "Verified");
    }).length;
    const verifiedCount = requiredDocuments.filter((docName) => docsByName.get(docName)?.status === "Verified").length;

    return {
      packId,
      packName: pack?.name ?? "Unknown Pack",
      role: pack?.role ?? "N/A",
      country: pack?.country ?? "N/A",
      requiredCount,
      submittedCount,
      verifiedCount,
      completion: requiredCount > 0 ? Math.round((submittedCount / requiredCount) * 100) : 0,
    };
  });
}

export function getComplianceMatrixByCandidate(
  candidates: Candidate[],
  documents: CandidateDocumentRecord[],
  packs: DocumentPack[] = documentPacks
) {
  return candidates.flatMap((candidate) => {
    const stats = getPackRequirementStats(candidate.id, documents, packs);
    return stats.map((item) => ({
      candidateId: candidate.id,
      candidateName: candidate.name,
      ...item,
    }));
  });
}

function addHours(baseDateIso: string, hours: number): string {
  const date = new Date(baseDateIso);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function syncWorkflowAutoUnlock(candidateId: string, documents: CandidateDocumentRecord[]) {
  const instance = candidateWorkflowInstances.find((item) => item.candidateId === candidateId);
  if (!instance) {
    return null;
  }

  const candidateDocs = documents.filter((item) => item.candidateId === candidateId);
  const packId = candidateDocs[0]?.packId;
  const pack = packId ? documentPacks.find((item) => item.id === packId) : undefined;
  const requiredDocs = pack?.documentList ?? [];
  if (requiredDocs.length === 0) {
    return null;
  }

  const docsMap = new Map(candidateDocs.map((doc) => [doc.documentName, doc.status]));
  const allSubmitted = requiredDocs.every((docName) => {
    const status = docsMap.get(docName);
    return status === "Submitted" || status === "Verified";
  });
  const allVerified = requiredDocs.every((docName) => docsMap.get(docName) === "Verified");

  const previousStage = instance.currentStageCode;
  let nextStage: string | null = null;

  if (instance.currentStageCode === "DOC_COLLECTION" && allSubmitted) {
    nextStage = "DOC_VERIFICATION";
  } else if (instance.currentStageCode === "DOC_VERIFICATION" && allVerified) {
    nextStage = "PROFILE_APPROVAL";
  }

  if (!nextStage) {
    return null;
  }

  const stage = workflowStages.find(
    (item) => item.workflowTemplateId === instance.workflowTemplateId && item.code === nextStage
  );
  if (!stage) {
    return null;
  }

  const now = new Date().toISOString();
  instance.currentStageCode = nextStage;
  instance.stageEnteredAt = now;
  instance.stageDueAt = addHours(now, stage.slaHours);

  workflowEvents.unshift({
    id: `wfe-${workflowEvents.length + 1}`,
    instanceId: instance.id,
    eventType: "transition",
    actorId: "compliance-auto-unlock",
    payload: {
      fromStage: previousStage,
      toStage: nextStage,
      note: "Auto-unlocked by document compliance rules",
    },
    createdAt: now,
  });

  return {
    from: previousStage,
    to: nextStage,
  };
}
