import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Candidate, CandidateDocumentRecord, ComplianceAuditEvent } from "@/lib/definitions";

type ComplianceAuditTableProps = {
  events: ComplianceAuditEvent[];
  candidates: Candidate[];
  documents: CandidateDocumentRecord[];
};

export function ComplianceAuditTable({ events, candidates, documents }: ComplianceAuditTableProps) {
  const getCandidateName = (candidateId: string) => candidates.find((candidate) => candidate.id === candidateId)?.name ?? "Unknown";
  const getDocumentName = (documentId: string) => documents.find((doc) => doc.id === documentId)?.documentName ?? "Unknown";

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{getCandidateName(event.candidateId)}</TableCell>
                  <TableCell>{getDocumentName(event.documentId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.action}</Badge>
                  </TableCell>
                  <TableCell>{event.actor}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[event.oldValue, event.newValue].filter(Boolean).join(" -> ") || event.notes || "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No compliance audit events found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
