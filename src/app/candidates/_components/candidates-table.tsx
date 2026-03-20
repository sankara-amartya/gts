import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Candidate } from "@/lib/definitions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { mandates } from "@/lib/data";

type CandidatesTableProps = {
    candidates: Candidate[];
    onEdit: (candidate: Candidate) => void;
};

export function CandidatesTable({ candidates, onEdit }: CandidatesTableProps) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    }

    const getMandateRole = (mandateId: string) => {
        return mandates.find(m => m.id === mandateId)?.role || 'N/A';
    }

    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Mandate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Migration Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {candidates.length > 0 ? candidates.map((candidate) => (
                            <TableRow key={candidate.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{candidate.name}</div>
                                            <div className="text-sm text-muted-foreground">{candidate.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{getMandateRole(candidate.mandateId)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{candidate.status}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{candidate.migrationStatus}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(candidate)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No candidates found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
