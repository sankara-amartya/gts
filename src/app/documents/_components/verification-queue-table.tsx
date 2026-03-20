import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Candidate, DocumentPack, DocumentVerificationQueueItem, CandidateDocumentRecord } from "@/lib/definitions";

type VerificationQueueTableProps = {
  queueItems: DocumentVerificationQueueItem[];
  documents: CandidateDocumentRecord[];
  candidates: Candidate[];
  packs: DocumentPack[];
  onApprove: (itemId: string) => void;
  onReject: (itemId: string) => void;
};

export function VerificationQueueTable({
  queueItems,
  documents,
  candidates,
  packs,
  onApprove,
  onReject,
}: VerificationQueueTableProps) {
  const getDocument = (documentId: string) => documents.find((doc) => doc.id === documentId);
  const getCandidateName = (candidateId: string) => candidates.find((candidate) => candidate.id === candidateId)?.name ?? "Unknown";
  const getPackName = (packId: string) => packs.find((pack) => pack.id === packId)?.name ?? "Unknown Pack";

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Pack</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queueItems.length > 0 ? (
              queueItems.map((item) => {
                const document = getDocument(item.documentId);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{getCandidateName(item.candidateId)}</TableCell>
                    <TableCell>{document?.documentName ?? "Unknown"}</TableCell>
                    <TableCell>{getPackName(item.packId)}</TableCell>
                    <TableCell>
                      <Badge variant={item.queueStatus === "Approved" ? "secondary" : item.queueStatus === "Rejected" ? "destructive" : "outline"}>
                        {item.queueStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.priority === "High" ? "destructive" : item.priority === "Medium" ? "outline" : "secondary"}>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onApprove(item.id)} disabled={item.queueStatus === "Approved"}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onReject(item.id)} disabled={item.queueStatus === "Rejected"}>
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No verification items in queue.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
