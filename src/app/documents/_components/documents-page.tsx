"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import {
    candidates,
    complianceAuditEvents,
    documentPacks as allDocumentPacks,
    documentVerificationQueue,
    candidateDocuments as seededCandidateDocuments,
} from "@/lib/data";
import { ComplianceAuditEvent, DocumentPack, DocumentVerificationQueueItem, CandidateDocumentRecord } from "@/lib/definitions";
import { DocumentsTable } from "./documents-table";
import { DocumentPackForm } from "./document-pack-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationQueueTable } from './verification-queue-table';
import { ExpiryTrackerTable } from './expiry-tracker-table';
import { ComplianceAuditTable } from './compliance-audit-table';
import { useToast } from '@/hooks/use-toast';
import { getCandidateComplianceStatus } from '@/lib/documents-compliance';

export function DocumentsPage() {
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPack, setSelectedPack] = useState<DocumentPack | null>(null);
    const [queueItems, setQueueItems] = useState<DocumentVerificationQueueItem[]>(documentVerificationQueue);
    const [candidateDocuments, setCandidateDocuments] = useState<CandidateDocumentRecord[]>(seededCandidateDocuments);
    const [auditEvents, setAuditEvents] = useState<ComplianceAuditEvent[]>(complianceAuditEvents);

    const filteredPacks = useMemo(() => {
        return allDocumentPacks.filter(pack =>
            pack.name.toLowerCase().includes(search.toLowerCase()) ||
            pack.country.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const complianceSummary = useMemo(() => {
        const byCandidate = candidates.map((candidate) => {
            const docs = candidateDocuments.filter((document) => document.candidateId === candidate.id);
            return getCandidateComplianceStatus(docs);
        });

        return {
            compliant: byCandidate.filter((status) => status === 'Compliant').length,
            atRisk: byCandidate.filter((status) => status === 'At Risk').length,
            nonCompliant: byCandidate.filter((status) => status === 'Non-Compliant').length,
        };
    }, [candidateDocuments]);

    const queueFilteredBySearch = useMemo(() => {
        if (!search.trim()) {
            return queueItems;
        }

        return queueItems.filter((item) => {
            const candidateName = candidates.find((candidate) => candidate.id === item.candidateId)?.name ?? '';
            const documentName = candidateDocuments.find((document) => document.id === item.documentId)?.documentName ?? '';

            return (
                candidateName.toLowerCase().includes(search.toLowerCase()) ||
                documentName.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, queueItems, candidateDocuments]);

    const documentsWithExpiry = useMemo(() => {
        return candidateDocuments.filter((document) => Boolean(document.expiryDate));
    }, [candidateDocuments]);

    const addAuditEvent = (event: Omit<ComplianceAuditEvent, 'id' | 'timestamp'>) => {
        const newEvent: ComplianceAuditEvent = {
            id: `ca-ui-${Math.random().toString(36).slice(2, 10)}`,
            timestamp: new Date().toISOString(),
            ...event,
        };

        setAuditEvents((current) => [newEvent, ...current]);
    };

    const handleQueueStatusChange = (itemId: string, approved: boolean) => {
        const queueItem = queueItems.find((item) => item.id === itemId);
        if (!queueItem) {
            return;
        }

        const newQueueStatus = approved ? 'Approved' : 'Rejected';
        const newDocumentStatus = approved ? 'Verified' : 'Rejected';
        const now = new Date().toISOString();

        setQueueItems((current) =>
            current.map((item) =>
                item.id === itemId
                    ? {
                          ...item,
                          queueStatus: newQueueStatus,
                          updatedAt: now,
                      }
                    : item
            )
        );

        setCandidateDocuments((current) =>
            current.map((document) =>
                document.id === queueItem.documentId
                    ? {
                          ...document,
                          status: newDocumentStatus,
                          verifiedBy: approved ? 'compliance-console' : document.verifiedBy,
                          verifiedAt: approved ? now : document.verifiedAt,
                          lastUpdatedAt: now,
                      }
                    : document
            )
        );

        addAuditEvent({
            candidateId: queueItem.candidateId,
            documentId: queueItem.documentId,
            action: approved ? 'Verified' : 'Rejected',
            actor: 'compliance-console',
            oldValue: queueItem.queueStatus,
            newValue: newQueueStatus,
            notes: approved ? 'Document approved from verification queue.' : 'Document rejected from verification queue.',
        });

        toast({
            title: approved ? 'Document approved' : 'Document rejected',
            description: 'Verification queue and compliance audit updated.',
            variant: approved ? 'default' : 'destructive',
        });
    };

    const handleExtendExpiry = (documentId: string) => {
        const targetDocument = candidateDocuments.find((document) => document.id === documentId);
        if (!targetDocument || !targetDocument.expiryDate) {
            return;
        }

        const oldExpiry = targetDocument.expiryDate;
        const nextExpiry = new Date(targetDocument.expiryDate);
        nextExpiry.setDate(nextExpiry.getDate() + 30);
        const nextExpiryIso = nextExpiry.toISOString();

        setCandidateDocuments((current) =>
            current.map((document) =>
                document.id === documentId
                    ? {
                          ...document,
                          expiryDate: nextExpiryIso,
                          lastUpdatedAt: new Date().toISOString(),
                      }
                    : document
            )
        );

        addAuditEvent({
            candidateId: targetDocument.candidateId,
            documentId,
            action: 'Expiry Updated',
            actor: 'compliance-console',
            oldValue: oldExpiry,
            newValue: nextExpiryIso,
            notes: 'Extended expiry by 30 days for compliance grace period.',
        });

        toast({
            title: 'Expiry updated',
            description: `${targetDocument.documentName} expiry was extended by 30 days.`,
        });
    };

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
            <PageHeader title="Documents & Compliance">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search packs, candidates, or documents..."
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

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Compliant Candidates</p>
                    <p className="text-2xl font-bold">{complianceSummary.compliant}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">At Risk Candidates</p>
                    <p className="text-2xl font-bold">{complianceSummary.atRisk}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Non-Compliant Candidates</p>
                    <p className="text-2xl font-bold text-destructive">{complianceSummary.nonCompliant}</p>
                </div>
            </div>

            <Tabs defaultValue="packs" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="packs">Document Packs</TabsTrigger>
                    <TabsTrigger value="queue">Verification Queue</TabsTrigger>
                    <TabsTrigger value="expiry">Expiry Tracker</TabsTrigger>
                    <TabsTrigger value="audit">Compliance Audit</TabsTrigger>
                </TabsList>
                <TabsContent value="packs">
                    <DocumentsTable packs={filteredPacks} onEdit={handleEdit} />
                </TabsContent>
                <TabsContent value="queue">
                    <VerificationQueueTable
                        queueItems={queueFilteredBySearch}
                        documents={candidateDocuments}
                        candidates={candidates}
                        packs={allDocumentPacks}
                        onApprove={(itemId) => handleQueueStatusChange(itemId, true)}
                        onReject={(itemId) => handleQueueStatusChange(itemId, false)}
                    />
                </TabsContent>
                <TabsContent value="expiry">
                    <ExpiryTrackerTable
                        documents={documentsWithExpiry}
                        candidates={candidates}
                        onExtend={handleExtendExpiry}
                    />
                </TabsContent>
                <TabsContent value="audit">
                    <ComplianceAuditTable
                        events={auditEvents}
                        candidates={candidates}
                        documents={candidateDocuments}
                    />
                </TabsContent>
            </Tabs>

            <DocumentPackForm open={dialogOpen} onOpenChange={handleDialogClose} pack={selectedPack} />
        </div>
    );
}
