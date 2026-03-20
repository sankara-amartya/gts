import { notFound } from "next/navigation";
import { getCandidateLifecycleSnapshot, getCandidateTimeline } from "@/lib/candidate-lifecycle";
import { CandidateLifecycleDetailClient } from "./candidate-lifecycle-detail-client";

export function CandidateLifecycleDetailPage({ candidateId }: { candidateId: string }) {
  const snapshot = getCandidateLifecycleSnapshot(candidateId);
  if (!snapshot) {
    notFound();
  }

  const timeline = getCandidateTimeline(candidateId);

  return <CandidateLifecycleDetailClient initialSnapshot={snapshot} initialTimeline={timeline} />;
}
