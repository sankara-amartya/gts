"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import { commercialTerms as allTerms } from "@/lib/data";
import { CommercialTerm } from "@/lib/definitions";
import { TermsTable } from "./terms-table";
import { TermForm } from "./term-form";

export function TermsPage() {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<CommercialTerm | null>(null);

    const filteredTerms = useMemo(() => {
        return allTerms.filter(term =>
            term.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleEdit = (term: CommercialTerm) => {
        setSelectedTerm(term);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedTerm(null);
        setDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedTerm(null);
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Commercial Terms">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title..."
                        className="pl-8 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={handleNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Term
                </Button>
            </PageHeader>
            <TermsTable terms={filteredTerms} onEdit={handleEdit} />
            <TermForm open={dialogOpen} onOpenChange={handleDialogClose} term={selectedTerm} />
        </div>
    );
}
