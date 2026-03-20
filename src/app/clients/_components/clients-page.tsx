"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import { clients as allClients, clientIndustries } from "@/lib/data";
import { Client } from "@/lib/definitions";
import { ClientsTable } from "./clients-table";
import { ClientForm } from "./client-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ClientsPage() {
    const [search, setSearch] = useState('');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const filteredClients = useMemo(() => {
        return allClients.filter(client =>
            (client.name.toLowerCase().includes(search.toLowerCase()) ||
             client.contactName.toLowerCase().includes(search.toLowerCase())) &&
            (industryFilter === 'all' || client.industry === industryFilter)
        );
    }, [search, industryFilter]);

    const handleEdit = (client: Client) => {
        setSelectedClient(client);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedClient(null);
        setDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedClient(null);
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Clients">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-8 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by industry" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        {clientIndustries.map(industry => (
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Client
                </Button>
            </PageHeader>
            <ClientsTable clients={filteredClients} onEdit={handleEdit} />
            <ClientForm open={dialogOpen} onOpenChange={handleDialogClose} client={selectedClient} />
        </div>
    );
}
