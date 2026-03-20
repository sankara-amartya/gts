"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Candidate } from "@/lib/definitions";
import { candidateStatuses, mandates } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  mandateId: z.string({ required_error: "Mandate is required." }),
  status: z.enum(candidateStatuses),
  migrationStatus: z.string().min(2, "Migration status is required."),
  knackId: z.string().optional(),
  languageLevel: z.string().optional(),
  cvUrl: z.string().optional(),
  languageCertificateUrl: z.string().optional(),
});

type CandidateFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
};

export function CandidateForm({ open, onOpenChange, candidate }: CandidateFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "Screening",
      migrationStatus: "",
      knackId: "",
      languageLevel: "",
      cvUrl: "",
      languageCertificateUrl: "",
    },
  });

  useEffect(() => {
    if (candidate) {
      form.reset(candidate);
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        mandateId: undefined,
        status: "Screening",
        migrationStatus: "",
        knackId: "",
        languageLevel: "",
        cvUrl: "",
        languageCertificateUrl: "",
      });
    }
  }, [candidate, form, open]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: candidate ? "Candidate Updated" : "Candidate Created",
      description: `${values.name} has been successfully saved.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{candidate ? "Edit Candidate" : "New Candidate"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telephone</FormLabel>
                        <FormControl>
                            <Input placeholder="123-456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="mandateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mandate</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a mandate" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {mandates.map(mandate => (
                                <SelectItem key={mandate.id} value={mandate.id}>{mandate.role}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {candidateStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="migrationStatus"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Migration Status</FormLabel>
                        <FormControl>
                            <Input placeholder="Visa processing" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="knackId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Knack ID</FormLabel>
                            <FormControl>
                                <Input placeholder="k_jd_01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="languageLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Language Level</FormLabel>
                            <FormControl>
                                <Input placeholder="B1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
              control={form.control}
              name="cvUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CV Upload</FormLabel>
                  <FormControl>
                    <Input type="file" className="pt-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="languageCertificateUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language Certificate Upload</FormLabel>
                  <FormControl>
                    <Input type="file" className="pt-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
