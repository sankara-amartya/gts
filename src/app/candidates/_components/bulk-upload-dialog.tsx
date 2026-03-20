"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";

type BulkUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BulkUploadDialog({ open, onOpenChange }: BulkUploadDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }
    // Here you would process the file
    console.log("Uploading file:", file.name);

    toast({
      title: "Upload Successful",
      description: `${file.name} has been queued for processing.`,
    });
    onOpenChange(false);
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Candidates</DialogTitle>
          <DialogDescription>
            Upload a CSV file with candidate data. Required columns: Name, Email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                    {file ? file.name : "Drag & drop CSV file here"}
                </p>
                <Input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                />
                <label htmlFor="file-upload" className="mt-2 text-sm font-medium text-primary hover:underline cursor-pointer">
                    Or select a file
                </label>
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
