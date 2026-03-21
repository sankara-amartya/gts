"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Search } from 'lucide-react';
import {
    assessmentTemplates,
    candidateAssessmentAttempts as seededAttempts,
    candidateAttendanceRecords as seededAttendance,
    candidateTrainingEnrollments,
    candidates,
    certificateRecords as seededCertificates,
    trainingBatches as seededBatches,
    trainingCategories,
    trainingCourses as allCourses,
    trainingSessions,
} from "@/lib/data";
import { TrainingCourse } from "@/lib/definitions";
import { TrainingTable } from "./training-table";
import { CourseForm } from "./course-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceRegisterTable } from './attendance-register-table';
import { AssessmentsTable } from './assessments-table';
import { CertificatesTable } from './certificates-table';
import { CandidateTrainingMatrixTable } from './candidate-training-matrix-table';
import {
    getCandidateTrainingMatrix,
    gradeAssessment,
    markAttendance,
    syncTrainingWorkflowUnlock,
} from '@/lib/training-lms';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function TrainingPage() {
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
    const [batches, setBatches] = useState(seededBatches);
    const [sessions, setSessions] = useState(trainingSessions);
    const [attendanceRecords, setAttendanceRecords] = useState(seededAttendance);
    const [assessmentAttempts, setAssessmentAttempts] = useState(seededAttempts);
    const [certificates, setCertificates] = useState(seededCertificates);
    const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
    const [passThreshold, setPassThreshold] = useState('70');
    const [gradeAMin, setGradeAMin] = useState('85');
    const [gradeBPlusMin, setGradeBPlusMin] = useState('75');
    const [gradeBMin, setGradeBMin] = useState('70');

    const [newBatchCourseId, setNewBatchCourseId] = useState(allCourses[0]?.id ?? '');
    const [newBatchName, setNewBatchName] = useState('');
    const [newBatchTrainer, setNewBatchTrainer] = useState('');
    const [newBatchStartDate, setNewBatchStartDate] = useState('');
    const [newBatchEndDate, setNewBatchEndDate] = useState('');

    const [newSessionBatchId, setNewSessionBatchId] = useState(seededBatches[0]?.id ?? '');
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [newSessionDateTime, setNewSessionDateTime] = useState('');
    const [newSessionDuration, setNewSessionDuration] = useState('120');

    const filteredCourses = useMemo(() => {
        return allCourses.filter(course =>
            course.title.toLowerCase().includes(search.toLowerCase()) &&
            (categoryFilter === 'all' || course.category === categoryFilter)
        );
    }, [search, categoryFilter]);

    const trainingMatrixRows = useMemo(() => {
        return getCandidateTrainingMatrix();
    }, [attendanceRecords, assessmentAttempts, certificates]);

    const handleMarkAttendance = (recordId: string, status: "Present" | "Absent" | "Late") => {
        const updated = markAttendance(recordId, status);
        if (!updated) {
            return;
        }

        setAttendanceRecords((current) =>
            current.map((record) => (record.id === recordId ? { ...updated } : record))
        );

        toast({
            title: 'Attendance updated',
            description: `Attendance marked as ${status}.`,
        });
    };

    const handleScoreDraftChange = (attemptId: string, score: string) => {
        setScoreDrafts((current) => ({
            ...current,
            [attemptId]: score,
        }));
    };

    const parseNumberConfig = () => {
        const parsedPass = Number(passThreshold);
        const parsedA = Number(gradeAMin);
        const parsedBPlus = Number(gradeBPlusMin);
        const parsedB = Number(gradeBMin);

        if ([parsedPass, parsedA, parsedBPlus, parsedB].some((value) => Number.isNaN(value))) {
            return null;
        }

        return {
            pass: parsedPass,
            scale: {
                aMin: parsedA,
                bPlusMin: parsedBPlus,
                bMin: parsedB,
            },
        };
    };

    const handleGradeAssessment = (attemptId: string) => {
        const attempt = assessmentAttempts.find((item) => item.id === attemptId);
        if (!attempt) {
            return;
        }

        const rawScore = scoreDrafts[attemptId] ?? String(attempt.score);
        const parsedScore = Number(rawScore);
        if (Number.isNaN(parsedScore)) {
            toast({
                title: 'Invalid score',
                description: 'Please enter a valid numeric score.',
                variant: 'destructive',
            });
            return;
        }

        const gradingConfig = parseNumberConfig();
        if (!gradingConfig) {
            toast({
                title: 'Invalid grading controls',
                description: 'Pass threshold and grade cutoffs must be numeric.',
                variant: 'destructive',
            });
            return;
        }

        if (!(gradingConfig.scale.aMin >= gradingConfig.scale.bPlusMin && gradingConfig.scale.bPlusMin >= gradingConfig.scale.bMin)) {
            toast({
                title: 'Invalid grade scale order',
                description: 'A cutoff should be >= B+ cutoff, and B+ cutoff should be >= B cutoff.',
                variant: 'destructive',
            });
            return;
        }

        const result = gradeAssessment(attemptId, parsedScore, {
            passThreshold: gradingConfig.pass,
            gradeScale: gradingConfig.scale,
        });
        if (!result.ok) {
            toast({
                title: 'Assessment update failed',
                description: result.error,
                variant: 'destructive',
            });
            return;
        }

        setAssessmentAttempts((current) =>
            current.map((item) => (item.id === attemptId ? { ...result.attempt } : item))
        );
        setCertificates([...seededCertificates]);

        const workflowMove = syncTrainingWorkflowUnlock(result.attempt.candidateId);

        toast({
            title: result.attempt.passed ? 'Assessment passed' : 'Assessment failed',
            description: workflowMove
                ? `Workflow auto-unlocked: ${workflowMove.from} -> ${workflowMove.to}.`
                : 'Assessment results saved and LMS updated.',
            variant: result.attempt.passed ? 'default' : 'destructive',
        });
    };

    const handleCreateBatch = () => {
        if (!newBatchCourseId || !newBatchName || !newBatchTrainer || !newBatchStartDate || !newBatchEndDate) {
            toast({
                title: 'Missing batch details',
                description: 'Please fill all batch fields before creating.',
                variant: 'destructive',
            });
            return;
        }

        const nextBatch = {
            id: `tb-${seededBatches.length + 1}`,
            courseId: newBatchCourseId,
            name: newBatchName,
            startDate: newBatchStartDate,
            endDate: newBatchEndDate,
            trainer: newBatchTrainer,
        };

        seededBatches.unshift(nextBatch);
        setBatches([...seededBatches]);
        setNewSessionBatchId(nextBatch.id);
        setNewBatchName('');
        setNewBatchTrainer('');
        setNewBatchStartDate('');
        setNewBatchEndDate('');

        toast({
            title: 'Batch created',
            description: `${nextBatch.name} is now available for session planning.`,
        });
    };

    const handleCreateSession = () => {
        if (!newSessionBatchId || !newSessionTitle || !newSessionDateTime || !newSessionDuration) {
            toast({
                title: 'Missing session details',
                description: 'Please complete all session fields.',
                variant: 'destructive',
            });
            return;
        }

        const duration = Number(newSessionDuration);
        if (Number.isNaN(duration) || duration <= 0) {
            toast({
                title: 'Invalid duration',
                description: 'Session duration must be a positive number.',
                variant: 'destructive',
            });
            return;
        }

        const batch = batches.find((item) => item.id === newSessionBatchId);
        if (!batch) {
            toast({
                title: 'Batch not found',
                description: 'Please pick a valid batch.',
                variant: 'destructive',
            });
            return;
        }

        const nextSession = {
            id: `ts-${trainingSessions.length + 1}`,
            batchId: newSessionBatchId,
            title: newSessionTitle,
            scheduledAt: new Date(newSessionDateTime).toISOString(),
            durationMinutes: duration,
        };

        trainingSessions.unshift(nextSession);
        setSessions([...trainingSessions]);

        const enrolledCandidates = candidateTrainingEnrollments.filter((enrollment) => enrollment.courseId === batch.courseId);
        const createdAttendance = enrolledCandidates.map((enrollment, index) => ({
            id: `car-${seededAttendance.length + index + 1}`,
            candidateId: enrollment.candidateId,
            sessionId: nextSession.id,
            status: 'Absent' as const,
            markedBy: 'lms-console',
            markedAt: new Date().toISOString(),
        }));

        seededAttendance.unshift(...createdAttendance);
        setAttendanceRecords([...seededAttendance]);

        setNewSessionTitle('');
        setNewSessionDateTime('');
        setNewSessionDuration('120');

        toast({
            title: 'Session created',
            description: `${nextSession.title} created with ${createdAttendance.length} attendance rows.`,
        });
    };

    const toCsvCell = (value: string | number | null | undefined) => {
        const raw = String(value ?? '');
        return `"${raw.replace(/"/g, '""')}"`;
    };

    const downloadCsv = (filename: string, headers: string[], rows: (string | number | null | undefined)[][]) => {
        const csv = [headers.map(toCsvCell).join(','), ...rows.map((row) => row.map(toCsvCell).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportAssessmentsCsv = () => {
        const rows = assessmentAttempts.map((attempt) => {
            const candidateName = candidates.find((candidate) => candidate.id === attempt.candidateId)?.name ?? attempt.candidateId;
            const templateName = assessmentTemplates.find((template) => template.id === attempt.templateId)?.name ?? attempt.templateId;
            return [
                attempt.id,
                candidateName,
                templateName,
                attempt.attemptNo,
                attempt.score,
                attempt.passed ? 'Passed' : 'Failed',
                attempt.gradedBy,
                attempt.attemptedAt,
            ];
        });

        downloadCsv(
            `assessments-${new Date().toISOString().slice(0, 10)}.csv`,
            ['Attempt ID', 'Candidate', 'Assessment', 'Attempt No', 'Score', 'Result', 'Graded By', 'Attempted At'],
            rows
        );
    };

    const exportCertificatesCsv = () => {
        const rows = certificates.map((certificate) => {
            const candidateName = candidates.find((candidate) => candidate.id === certificate.candidateId)?.name ?? certificate.candidateId;
            const courseName = allCourses.find((course) => course.id === certificate.courseId)?.title ?? certificate.courseId;
            return [
                certificate.id,
                candidateName,
                courseName,
                certificate.certificateCode,
                certificate.grade ?? 'N/A',
                certificate.issuedBy,
                certificate.issuedAt,
            ];
        });

        downloadCsv(
            `certificates-${new Date().toISOString().slice(0, 10)}.csv`,
            ['Certificate ID', 'Candidate', 'Course', 'Certificate Code', 'Grade', 'Issued By', 'Issued At'],
            rows
        );
    };

    const handleEdit = (course: TrainingCourse) => {
        setSelectedCourse(course);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedCourse(null);
        setDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedCourse(null);
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Training & Assessments">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        className="w-full pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {trainingCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleNew} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Course
                </Button>
            </PageHeader>

            <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                    <p className="text-2xl font-bold">{allCourses.length}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Attendance Records</p>
                    <p className="text-2xl font-bold">{attendanceRecords.length}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Assessment Attempts</p>
                    <p className="text-2xl font-bold">{assessmentAttempts.length}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Certificates Issued</p>
                    <p className="text-2xl font-bold">{certificates.length}</p>
                </div>
            </div>

            <Tabs defaultValue="catalog" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="catalog" className="shrink-0">Course Catalog</TabsTrigger>
                    <TabsTrigger value="attendance" className="shrink-0">Attendance</TabsTrigger>
                    <TabsTrigger value="assessments" className="shrink-0">Assessments</TabsTrigger>
                    <TabsTrigger value="certificates" className="shrink-0">Certificates</TabsTrigger>
                    <TabsTrigger value="matrix" className="shrink-0">Candidate Matrix</TabsTrigger>
                </TabsList>
                <TabsContent value="catalog">
                    <TrainingTable courses={filteredCourses} onEdit={handleEdit} />
                </TabsContent>
                <TabsContent value="attendance">
                    <div className="mb-4 grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Batch</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <div className="grid gap-2">
                                    <Label>Course</Label>
                                    <Select value={newBatchCourseId} onValueChange={setNewBatchCourseId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Batch Name</Label>
                                    <Input value={newBatchName} onChange={(event) => setNewBatchName(event.target.value)} placeholder="German B2 - Evening Cohort" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Trainer</Label>
                                    <Input value={newBatchTrainer} onChange={(event) => setNewBatchTrainer(event.target.value)} placeholder="Trainer name" />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Start Date</Label>
                                        <Input type="date" value={newBatchStartDate} onChange={(event) => setNewBatchStartDate(event.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>End Date</Label>
                                        <Input type="date" value={newBatchEndDate} onChange={(event) => setNewBatchEndDate(event.target.value)} />
                                    </div>
                                </div>
                                <Button onClick={handleCreateBatch} className="w-full">Create Batch</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Create Session</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <div className="grid gap-2">
                                    <Label>Batch</Label>
                                    <Select value={newSessionBatchId} onValueChange={setNewSessionBatchId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batches.map((batch) => (
                                                <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Session Title</Label>
                                    <Input value={newSessionTitle} onChange={(event) => setNewSessionTitle(event.target.value)} placeholder="B2 Speaking Drill" />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Scheduled At</Label>
                                        <Input type="datetime-local" value={newSessionDateTime} onChange={(event) => setNewSessionDateTime(event.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Duration (mins)</Label>
                                        <Input value={newSessionDuration} onChange={(event) => setNewSessionDuration(event.target.value)} placeholder="120" />
                                    </div>
                                </div>
                                <Button onClick={handleCreateSession} className="w-full">Create Session & Attendance Rows</Button>
                            </CardContent>
                        </Card>
                    </div>

                    <AttendanceRegisterTable
                        records={attendanceRecords}
                        sessions={sessions}
                        candidates={candidates}
                        onMark={handleMarkAttendance}
                    />
                </TabsContent>
                <TabsContent value="assessments">
                    <div className="mb-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Grading Controls</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-4">
                                <div className="grid gap-2">
                                    <Label>Pass Threshold</Label>
                                    <Input value={passThreshold} onChange={(event) => setPassThreshold(event.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>A Min</Label>
                                    <Input value={gradeAMin} onChange={(event) => setGradeAMin(event.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>B+ Min</Label>
                                    <Input value={gradeBPlusMin} onChange={(event) => setGradeBPlusMin(event.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>B Min</Label>
                                    <Input value={gradeBMin} onChange={(event) => setGradeBMin(event.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Export</CardTitle>
                            </CardHeader>
                            <CardContent className="flex h-full items-center">
                                <Button variant="outline" onClick={exportAssessmentsCsv} className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Assessments CSV
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <AssessmentsTable
                        attempts={assessmentAttempts}
                        templates={assessmentTemplates}
                        candidates={candidates}
                        draftScores={scoreDrafts}
                        onDraftScoreChange={handleScoreDraftChange}
                        onGrade={handleGradeAssessment}
                    />
                </TabsContent>
                <TabsContent value="certificates">
                    <div className="mb-4 flex justify-stretch sm:justify-end">
                        <Button variant="outline" onClick={exportCertificatesCsv} className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Export Certificates CSV
                        </Button>
                    </div>
                    <CertificatesTable
                        certificates={certificates}
                        candidates={candidates}
                        courses={allCourses}
                    />
                </TabsContent>
                <TabsContent value="matrix">
                    <CandidateTrainingMatrixTable rows={trainingMatrixRows} />
                </TabsContent>
            </Tabs>

            <CourseForm open={dialogOpen} onOpenChange={handleDialogClose} course={selectedCourse} />
        </div>
    );
}
