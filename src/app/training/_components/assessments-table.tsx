import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AssessmentTemplate, Candidate, CandidateAssessmentAttempt } from "@/lib/definitions";

type AssessmentsTableProps = {
  attempts: CandidateAssessmentAttempt[];
  templates: AssessmentTemplate[];
  candidates: Candidate[];
  draftScores: Record<string, string>;
  onDraftScoreChange: (attemptId: string, score: string) => void;
  onGrade: (attemptId: string) => void;
};

export function AssessmentsTable({
  attempts,
  templates,
  candidates,
  draftScores,
  onDraftScoreChange,
  onGrade,
}: AssessmentsTableProps) {
  const getCandidateName = (candidateId: string) => candidates.find((item) => item.id === candidateId)?.name ?? "Unknown";
  const getTemplateName = (templateId: string) => templates.find((item) => item.id === templateId)?.name ?? "Unknown Assessment";

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Attempt</TableHead>
              <TableHead>Current Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.length > 0 ? (
              attempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell>{getCandidateName(attempt.candidateId)}</TableCell>
                  <TableCell>{getTemplateName(attempt.templateId)}</TableCell>
                  <TableCell>#{attempt.attemptNo}</TableCell>
                  <TableCell>{attempt.score}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.passed ? "secondary" : "destructive"}>
                      {attempt.passed ? "Passed" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Input
                        value={draftScores[attempt.id] ?? String(attempt.score)}
                        className="w-24"
                        onChange={(event) => onDraftScoreChange(attempt.id, event.target.value)}
                      />
                      <Button size="sm" variant="outline" onClick={() => onGrade(attempt.id)}>
                        Save
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No assessment attempts found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
