"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { aiMandateSummary, AiMandateSummaryInput } from '@/ai/flows/ai-mandate-summary';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Mandate, ProgressUpdate } from "@/lib/definitions";
import { clients } from '@/lib/data';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Clipboard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

type AiSummaryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mandateInfo: {
    mandate: Mandate;
    updates: ProgressUpdate[];
  };
};

const formSchema = z.object({
  summaryContext: z.enum(['client_communication', 'internal_report']),
});

export function AiSummaryModal({ open, onOpenChange, mandateInfo }: AiSummaryModalProps) {
    const { toast } = useToast();
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { mandate, updates } = mandateInfo;
    const client = clients.find(c => c.id === mandate.clientId);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            summaryContext: 'internal_report',
        },
    });

    const handleGenerate = async (values: z.infer<typeof formSchema>) => {
        if (!client) return;
        setIsLoading(true);
        setSummary(null);

        const input: AiMandateSummaryInput = {
            clientName: client.name,
            mandateTitle: mandate.role,
            currentStage: mandate.stage,
            requiredHeadcount: mandate.headcount,
            associatedFees: mandate.fees,
            progressUpdates: updates.map(u => u.updateText),
            summaryContext: values.summaryContext,
        };
        
        try {
            const result = await aiMandateSummary(input);
            setSummary(result);
        } catch (error) {
            console.error("AI summary generation failed:", error);
            toast({
                title: "Error",
                description: "Failed to generate AI summary.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = () => {
        if (summary) {
            navigator.clipboard.writeText(summary);
            toast({
                title: "Copied to clipboard!",
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Bot className="h-6 w-6 text-primary" />
                        AI Mandate Summary
                    </DialogTitle>
                    <DialogDescription>
                        Generate a concise summary for the "{mandate.role}" mandate.
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="summaryContext"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Summary Context</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select context" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="internal_report">Internal Report</SelectItem>
                                            <SelectItem value="client_communication">Client Communication</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : "Generate Summary"}
                        </Button>
                    </form>
                </Form>
                
                {(isLoading || summary) && <Separator />}
                
                {isLoading && (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                
                {summary && (
                    <div className="space-y-4">
                        <Textarea
                            readOnly
                            value={summary}
                            className="min-h-[120px] text-sm bg-muted/50"
                        />
                        <Button variant="outline" size="sm" onClick={copyToClipboard} className='w-full'>
                            <Clipboard className="mr-2 h-4 w-4" />
                            Copy to Clipboard
                        </Button>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
