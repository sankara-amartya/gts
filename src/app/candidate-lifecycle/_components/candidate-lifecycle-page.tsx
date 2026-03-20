import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLifecycleListItems } from "@/lib/candidate-lifecycle";

export function CandidateLifecyclePage() {
  const candidates = getLifecycleListItems();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Candidate Lifecycle" />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Mandate</TableHead>
                <TableHead>Workflow Stage</TableHead>
                <TableHead>Migration Status</TableHead>
                <TableHead>Risk Flags</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.candidateId}>
                  <TableCell>
                    <p className="font-medium">{candidate.name}</p>
                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                  </TableCell>
                  <TableCell>{candidate.mandate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{candidate.stage}</Badge>
                  </TableCell>
                  <TableCell>{candidate.migrationStatus}</TableCell>
                  <TableCell>
                    <Badge variant={candidate.openRisks > 0 ? "destructive" : "secondary"}>
                      {candidate.openRisks}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/candidate-lifecycle/${candidate.candidateId}`}>Open 360 Profile</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
