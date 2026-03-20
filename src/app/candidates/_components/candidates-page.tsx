"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import { candidates as allCandidates, candidateStatuses, mandates } from "@/lib/data";
import { Candidate } from "@/lib/definitions";
import { CandidatesTable } from "./candidates-table";
import { CandidateForm } from "./candidate-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CandidatesPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [mandateFilter, setMandateFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    const filteredCandidates = useMemo(() => {
        return allCandidates.filter(candidate =>
            (candidate.name.toLowerCase().includes(search.toLowerCase()) ||
             candidate.email.toLowerCase().includes(search.toLowerCase())) &&
            (statusFilter === 'all' || candidate.status === statusFilter) &&
            (mandateFilter === 'all' || candidate.mandateId === mandateFilter)
        );
    }, [search, statusFilter, mandateFilter]);

    const handleEdit = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedCandidate(null);
        setDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedCandidate(null);
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Candidates">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search candidates..."
                        className="pl-8 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                 <Select value={mandateFilter} onValueChange={setMandateFilter}>
                    <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="Filter by mandate" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Mandates</SelectItem>
                        {mandates.map(mandate => (
                            <SelectItem key={mandate.id} value={mandate.id}>{mandate.role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {candidateStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Candidate
                </Button>
            </PageHeader>
            <CandidatesTable candidates={filteredCandidates} onEdit={handleEdit} />
            <CandidateForm open={dialogOpen} onOpenChange={handleDialogClose} candidate={selectedCandidate} />
        </div>
    );
}
