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
import { ComplianceMatrixTable } from './compliance-matrix-table';
import { useToast } from '@/hooks/use-toast';
import {
    getCandidateComplianceStatus,
    getComplianceMatrixByCandidate,
    syncWorkflowAutoUnlock,
} from '@/lib/documents-compliance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DocumentsPage() {
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPack, setSelectedPack] = useState<DocumentPack | null>(null);
    const [queueItems, setQueueItems] = useState<DocumentVerificationQueueItem[]>(documentVerificationQueue);
    const [candidateDocuments, setCandidateDocuments] = useState<CandidateDocumentRecord[]>(seededCandidateDocuments ?? []);
    const [auditEvents, setAuditEvents] = useState<ComplianceAuditEvent[]>(complianceAuditEvents);
    const [countryFilter, setCountryFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredPacks = useMemo(() => {
        return allDocumentPacks.filter(pack =>
            pack.name.toLowerCase().includes(search.toLowerCase()) ||
            pack.country.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const complianceSummary = useMemo(() => {
        const docsCollection = candidateDocuments ?? [];
        const byCandidate = candidates.map((candidate) => {
            const docs = docsCollection.filter((document) => document.candidateId === candidate.id);
            return getCandidateComplianceStatus(docs);
        });

        return {
            compliant: byCandidate.filter((status) => status === 'Compliant').length,
            atRisk: byCandidate.filter((status) => status === 'At Risk').length,
            nonCompliant: byCandidate.filter((status) => status === 'Non-Compliant').length,
        };
    }, [candidateDocuments]);

    const availableCountries = useMemo(() => {
        return Array.from(new Set(allDocumentPacks.map((pack) => pack.country))).sort();
    }, []);

    const availableRoles = useMemo(() => {
        return Array.from(new Set(allDocumentPacks.map((pack) => pack.role))).sort();
    }, []);

    const queueFilteredBySearch = useMemo(() => {
        if (!search.trim()) {
            return queueItems.filter((item) => {
                const pack = allDocumentPacks.find((docPack) => docPack.id === item.packId);
                return (
                    (countryFilter === 'all' || pack?.country === countryFilter) &&
                    (roleFilter === 'all' || pack?.role === roleFilter) &&
                    (priorityFilter === 'all' || item.priority === priorityFilter) &&
                    (statusFilter === 'all' || item.queueStatus === statusFilter)
                );
            });
        }

        return queueItems.filter((item) => {
            const candidateName = candidates.find((candidate) => candidate.id === item.candidateId)?.name ?? '';
            const documentName = (candidateDocuments ?? []).find((document) => document.id === item.documentId)?.documentName ?? '';
            const pack = allDocumentPacks.find((docPack) => docPack.id === item.packId);

            return (
                (candidateName.toLowerCase().includes(search.toLowerCase()) ||
                    documentName.toLowerCase().includes(search.toLowerCase())) &&
                (countryFilter === 'all' || pack?.country === countryFilter) &&
                (roleFilter === 'all' || pack?.role === roleFilter) &&
                (priorityFilter === 'all' || item.priority === priorityFilter) &&
                (statusFilter === 'all' || item.queueStatus === statusFilter)
            );
        });
    }, [search, queueItems, candidateDocuments, countryFilter, roleFilter, priorityFilter, statusFilter]);

    const documentsWithExpiry = useMemo(() => {
        return (candidateDocuments ?? []).filter((document) => Boolean(document.expiryDate));
    }, [candidateDocuments]);

    const complianceMatrixRows = useMemo(() => {
        return getComplianceMatrixByCandidate(candidates, candidateDocuments, allDocumentPacks);
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

        let updatedDocuments: CandidateDocumentRecord[] = [];
        setCandidateDocuments((current) => {
            updatedDocuments = current.map((document) =>
                document.id === queueItem.documentId
                    ? {
                          ...document,
                          status: newDocumentStatus,
                          complianceStatus: approved ? 'Compliant' : 'Non-Compliant',
                          verifiedBy: approved ? 'compliance-console' : document.verifiedBy,
                          verifiedAt: approved ? now : document.verifiedAt,
                          lastUpdatedAt: now,
                      }
                    : document
            );
            return updatedDocuments;
        });

        const workflowMove = syncWorkflowAutoUnlock(queueItem.candidateId, updatedDocuments);

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
            description: workflowMove
                ? `Verification updated and workflow auto-unlocked: ${workflowMove.from} -> ${workflowMove.to}.`
                : 'Verification queue and compliance audit updated.',
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

    const handleExportAuditCsv = () => {
        const header = [
            'Timestamp',
            'Candidate',
            'Document',
            'Action',
            'Actor',
            'Old Value',
            'New Value',
            'Notes',
        ];

        const rows = auditEvents.map((event) => {
            const candidateName = candidates.find((candidate) => candidate.id === event.candidateId)?.name ?? 'Unknown';
            const documentName = candidateDocuments.find((document) => document.id === event.documentId)?.documentName ?? 'Unknown';
            return [
                event.timestamp,
                candidateName,
                documentName,
                event.action,
                event.actor,
                event.oldValue ?? '',
                event.newValue ?? '',
                event.notes ?? '',
            ];
        });

        const csv = [header, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `compliance-audit-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: 'Audit report exported',
            description: 'CSV file has been downloaded.',
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

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by country" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {availableCountries.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                    <TabsTrigger value="packs">Document Packs</TabsTrigger>
                    <TabsTrigger value="queue">Verification Queue</TabsTrigger>
                    <TabsTrigger value="expiry">Expiry Tracker</TabsTrigger>
                    <TabsTrigger value="audit">Compliance Audit</TabsTrigger>
                    <TabsTrigger value="matrix">Pack Matrix</TabsTrigger>
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
                    <div className="mb-4 flex justify-end">
                        <Button variant="outline" onClick={handleExportAuditCsv}>Export CSV</Button>
                    </div>
                    <ComplianceAuditTable
                        events={auditEvents}
                        candidates={candidates}
                        documents={candidateDocuments}
                    />
                </TabsContent>
                <TabsContent value="matrix">
                    <ComplianceMatrixTable rows={complianceMatrixRows} />
                </TabsContent>
            </Tabs>

            <DocumentPackForm open={dialogOpen} onOpenChange={handleDialogClose} pack={selectedPack} />
        </div>
    );
}
