import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { transactions, trainingCourses } from "@/lib/data";
import { getCandidateLifecycleSnapshot, getCandidateTimeline } from "@/lib/candidate-lifecycle";

const eventTypeLabels: Record<string, string> = {
  workflow: "Workflow",
  document: "Document",
  training: "Training",
  payment: "Payment",
  communication: "Communication",
};

export function CandidateLifecycleDetailPage({ candidateId }: { candidateId: string }) {
  const snapshot = getCandidateLifecycleSnapshot(candidateId);
  if (!snapshot) {
    notFound();
  }

  const timeline = getCandidateTimeline(candidateId);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`${snapshot.candidate.name} - 360 Profile`}>
        <Button asChild variant="outline">
          <Link href="/candidate-lifecycle">Back to Lifecycle</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Workflow Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{snapshot.currentStageLabel ?? "Not assigned"}</p>
            <p className="text-xs text-muted-foreground">Current engine stage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Migration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{snapshot.candidate.migrationStatus}</p>
            <p className="text-xs text-muted-foreground">From candidate profile</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Documents Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {snapshot.documents.filter((doc) => doc.status === "Verified").length}/{snapshot.documents.length}
            </p>
            <p className="text-xs text-muted-foreground">Verification completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risk Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{snapshot.riskFlags.length}</p>
            <p className="text-xs text-muted-foreground">Active lifecycle risks</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This profile combines candidate identity, workflow runtime, document verification, training progress, payments,
                migration status, and communication events.
              </p>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">SLA: {snapshot.slaState ?? "N/A"}</Badge>
                <Badge variant="outline">Documents: {snapshot.documents.length}</Badge>
                <Badge variant="outline">Training Enrollments: {snapshot.training.length}</Badge>
                <Badge variant="outline">Payments: {snapshot.payments.length}</Badge>
                <Badge variant="outline">Comms: {snapshot.communications.length}</Badge>
              </div>
              {snapshot.riskFlags.length > 0 ? (
                <div className="space-y-2">
                  {snapshot.riskFlags.map((risk) => (
                    <Badge key={risk} variant="destructive" className="mr-2">
                      {risk}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Badge variant="secondary">No active risk flags</Badge>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle>Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              <p><span className="font-medium">Nationality:</span> {snapshot.identity?.nationality ?? "N/A"}</p>
              <p><span className="font-medium">Passport:</span> {snapshot.identity?.passportNumber ?? "N/A"}</p>
              <p><span className="font-medium">DOB:</span> {snapshot.identity?.dateOfBirth ?? "N/A"}</p>
              <p><span className="font-medium">Gender:</span> {snapshot.identity?.gender ?? "N/A"}</p>
              <p><span className="font-medium">City:</span> {snapshot.identity?.city ?? "N/A"}</p>
              <p><span className="font-medium">Country:</span> {snapshot.identity?.country ?? "N/A"}</p>
              <p><span className="font-medium">Emergency Contact:</span> {snapshot.identity?.emergencyContactName ?? "N/A"}</p>
              <p><span className="font-medium">Emergency Phone:</span> {snapshot.identity?.emergencyContactPhone ?? "N/A"}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Verifier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>{document.documentName}</TableCell>
                      <TableCell>
                        <Badge variant={document.status === "Verified" ? "secondary" : document.status === "Missing" ? "destructive" : "outline"}>
                          {document.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(document.lastUpdatedAt).toLocaleString()}</TableCell>
                      <TableCell>{document.verifiedBy ?? "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.training.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{trainingCourses.find((course) => course.id === enrollment.courseId)?.title ?? enrollment.courseId}</TableCell>
                      <TableCell>
                        <Badge variant={enrollment.status === "Completed" ? "secondary" : "outline"}>{enrollment.status}</Badge>
                      </TableCell>
                      <TableCell>{enrollment.progressPercent}%</TableCell>
                      <TableCell>{enrollment.score ?? "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.payments.map((payment) => {
                    const transaction = transactions.find((item) => item.id === payment.transactionId);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.category}</TableCell>
                        <TableCell>{transaction?.description ?? payment.notes ?? "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={transaction?.status === "Paid" ? "secondary" : transaction?.status === "Pending" ? "outline" : "destructive"}>
                            {transaction?.status ?? "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction
                            ? new Intl.NumberFormat("en-US", { style: "currency", currency: transaction.currency }).format(transaction.amount)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration">
          <Card>
            <CardHeader>
              <CardTitle>Migration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><span className="font-medium">Current status:</span> {snapshot.candidate.migrationStatus}</p>
              <p><span className="font-medium">Workflow stage:</span> {snapshot.currentStageLabel ?? "N/A"}</p>
              <p><span className="font-medium">SLA state:</span> {snapshot.slaState ?? "N/A"}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.communications.map((message) => (
                <div key={message.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{message.channel}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm">{message.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">{message.direction} by {message.createdBy}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Unified Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.map((event) => (
                <div key={event.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{eventTypeLabels[event.type]}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
