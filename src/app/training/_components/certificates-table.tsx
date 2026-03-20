import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Candidate, CertificateRecord, TrainingCourse } from "@/lib/definitions";

type CertificatesTableProps = {
  certificates: CertificateRecord[];
  candidates: Candidate[];
  courses: TrainingCourse[];
};

export function CertificatesTable({ certificates, candidates, courses }: CertificatesTableProps) {
  const getCandidateName = (candidateId: string) => candidates.find((item) => item.id === candidateId)?.name ?? "Unknown";
  const getCourseName = (courseId: string) => courses.find((item) => item.id === courseId)?.title ?? "Unknown";

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Certificate Code</TableHead>
              <TableHead>Issued At</TableHead>
              <TableHead>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>{getCandidateName(cert.candidateId)}</TableCell>
                  <TableCell>{getCourseName(cert.courseId)}</TableCell>
                  <TableCell className="font-medium">{cert.certificateCode}</TableCell>
                  <TableCell>{new Date(cert.issuedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cert.grade ?? "N/A"}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No certificates issued yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
