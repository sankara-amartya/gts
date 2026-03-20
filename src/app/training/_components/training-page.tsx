"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import { trainingCourses as allCourses, trainingCategories } from "@/lib/data";
import { TrainingCourse } from "@/lib/definitions";
import { TrainingTable } from "./training-table";
import { CourseForm } from "./course-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TrainingPage() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);

    const filteredCourses = useMemo(() => {
        return allCourses.filter(course =>
            course.title.toLowerCase().includes(search.toLowerCase()) &&
            (categoryFilter === 'all' || course.category === categoryFilter)
        );
    }, [search, categoryFilter]);

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
            <TrainingTable courses={filteredCourses} onEdit={handleEdit} />
            <CourseForm open={dialogOpen} onOpenChange={handleDialogClose} course={selectedCourse} />
        </div>
    );
}
