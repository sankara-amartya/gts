import { CandidateLifecycleDetailPage } from "@/app/candidate-lifecycle/_components/candidate-lifecycle-detail-page";

type CandidateLifecycleDetailRouteProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default async function CandidateLifecycleDetailRoute({ params }: CandidateLifecycleDetailRouteProps) {
  const { candidateId } = await params;
  return <CandidateLifecycleDetailPage candidateId={candidateId} />;
}
