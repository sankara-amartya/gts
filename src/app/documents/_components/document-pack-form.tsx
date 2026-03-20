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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DocumentPack } from "@/lib/definitions";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  country: z.string().min(2, "Country is required."),
  role: z.string().min(2, "Role is required."),
  documentList: z.string().min(2, "Documents are required. Enter comma-separated values."),
});

type DocumentPackFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pack: DocumentPack | null;
};

export function DocumentPackForm({ open, onOpenChange, pack }: DocumentPackFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      country: "",
      role: "",
      documentList: "",
    },
  });

  useEffect(() => {
    if (pack) {
      form.reset({
          ...pack,
          documentList: pack.documentList.join(', ')
      });
    } else {
      form.reset({
        name: "",
        country: "",
        role: "",
        documentList: "",
      });
    }
  }, [pack, form, open]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({
        ...values,
        documentList: values.documentList.split(',').map(s => s.trim())
    });
    toast({
      title: pack ? "Pack Updated" : "Pack Created",
      description: `${values.name} has been successfully saved.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{pack ? "Edit Document Pack" : "New Document Pack"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Germany - Registered Nurse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                            <Input placeholder="Germany" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                            <Input placeholder="Registered Nurse" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="documentList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documents</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Passport, Visa Application, ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
