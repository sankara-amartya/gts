"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import { mandates as allMandates, mandateStages, clients } from "@/lib/data";
import { Mandate } from "@/lib/definitions";
import { MandatesTable } from "./mandates-table";
import { MandateForm } from "./mandate-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function MandatesPage() {
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMandate, setSelectedMandate] = useState<Mandate | null>(null);

    const filteredMandates = useMemo(() => {
        return allMandates.filter(mandate =>
            mandate.role.toLowerCase().includes(search.toLowerCase()) &&
            (stageFilter === 'all' || mandate.stage === stageFilter) &&
            (clientFilter === 'all' || mandate.clientId === clientFilter)
        );
    }, [search, stageFilter, clientFilter]);

    const handleEdit = (mandate: Mandate) => {
        setSelectedMandate(mandate);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedMandate(null);
        setDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedMandate(null);
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Mandates">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by role..."
                        className="w-full pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by client" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by stage" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        {mandateStages.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleNew} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Mandate
                </Button>
            </PageHeader>
            <MandatesTable mandates={filteredMandates} onEdit={handleEdit} />
            <MandateForm open={dialogOpen} onOpenChange={handleDialogClose} mandate={selectedMandate} />
        </div>
    );
}
