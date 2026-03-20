import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { CommercialTerm } from "@/lib/definitions";
import { clients, mandates } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type TermsTableProps = {
    terms: CommercialTerm[];
    onEdit: (term: CommercialTerm) => void;
};

export function TermsTable({ terms, onEdit }: TermsTableProps) {
    const getLink = (term: CommercialTerm) => {
        if (term.clientId) {
            const client = clients.find(c => c.id === term.clientId);
            return { type: 'Client', name: client?.name || 'Unknown' };
        }
        if (term.mandateId) {
            const mandate = mandates.find(m => m.id === term.mandateId);
            return { type: 'Mandate', name: mandate?.role || 'Unknown' };
        }
        return { type: 'Unlinked', name: '' };
    }

    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Linked To</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {terms.length > 0 ? terms.map((term) => {
                            const link = getLink(term);
                            return (
                                <TableRow key={term.id}>
                                    <TableCell className="font-medium">{term.title}</TableCell>
                                    <TableCell>
                                        {link.type !== 'Unlinked' && (
                                            <Badge variant="secondary">{link.type}: {link.name}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground max-w-sm truncate">{term.details}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(term)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center">No commercial terms found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
