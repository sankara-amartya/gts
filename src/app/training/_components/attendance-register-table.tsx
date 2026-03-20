import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Candidate, CandidateAttendanceRecord, TrainingSession } from "@/lib/definitions";

type AttendanceRegisterTableProps = {
  records: CandidateAttendanceRecord[];
  sessions: TrainingSession[];
  candidates: Candidate[];
  onMark: (recordId: string, status: CandidateAttendanceRecord["status"]) => void;
};

export function AttendanceRegisterTable({ records, sessions, candidates, onMark }: AttendanceRegisterTableProps) {
  const getCandidateName = (candidateId: string) => candidates.find((item) => item.id === candidateId)?.name ?? "Unknown";
  const getSessionName = (sessionId: string) => sessions.find((item) => item.id === sessionId)?.title ?? "Unknown Session";

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Marked At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length > 0 ? (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{getCandidateName(record.candidateId)}</TableCell>
                  <TableCell>{getSessionName(record.sessionId)}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === "Present" ? "secondary" : record.status === "Late" ? "outline" : "destructive"}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(record.markedAt).toLocaleString()}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => onMark(record.id, "Present")}>Present</Button>
                    <Button size="sm" variant="outline" onClick={() => onMark(record.id, "Late")}>Late</Button>
                    <Button size="sm" variant="destructive" onClick={() => onMark(record.id, "Absent")}>Absent</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No attendance records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
