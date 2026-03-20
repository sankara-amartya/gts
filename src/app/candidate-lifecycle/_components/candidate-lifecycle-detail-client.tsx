"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { transactions, trainingCourses } from "@/lib/data";
import { getMigrationTemplateByCountry, updateCandidateMigrationMilestone } from "@/lib/migration-milestones";
import type {
  CandidateDocumentStatus,
  CandidateLifecycleSnapshot,
  MigrationMilestoneCode,
  MigrationMilestoneStatus,
  CandidateTimelineEvent,
} from "@/lib/definitions";

const eventTypeLabels: Record<string, string> = {
  workflow: "Workflow",
  document: "Document",
  training: "Training",
  payment: "Payment",
  communication: "Communication",
  migration: "Migration",
};

const documentStatuses: CandidateDocumentStatus[] = ["Missing", "Submitted", "Verified", "Rejected"];
const migrationStatuses: MigrationMilestoneStatus[] = ["Not Started", "In Progress", "Completed", "Blocked"];

export function CandidateLifecycleDetailClient({
  initialSnapshot,
  initialTimeline,
}: {
  initialSnapshot: CandidateLifecycleSnapshot;
  initialTimeline: CandidateTimelineEvent[];
}) {
  const { toast } = useToast();
  const [identity, setIdentity] = useState(initialSnapshot.identity);
  const [documents, setDocuments] = useState(initialSnapshot.documents);
  const [migrationMilestones, setMigrationMilestones] = useState(initialSnapshot.migrationMilestones);
  const [timeline, setTimeline] = useState(initialTimeline);

  const migrationTemplate = useMemo(
    () => getMigrationTemplateByCountry(initialSnapshot.migrationCountry),
    [initialSnapshot.migrationCountry]
  );

  const migrationCompletion = useMemo(() => {
    const completed = migrationMilestones.filter((item) => item.status === "Completed").length;
    return {
      completed,
      total: migrationTemplate.length,
      percent: migrationTemplate.length ? Math.round((completed / migrationTemplate.length) * 100) : 0,
    };
  }, [migrationMilestones, migrationTemplate]);

  const verifiedDocumentsCount = useMemo(
    () => documents.filter((doc) => doc.status === "Verified").length,
    [documents]
  );

  const addTimelineEntry = (entry: Omit<CandidateTimelineEvent, "id" | "timestamp">) => {
    const timestamp = new Date().toISOString();
    const id = `timeline-ui-${Math.random().toString(36).slice(2, 10)}`;

    setTimeline((current) =>
      [{ id, timestamp, ...entry }, ...current].sort(
        (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)
      )
    );
  };

  const handleIdentityChange = (field: string, value: string) => {
    setIdentity((current) => {
      const next = current ? { ...current } : { candidateId: initialSnapshot.candidate.id, nationality: "" };
      return {
        ...next,
        [field]: value,
      };
    });
  };

  const handleSaveIdentity = () => {
    addTimelineEntry({
      type: "communication",
      title: "Identity profile updated",
      detail: "Candidate identity details were updated from 360 profile.",
    });

    toast({
      title: "Identity updated",
      description: "Identity changes were applied in this lifecycle session.",
    });
  };

  const handleDocumentStatusChange = (documentId: string, status: CandidateDocumentStatus) => {
    const document = documents.find((item) => item.id === documentId);
    if (!document) {
      return;
    }

    setDocuments((current) =>
      current.map((item) =>
        item.id === documentId
          ? {
              ...item,
              status,
              lastUpdatedAt: new Date().toISOString(),
              verifiedBy: status === "Verified" ? "ops-console" : item.verifiedBy,
            }
          : item
      )
    );

    addTimelineEntry({
      type: "document",
      title: `Document ${status}`,
      detail: `${document.documentName} marked as ${status}`,
    });

    toast({
      title: "Document updated",
      description: `${document.documentName} is now ${status}.`,
    });
  };

  const handleMigrationStatusChange = (code: MigrationMilestoneCode, status: MigrationMilestoneStatus) => {
    const result = updateCandidateMigrationMilestone(
      initialSnapshot.candidate.id,
      code,
      status,
      "ops-lifecycle"
    );

    if (!result) {
      return;
    }

    setMigrationMilestones((current) =>
      current.map((item) => (item.code === result.code ? { ...result } : item))
    );

    addTimelineEntry({
      type: "migration",
      title: `Milestone ${status}`,
      detail: `${result.code} updated for ${result.country}`,
    });

    toast({
      title: "Migration milestone updated",
      description: `${result.code} is now ${status}.`,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`${initialSnapshot.candidate.name} - 360 Profile`}>
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
            <p className="text-lg font-semibold">{initialSnapshot.currentStageLabel ?? "Not assigned"}</p>
            <p className="text-xs text-muted-foreground">Current engine stage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Migration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{initialSnapshot.candidate.migrationStatus}</p>
            <p className="text-xs text-muted-foreground">From candidate profile</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Documents Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {verifiedDocumentsCount}/{documents.length}
            </p>
            <p className="text-xs text-muted-foreground">Verification completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risk Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{initialSnapshot.riskFlags.length}</p>
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
                <Badge variant="outline">SLA: {initialSnapshot.slaState ?? "N/A"}</Badge>
                <Badge variant="outline">Documents: {documents.length}</Badge>
                <Badge variant="outline">Training Enrollments: {initialSnapshot.training.length}</Badge>
                <Badge variant="outline">Payments: {initialSnapshot.payments.length}</Badge>
                <Badge variant="outline">Comms: {initialSnapshot.communications.length}</Badge>
              </div>
              {initialSnapshot.riskFlags.length > 0 ? (
                <div className="space-y-2">
                  {initialSnapshot.riskFlags.map((risk) => (
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
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={identity?.nationality ?? ""}
                  placeholder="Nationality"
                  onChange={(event) => handleIdentityChange("nationality", event.target.value)}
                />
                <Input
                  value={identity?.passportNumber ?? ""}
                  placeholder="Passport Number"
                  onChange={(event) => handleIdentityChange("passportNumber", event.target.value)}
                />
                <Input
                  value={identity?.city ?? ""}
                  placeholder="City"
                  onChange={(event) => handleIdentityChange("city", event.target.value)}
                />
                <Input
                  value={identity?.country ?? ""}
                  placeholder="Country"
                  onChange={(event) => handleIdentityChange("country", event.target.value)}
                />
                <Input
                  value={identity?.emergencyContactName ?? ""}
                  placeholder="Emergency Contact Name"
                  onChange={(event) => handleIdentityChange("emergencyContactName", event.target.value)}
                />
                <Input
                  value={identity?.emergencyContactPhone ?? ""}
                  placeholder="Emergency Contact Phone"
                  onChange={(event) => handleIdentityChange("emergencyContactPhone", event.target.value)}
                />
              </div>
              <Button onClick={handleSaveIdentity}>Save Identity</Button>
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
                    <TableHead>Compliance</TableHead>
                    <TableHead>Update Status</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>{document.documentName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            document.status === "Verified"
                              ? "secondary"
                              : document.status === "Missing"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {document.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            document.complianceStatus === "Non-Compliant"
                              ? "destructive"
                              : document.complianceStatus === "At Risk"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {document.complianceStatus ?? "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={document.status}
                          onValueChange={(value) =>
                            handleDocumentStatusChange(document.id, value as CandidateDocumentStatus)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>{new Date(document.lastUpdatedAt).toLocaleString()}</TableCell>
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
                  {initialSnapshot.training.map((enrollment) => (
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
                  {initialSnapshot.payments.map((payment) => {
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
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Country Template</p>
                  <p className="font-semibold">{initialSnapshot.migrationCountry}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <p className="font-semibold">{initialSnapshot.candidate.migrationStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Workflow Stage</p>
                  <p className="font-semibold">{initialSnapshot.currentStageLabel ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completion</p>
                  <p className="font-semibold">{migrationCompletion.completed}/{migrationCompletion.total} ({migrationCompletion.percent}%)</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Completed At</TableHead>
                    <TableHead>Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {migrationTemplate.map((templateMilestone) => {
                    const progress = migrationMilestones.find((item) => item.code === templateMilestone.code);
                    return (
                      <TableRow key={templateMilestone.id}>
                        <TableCell>
                          <div className="font-medium">{templateMilestone.label}</div>
                          <div className="text-xs text-muted-foreground">SLA {templateMilestone.slaDays ?? "N/A"} days</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              progress?.status === "Completed"
                                ? "secondary"
                                : progress?.status === "Blocked"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {progress?.status ?? "Not Started"}
                          </Badge>
                        </TableCell>
                        <TableCell>{progress?.dueDate ? new Date(progress.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell>{progress?.completedAt ? new Date(progress.completedAt).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell>
                          <Select
                            value={progress?.status ?? "Not Started"}
                            onValueChange={(value) =>
                              handleMigrationStatusChange(templateMilestone.code, value as MigrationMilestoneStatus)
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Set status" />
                            </SelectTrigger>
                            <SelectContent>
                              {migrationStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {initialSnapshot.communications.map((message) => (
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
