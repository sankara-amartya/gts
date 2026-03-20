import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ComplianceMatrixRow = {
  candidateId: string;
  candidateName: string;
  packId: string;
  packName: string;
  role: string;
  country: string;
  requiredCount: number;
  submittedCount: number;
  verifiedCount: number;
  completion: number;
};

type ComplianceMatrixTableProps = {
  rows: ComplianceMatrixRow[];
};

export function ComplianceMatrixTable({ rows }: ComplianceMatrixTableProps) {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Pack</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Completion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={`${row.candidateId}-${row.packId}`}>
                  <TableCell>{row.candidateName}</TableCell>
                  <TableCell>{row.packName}</TableCell>
                  <TableCell>{row.country}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.requiredCount}</TableCell>
                  <TableCell>{row.submittedCount}</TableCell>
                  <TableCell>{row.verifiedCount}</TableCell>
                  <TableCell>
                    <Badge variant={row.completion === 100 ? "secondary" : row.completion >= 70 ? "outline" : "destructive"}>
                      {row.completion}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">No matrix data found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
