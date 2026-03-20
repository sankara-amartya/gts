import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Transaction } from "@/lib/definitions";
import { clients, candidates } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";

type FinanceTableProps = {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
};

export function FinanceTable({ transactions, onEdit }: FinanceTableProps) {
    const getPayerName = (payerType: string, payerId: string) => {
        if (payerType === 'Candidate') {
            return candidates.find(c => c.id === payerId)?.name || 'Unknown';
        }
        return clients.find(c => c.id === payerId)?.name || 'Unknown';
    }

    const getStatusVariant = (status: Transaction['status']) => {
        switch (status) {
            case 'Paid': return 'default';
            case 'Pending': return 'secondary';
            case 'Failed': return 'destructive';
            case 'Refunded': return 'outline';
            default: return 'default';
        }
    }

    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Payer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length > 0 ? transactions.map((txn) => (
                            <TableRow key={txn.id}>
                                <TableCell className="font-medium">{txn.description}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{getPayerName(txn.payerType, txn.payerId)}</div>
                                    <div className="text-sm text-muted-foreground">{txn.payerType}</div>
                                </TableCell>
                                <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: txn.currency }).format(txn.amount)}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(txn.status)}>{txn.status}</Badge>
                                </TableCell>
                                <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Invoice</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(txn)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">No transactions found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
