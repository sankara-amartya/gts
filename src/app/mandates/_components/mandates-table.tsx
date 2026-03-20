"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Bot } from "lucide-react";
import { Mandate, ProgressUpdate } from "@/lib/definitions";
import { clients, progressUpdates as allProgressUpdates } from "@/lib/data";
import { AiSummaryModal } from "./ai-summary-modal";
import { Card, CardContent } from "@/components/ui/card";

type MandatesTableProps = {
    mandates: Mandate[];
    onEdit: (mandate: Mandate) => void;
};

export function MandatesTable({ mandates, onEdit }: MandatesTableProps) {
    const [summaryModalOpen, setSummaryModalOpen] = useState(false);
    const [selectedMandateForSummary, setSelectedMandateForSummary] = useState<{mandate: Mandate, updates: ProgressUpdate[]} | null>(null);

    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
    };

    const handleGenerateSummary = (mandate: Mandate) => {
        const updates = allProgressUpdates.filter(u => u.mandateId === mandate.id);
        setSelectedMandateForSummary({mandate, updates});
        setSummaryModalOpen(true);
    }
    
    const getStageBadgeVariant = (stage: Mandate['stage']) => {
        switch (stage) {
            case 'Sourcing':
                return 'secondary';
            case 'Interviewing':
                return 'default';
            case 'Offer':
                return 'outline';
            case 'Closed':
                return 'destructive';
            default:
                return 'default';
        }
    }

    return (
        <>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead>Headcount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mandates.length > 0 ? mandates.map((mandate) => (
                                <TableRow key={mandate.id}>
                                    <TableCell className="font-medium">{mandate.role}</TableCell>
                                    <TableCell>{getClientName(mandate.clientId)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStageBadgeVariant(mandate.stage)}>{mandate.stage}</Badge>
                                    </TableCell>
                                    <TableCell>{mandate.headcount}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(mandate)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleGenerateSummary(mandate)}>
                                                    <Bot className="mr-2 h-4 w-4" />
                                                    Generate Summary
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No mandates found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {selectedMandateForSummary && (
                <AiSummaryModal
                    open={summaryModalOpen}
                    onOpenChange={setSummaryModalOpen}
                    mandateInfo={selectedMandateForSummary}
                />
            )}
        </>
    );
}
