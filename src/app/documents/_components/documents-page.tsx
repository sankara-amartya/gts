"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import { documentPacks as allDocumentPacks } from "@/lib/data";
import { DocumentPack } from "@/lib/definitions";
import { DocumentsTable } from "./documents-table";
import { DocumentPackForm } from "./document-pack-form";

export function DocumentsPage() {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPack, setSelectedPack] = useState<DocumentPack | null>(null);

    const filteredPacks = useMemo(() => {
        return allDocumentPacks.filter(pack =>
            pack.name.toLowerCase().includes(search.toLowerCase()) ||
            pack.country.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleEdit = (pack: DocumentPack) => {
        setSelectedPack(pack);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedPack(null);
        setDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedPack(null);
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Document Packs">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search document packs..."
                        className="pl-8 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={handleNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Pack
                </Button>
            </PageHeader>
            <DocumentsTable packs={filteredPacks} onEdit={handleEdit} />
            <DocumentPackForm open={dialogOpen} onOpenChange={handleDialogClose} pack={selectedPack} />
        </div>
    );
}
