"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Search } from 'lucide-react';
import {
    billingProfiles,
    candidates,
    clients,
    dunningCases,
    invoices,
    receipts,
    reconciliationRecords,
    refunds,
    transactionCurrencies,
    transactions,
} from "@/lib/data";
import {
    createBillingProfile,
    createInvoice,
    getFinanceSummary,
    getInvoiceOutstanding,
    getInvoicePaidAmount,
    getInvoiceTotal,
    getPartyName,
    issueRefund,
    recordReceipt,
    reconcileReceipt,
    runDunningCycle,
    sendInvoice,
} from "@/lib/finance-engine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export function FinancePage() {
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [currencyFilter, setCurrencyFilter] = useState('all');

    const [billingState, setBillingState] = useState([...billingProfiles]);
    const [invoiceState, setInvoiceState] = useState([...invoices]);
    const [receiptState, setReceiptState] = useState([...receipts]);
    const [refundState, setRefundState] = useState([...refunds]);
    const [reconciliationState, setReconciliationState] = useState([...reconciliationRecords]);
    const [dunningState, setDunningState] = useState([...dunningCases]);
    const [transactionState, setTransactionState] = useState([...transactions]);

    const [billingCandidateId, setBillingCandidateId] = useState(candidates[0]?.id ?? '');
    const [billingModel, setBillingModel] = useState<'Candidate Pay' | 'Employer Pay' | 'Hybrid'>('Hybrid');
    const [billingCurrency, setBillingCurrency] = useState<'INR' | 'EUR' | 'CAD' | 'NZD' | 'USD' | 'QAR'>('EUR');
    const [billingCandidateShare, setBillingCandidateShare] = useState('30');
    const [billingEmployerShare, setBillingEmployerShare] = useState('70');

    const [invoicePayerType, setInvoicePayerType] = useState<'Candidate' | 'Employer'>('Employer');
    const [invoicePayerId, setInvoicePayerId] = useState(clients[0]?.id ?? '');
    const [invoiceCurrency, setInvoiceCurrency] = useState<'INR' | 'EUR' | 'CAD' | 'NZD' | 'USD' | 'QAR'>('USD');
    const [invoiceDescription, setInvoiceDescription] = useState('Placement service fee');
    const [invoiceAmount, setInvoiceAmount] = useState('2500');
    const [invoiceDueDays, setInvoiceDueDays] = useState('14');
    const [invoiceCandidateId, setInvoiceCandidateId] = useState(candidates[0]?.id ?? '');

    const [receiptInvoiceId, setReceiptInvoiceId] = useState(invoices[0]?.id ?? '');
    const [receiptAmount, setReceiptAmount] = useState('500');
    const [receiptMethod, setReceiptMethod] = useState<'Bank Transfer' | 'Card' | 'Cash' | 'Gateway'>('Bank Transfer');
    const [receiptReference, setReceiptReference] = useState('BANK-REF-1001');

    const [refundInvoiceId, setRefundInvoiceId] = useState(invoices[0]?.id ?? '');
    const [refundAmount, setRefundAmount] = useState('50');
    const [refundReason, setRefundReason] = useState('Adjustment correction');

    const [reconReceiptId, setReconReceiptId] = useState(receipts[0]?.id ?? '');
    const [reconAmount, setReconAmount] = useState('0');
    const [reconReference, setReconReference] = useState('');

    const financeSummary = useMemo(() => getFinanceSummary(), [invoiceState, receiptState, refundState, dunningState]);

    const filteredInvoices = useMemo(() => {
        return invoiceState.filter((invoice) =>
            invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) &&
            (currencyFilter === 'all' || invoice.currency === currencyFilter)
        );
    }, [invoiceState, search, currencyFilter]);

    const filteredTransactions = useMemo(() => {
        return transactionState.filter((txn) =>
            txn.description.toLowerCase().includes(search.toLowerCase()) &&
            (currencyFilter === 'all' || txn.currency === currencyFilter)
        );
    }, [transactionState, search, currencyFilter]);

    const refreshFinanceViews = () => {
        setBillingState([...billingProfiles]);
        setInvoiceState([...invoices]);
        setReceiptState([...receipts]);
        setRefundState([...refunds]);
        setReconciliationState([...reconciliationRecords]);
        setDunningState([...dunningCases]);
        setTransactionState([...transactions]);
    };

    const parsePositiveNumber = (value: string) => {
        const parsed = Number(value);
        if (Number.isNaN(parsed) || parsed <= 0) {
            return null;
        }
        return parsed;
    };

    const handleCreateBillingProfile = () => {
        const candidate = candidates.find((item) => item.id === billingCandidateId);
        if (!candidate) {
            return;
        }

        let candidateShare: number | undefined;
        let employerShare: number | undefined;
        let splitType: 'Percentage' | undefined;

        if (billingModel === 'Hybrid') {
            candidateShare = Number(billingCandidateShare);
            employerShare = Number(billingEmployerShare);
            if (Number.isNaN(candidateShare) || Number.isNaN(employerShare) || candidateShare + employerShare !== 100) {
                toast({
                    title: 'Invalid hybrid split',
                    description: 'Candidate and employer share must add up to 100%.',
                    variant: 'destructive',
                });
                return;
            }
            splitType = 'Percentage';
        }

        createBillingProfile({
            candidateId: candidate.id,
            mandateId: candidate.mandateId,
            model: billingModel,
            currency: billingCurrency,
            splitType,
            candidateShare,
            employerShare,
        });

        refreshFinanceViews();
        toast({
            title: 'Billing profile created',
            description: `${billingModel} model assigned to ${candidate.name}.`,
        });
    };

    const handleCreateInvoice = () => {
        const amount = parsePositiveNumber(invoiceAmount);
        const dueInDays = parsePositiveNumber(invoiceDueDays);
        if (!amount || !dueInDays) {
            toast({
                title: 'Invalid invoice inputs',
                description: 'Amount and due days must be positive values.',
                variant: 'destructive',
            });
            return;
        }

        createInvoice({
            payerType: invoicePayerType,
            payerId: invoicePayerId,
            currency: invoiceCurrency,
            dueInDays,
            candidateId: invoiceCandidateId,
            description: invoiceDescription,
            amount,
        });

        refreshFinanceViews();
        setReceiptInvoiceId(invoices[0]?.id ?? receiptInvoiceId);
        setRefundInvoiceId(invoices[0]?.id ?? refundInvoiceId);
        toast({
            title: 'Invoice created',
            description: 'New draft invoice generated in billing engine.',
        });
    };

    const handleSendInvoice = (invoiceId: string) => {
        const updated = sendInvoice(invoiceId);
        if (!updated) {
            return;
        }
        refreshFinanceViews();
        toast({ title: 'Invoice sent', description: `${updated.invoiceNumber} moved to active billing.` });
    };

    const handleRecordReceipt = () => {
        const amount = parsePositiveNumber(receiptAmount);
        if (!amount) {
            toast({
                title: 'Invalid receipt amount',
                description: 'Receipt amount must be positive.',
                variant: 'destructive',
            });
            return;
        }

        const result = recordReceipt({
            invoiceId: receiptInvoiceId,
            amount,
            method: receiptMethod,
            reference: receiptReference,
        });

        if (!result.ok) {
            toast({ title: 'Receipt failed', description: result.error, variant: 'destructive' });
            return;
        }

        refreshFinanceViews();
        setReconReceiptId(receipts[0]?.id ?? reconReceiptId);
        toast({ title: 'Receipt captured', description: `${result.receipt.receiptNumber} posted and allocated.` });
    };

    const handleIssueRefund = () => {
        const amount = parsePositiveNumber(refundAmount);
        if (!amount) {
            toast({
                title: 'Invalid refund amount',
                description: 'Refund amount must be positive.',
                variant: 'destructive',
            });
            return;
        }

        const result = issueRefund({
            invoiceId: refundInvoiceId,
            amount,
            reason: refundReason,
        });

        if (!result.ok) {
            toast({ title: 'Refund failed', description: result.error, variant: 'destructive' });
            return;
        }

        refreshFinanceViews();
        toast({ title: 'Refund processed', description: `${result.refund.refundNumber} issued successfully.` });
    };

    const handleReconcile = () => {
        const receipt = receiptState.find((item) => item.id === reconReceiptId);
        if (!receipt) {
            return;
        }

        const statementAmount = reconAmount.trim() ? Number(reconAmount) : receipt.amount;
        if (Number.isNaN(statementAmount)) {
            toast({
                title: 'Invalid statement amount',
                description: 'Please enter a valid statement amount.',
                variant: 'destructive',
            });
            return;
        }

        const result = reconcileReceipt(
            reconReceiptId,
            statementAmount,
            reconReference || receipt.bankReference || receipt.gatewayReference || 'MANUAL-REF'
        );
        if (!result.ok) {
            toast({ title: 'Reconciliation failed', description: result.error, variant: 'destructive' });
            return;
        }

        refreshFinanceViews();
        toast({ title: 'Reconciliation updated', description: `Status: ${result.record.status} (${result.record.differenceAmount}).` });
    };

    const handleRunDunning = () => {
        const updated = runDunningCycle();
        refreshFinanceViews();
        toast({
            title: 'Dunning cycle executed',
            description: updated.length > 0 ? `${updated.length} dunning case(s) advanced.` : 'No overdue receivables to remind.',
        });
    };

    const toCsvCell = (value: string | number | undefined | null) => {
        const raw = String(value ?? '');
        return `"${raw.replace(/"/g, '""')}"`;
    };

    const downloadCsv = (filename: string, headers: string[], rows: Array<Array<string | number | undefined | null>>) => {
        const csv = [headers.map(toCsvCell).join(','), ...rows.map((row) => row.map(toCsvCell).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.setAttribute('download', filename);
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    };

    const exportInvoicesCsv = () => {
        const rows = invoiceState.map((invoice) => [
            invoice.invoiceNumber,
            invoice.status,
            invoice.currency,
            getPartyName(invoice.payerType, invoice.payerId),
            getInvoiceTotal(invoice),
            getInvoicePaidAmount(invoice.id),
            getInvoiceOutstanding(invoice.id),
            invoice.issuedAt,
            invoice.dueAt,
        ]);
        downloadCsv('invoices.csv', ['Invoice', 'Status', 'Currency', 'Payer', 'Total', 'Paid', 'Outstanding', 'Issued At', 'Due At'], rows);
    };

    const exportReceiptsCsv = () => {
        const rows = receiptState.map((receipt) => [
            receipt.receiptNumber,
            receipt.currency,
            receipt.amount,
            receipt.method,
            getPartyName(receipt.payerType, receipt.payerId),
            receipt.status,
            receipt.receivedAt,
        ]);
        downloadCsv('receipts.csv', ['Receipt', 'Currency', 'Amount', 'Method', 'Payer', 'Status', 'Received At'], rows);
    };

    const currentPayerOptions = invoicePayerType === 'Employer' ? clients : candidates;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Payments & Finance">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices or transactions..."
                        className="pl-8 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                 <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by currency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Currencies</SelectItem>
                        {transactionCurrencies.map(currency => (
                            <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleRunDunning}>
                    Run Dunning Cycle
                </Button>
            </PageHeader>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Receivable</p><p className="text-xl font-semibold">{financeSummary.totalReceivable.toFixed(2)}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Captured</p><p className="text-xl font-semibold">{financeSummary.totalCaptured.toFixed(2)}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Refunded</p><p className="text-xl font-semibold">{financeSummary.totalRefunded.toFixed(2)}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-semibold">{financeSummary.totalOutstanding.toFixed(2)}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Overdue Invoices</p><p className="text-xl font-semibold">{financeSummary.overdueCount}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Dunning Open</p><p className="text-xl font-semibold">{financeSummary.dunningOpen}</p></CardContent></Card>
            </div>

            <Tabs defaultValue="billing" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                    <TabsTrigger value="billing">Billing Models</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="receipts">Receipts</TabsTrigger>
                    <TabsTrigger value="refunds">Refunds</TabsTrigger>
                    <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
                    <TabsTrigger value="dunning">Dunning</TabsTrigger>
                    <TabsTrigger value="transactions">Ledger</TabsTrigger>
                </TabsList>

                <TabsContent value="billing" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Assign Billing Profile</CardTitle></CardHeader>
                        <CardContent className="grid gap-3 lg:grid-cols-6">
                            <div className="grid gap-2">
                                <Label>Candidate</Label>
                                <Select value={billingCandidateId} onValueChange={setBillingCandidateId}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{candidates.map((candidate) => <SelectItem key={candidate.id} value={candidate.id}>{candidate.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Model</Label>
                                <Select value={billingModel} onValueChange={(value: 'Candidate Pay' | 'Employer Pay' | 'Hybrid') => setBillingModel(value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Candidate Pay">Candidate Pay</SelectItem>
                                        <SelectItem value="Employer Pay">Employer Pay</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Currency</Label>
                                <Select value={billingCurrency} onValueChange={(value: 'INR' | 'EUR' | 'CAD' | 'NZD' | 'USD' | 'QAR') => setBillingCurrency(value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{transactionCurrencies.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Candidate %</Label>
                                <Input value={billingCandidateShare} onChange={(event) => setBillingCandidateShare(event.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Employer %</Label>
                                <Input value={billingEmployerShare} onChange={(event) => setBillingEmployerShare(event.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleCreateBillingProfile}><PlusCircle className="mr-2 h-4 w-4" />Add Profile</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Candidate</TableHead><TableHead>Mandate</TableHead><TableHead>Model</TableHead><TableHead>Currency</TableHead><TableHead>Split</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {billingState.map((profile) => (
                                        <TableRow key={profile.id}>
                                            <TableCell>{candidates.find((item) => item.id === profile.candidateId)?.name ?? profile.candidateId}</TableCell>
                                            <TableCell>{profile.mandateId}</TableCell>
                                            <TableCell><Badge variant="outline">{profile.model}</Badge></TableCell>
                                            <TableCell>{profile.baseCurrency}</TableCell>
                                            <TableCell>{profile.model === 'Hybrid' ? `${profile.candidateShare}% / ${profile.employerShare}%` : '-'}</TableCell>
                                            <TableCell>{new Date(profile.createdAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Create Invoice</CardTitle></CardHeader>
                        <CardContent className="grid gap-3 lg:grid-cols-7">
                            <div className="grid gap-2">
                                <Label>Payer Type</Label>
                                <Select value={invoicePayerType} onValueChange={(value: 'Candidate' | 'Employer') => {
                                    setInvoicePayerType(value);
                                    setInvoicePayerId((value === 'Employer' ? clients[0]?.id : candidates[0]?.id) ?? '');
                                }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Employer">Employer</SelectItem><SelectItem value="Candidate">Candidate</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Payer</Label>
                                <Select value={invoicePayerId} onValueChange={setInvoicePayerId}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{currentPayerOptions.map((party) => <SelectItem key={party.id} value={party.id}>{party.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Candidate</Label>
                                <Select value={invoiceCandidateId} onValueChange={setInvoiceCandidateId}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{candidates.map((candidate) => <SelectItem key={candidate.id} value={candidate.id}>{candidate.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Currency</Label>
                                <Select value={invoiceCurrency} onValueChange={(value: 'INR' | 'EUR' | 'CAD' | 'NZD' | 'USD' | 'QAR') => setInvoiceCurrency(value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{transactionCurrencies.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Amount</Label>
                                <Input value={invoiceAmount} onChange={(event) => setInvoiceAmount(event.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Due (days)</Label>
                                <Input value={invoiceDueDays} onChange={(event) => setInvoiceDueDays(event.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleCreateInvoice}><PlusCircle className="mr-2 h-4 w-4" />Create</Button>
                            </div>
                            <div className="grid gap-2 lg:col-span-7">
                                <Label>Description</Label>
                                <Input value={invoiceDescription} onChange={(event) => setInvoiceDescription(event.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={exportInvoicesCsv}><Download className="mr-2 h-4 w-4" />Export Invoices CSV</Button>
                    </div>

                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Payer</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead>Paid</TableHead><TableHead>Outstanding</TableHead><TableHead>Due</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredInvoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell>{invoice.invoiceNumber}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{getPartyName(invoice.payerType, invoice.payerId)}</div>
                                                <div className="text-xs text-muted-foreground">{invoice.payerType}</div>
                                            </TableCell>
                                            <TableCell><Badge variant={invoice.status === 'Overdue' ? 'destructive' : invoice.status === 'Paid' ? 'default' : 'secondary'}>{invoice.status}</Badge></TableCell>
                                            <TableCell>{invoice.currency} {getInvoiceTotal(invoice).toFixed(2)}</TableCell>
                                            <TableCell>{invoice.currency} {getInvoicePaidAmount(invoice.id).toFixed(2)}</TableCell>
                                            <TableCell>{invoice.currency} {getInvoiceOutstanding(invoice.id).toFixed(2)}</TableCell>
                                            <TableCell>{new Date(invoice.dueAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" onClick={() => handleSendInvoice(invoice.id)}>Send</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="receipts" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Capture Receipt</CardTitle></CardHeader>
                        <CardContent className="grid gap-3 lg:grid-cols-5">
                            <div className="grid gap-2">
                                <Label>Invoice</Label>
                                <Select value={receiptInvoiceId} onValueChange={setReceiptInvoiceId}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{invoiceState.map((invoice) => <SelectItem key={invoice.id} value={invoice.id}>{invoice.invoiceNumber}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Amount</Label>
                                <Input value={receiptAmount} onChange={(event) => setReceiptAmount(event.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Method</Label>
                                <Select value={receiptMethod} onValueChange={(value: 'Bank Transfer' | 'Card' | 'Cash' | 'Gateway') => setReceiptMethod(value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Gateway">Gateway</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Reference</Label>
                                <Input value={receiptReference} onChange={(event) => setReceiptReference(event.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleRecordReceipt}><PlusCircle className="mr-2 h-4 w-4" />Capture</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={exportReceiptsCsv}><Download className="mr-2 h-4 w-4" />Export Receipts CSV</Button>
                    </div>

                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Receipt</TableHead><TableHead>Payer</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Received</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {receiptState.map((receipt) => (
                                        <TableRow key={receipt.id}>
                                            <TableCell>{receipt.receiptNumber}</TableCell>
                                            <TableCell>{getPartyName(receipt.payerType, receipt.payerId)}</TableCell>
                                            <TableCell>{receipt.currency} {receipt.amount.toFixed(2)}</TableCell>
                                            <TableCell>{receipt.method}</TableCell>
                                            <TableCell><Badge variant="outline">{receipt.status}</Badge></TableCell>
                                            <TableCell>{new Date(receipt.receivedAt).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="refunds" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Issue Refund</CardTitle></CardHeader>
                        <CardContent className="grid gap-3 lg:grid-cols-4">
                            <div className="grid gap-2">
                                <Label>Invoice</Label>
                                <Select value={refundInvoiceId} onValueChange={setRefundInvoiceId}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{invoiceState.map((invoice) => <SelectItem key={invoice.id} value={invoice.id}>{invoice.invoiceNumber}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Amount</Label>
                                <Input value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Reason</Label>
                                <Input value={refundReason} onChange={(event) => setRefundReason(event.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleIssueRefund}><PlusCircle className="mr-2 h-4 w-4" />Issue Refund</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Refund</TableHead><TableHead>Invoice</TableHead><TableHead>Payer</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Processed</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {refundState.map((refund) => (
                                        <TableRow key={refund.id}>
                                            <TableCell>{refund.refundNumber}</TableCell>
                                            <TableCell>{invoiceState.find((invoice) => invoice.id === refund.invoiceId)?.invoiceNumber ?? refund.invoiceId}</TableCell>
                                            <TableCell>{getPartyName(refund.payerType, refund.payerId)}</TableCell>
                                            <TableCell>{refund.currency} {refund.amount.toFixed(2)}</TableCell>
                                            <TableCell><Badge variant={refund.status === 'Processed' ? 'default' : 'secondary'}>{refund.status}</Badge></TableCell>
                                            <TableCell>{refund.processedAt ? new Date(refund.processedAt).toLocaleString() : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reconciliation" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Reconcile Bank Statement Entry</CardTitle></CardHeader>
                        <CardContent className="grid gap-3 lg:grid-cols-4">
                            <div className="grid gap-2">
                                <Label>Receipt</Label>
                                <Select value={reconReceiptId} onValueChange={setReconReceiptId}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{receiptState.map((receipt) => <SelectItem key={receipt.id} value={receipt.id}>{receipt.receiptNumber}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Statement Amount</Label>
                                <Input placeholder="Optional, defaults to receipt amount" value={reconAmount} onChange={(event) => setReconAmount(event.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Bank Reference</Label>
                                <Input value={reconReference} onChange={(event) => setReconReference(event.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleReconcile}><PlusCircle className="mr-2 h-4 w-4" />Reconcile</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Receipt</TableHead><TableHead>Reference</TableHead><TableHead>Statement Amount</TableHead><TableHead>Difference</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {reconciliationState.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>{receiptState.find((receipt) => receipt.id === record.receiptId)?.receiptNumber ?? record.receiptId}</TableCell>
                                            <TableCell>{record.bankReference}</TableCell>
                                            <TableCell>{record.statementAmount.toFixed(2)}</TableCell>
                                            <TableCell>{record.differenceAmount.toFixed(2)}</TableCell>
                                            <TableCell><Badge variant={record.status === 'Matched' ? 'default' : record.status === 'Exception' ? 'destructive' : 'secondary'}>{record.status}</Badge></TableCell>
                                            <TableCell>{new Date(record.statementDate).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dunning" className="space-y-4">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between py-4">
                                <p className="text-sm text-muted-foreground">Automated debt collection reminders for overdue invoices.</p>
                                <Button variant="outline" onClick={handleRunDunning}>Run Dunning Cycle</Button>
                            </div>
                            <Table>
                                <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Payer</TableHead><TableHead>Stage</TableHead><TableHead>Status</TableHead><TableHead>Attempts</TableHead><TableHead>Next Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {dunningState.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{invoiceState.find((invoice) => invoice.id === item.invoiceId)?.invoiceNumber ?? item.invoiceId}</TableCell>
                                            <TableCell>{getPartyName(item.payerType, item.payerId)}</TableCell>
                                            <TableCell>{item.stage}</TableCell>
                                            <TableCell><Badge variant={item.status === 'Resolved' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
                                            <TableCell>{item.attemptCount}</TableCell>
                                            <TableCell>{new Date(item.nextActionAt).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Payer</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredTransactions.map((txn) => (
                                        <TableRow key={txn.id}>
                                            <TableCell>{txn.description}</TableCell>
                                            <TableCell>{getPartyName(txn.payerType, txn.payerId)}</TableCell>
                                            <TableCell>{txn.currency} {txn.amount.toFixed(2)}</TableCell>
                                            <TableCell><Badge variant={txn.status === 'Paid' ? 'default' : txn.status === 'Refunded' ? 'outline' : txn.status === 'Failed' ? 'destructive' : 'secondary'}>{txn.status}</Badge></TableCell>
                                            <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
