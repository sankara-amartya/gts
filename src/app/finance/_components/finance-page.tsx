"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import { transactions as allTransactions, transactionStatuses, transactionCurrencies } from "@/lib/data";
import { Transaction } from "@/lib/definitions";
import { FinanceTable } from "./finance-table";
import { TransactionForm } from "./transaction-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function FinancePage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(txn =>
            txn.description.toLowerCase().includes(search.toLowerCase()) &&
            (statusFilter === 'all' || txn.status === statusFilter)
        );
    }, [search, statusFilter]);

    const handleEdit = (txn: Transaction) => {
        setSelectedTransaction(txn);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedTransaction(null);
        setDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedTransaction(null);
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Payments & Finance">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-8 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {transactionStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Transaction
                </Button>
            </PageHeader>
            <FinanceTable transactions={filteredTransactions} onEdit={handleEdit} />
            <TransactionForm open={dialogOpen} onOpenChange={handleDialogClose} transaction={selectedTransaction} />
        </div>
    );
}
