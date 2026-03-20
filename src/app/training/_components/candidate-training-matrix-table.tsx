import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CandidateTrainingMatrixRow = {
  enrollmentId: string;
  candidateId: string;
  candidateName: string;
  courseTitle: string;
  progressPercent: number;
  attendancePercent: number;
  latestScore: number | null;
  passed: boolean;
  certified: boolean;
  status: string;
};

type CandidateTrainingMatrixTableProps = {
  rows: CandidateTrainingMatrixRow[];
};

export function CandidateTrainingMatrixTable({ rows }: CandidateTrainingMatrixTableProps) {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Latest Score</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Certificate</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.enrollmentId}>
                  <TableCell>{row.candidateName}</TableCell>
                  <TableCell>{row.courseTitle}</TableCell>
                  <TableCell>{row.progressPercent}%</TableCell>
                  <TableCell>{row.attendancePercent}%</TableCell>
                  <TableCell>{row.latestScore ?? "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={row.passed ? "secondary" : "destructive"}>
                      {row.passed ? "Passed" : "Pending/Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.certified ? "secondary" : "outline"}>
                      {row.certified ? "Issued" : "Not Issued"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">No training matrix rows found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
