"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import {
    assessmentTemplates,
    candidateAssessmentAttempts as seededAttempts,
    candidateAttendanceRecords as seededAttendance,
    candidates,
    certificateRecords as seededCertificates,
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

export function TrainingPage() {
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState(seededAttendance);
    const [assessmentAttempts, setAssessmentAttempts] = useState(seededAttempts);
    const [certificates, setCertificates] = useState(seededCertificates);
    const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});

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

        const result = gradeAssessment(attemptId, parsedScore);
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
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        className="pl-8 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {trainingCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleNew}>
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
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                    <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="assessments">Assessments</TabsTrigger>
                    <TabsTrigger value="certificates">Certificates</TabsTrigger>
                    <TabsTrigger value="matrix">Candidate Matrix</TabsTrigger>
                </TabsList>
                <TabsContent value="catalog">
                    <TrainingTable courses={filteredCourses} onEdit={handleEdit} />
                </TabsContent>
                <TabsContent value="attendance">
                    <AttendanceRegisterTable
                        records={attendanceRecords}
                        sessions={trainingSessions}
                        candidates={candidates}
                        onMark={handleMarkAttendance}
                    />
                </TabsContent>
                <TabsContent value="assessments">
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
