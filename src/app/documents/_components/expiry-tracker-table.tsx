import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Candidate, CandidateDocumentRecord } from "@/lib/definitions";
import { getExpiryBadge } from "@/lib/documents-compliance";

type ExpiryTrackerTableProps = {
  documents: CandidateDocumentRecord[];
  candidates: Candidate[];
  onExtend: (documentId: string) => void;
};

export function ExpiryTrackerTable({ documents, candidates, onExtend }: ExpiryTrackerTableProps) {
  const getCandidateName = (candidateId: string) => candidates.find((candidate) => candidate.id === candidateId)?.name ?? "Unknown";

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Reminder Window</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length > 0 ? (
              documents.map((document) => {
                const expiry = getExpiryBadge(document.expiryDate, document.reminderWindowDays ?? 30);
                return (
                  <TableRow key={document.id}>
                    <TableCell>{getCandidateName(document.candidateId)}</TableCell>
                    <TableCell>{document.documentName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={expiry.variant}>{expiry.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{document.reminderWindowDays ?? 30} days</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => onExtend(document.id)}>
                        Extend +30d
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No document expiry records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
