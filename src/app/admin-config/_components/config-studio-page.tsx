"use client";

import { useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Download, RotateCcw, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  documentPacks,
  migrationMilestoneTemplates,
  paymentPlanTemplates,
  transactionCurrencies,
  workflowStages,
  workflowTemplates,
} from "@/lib/data";
import type {
  BillingModel,
  MigrationCountry,
  MigrationMilestoneCode,
  MigrationMilestoneTemplate,
  PaymentPlanInstallment,
  PaymentPlanTemplate,
  PaymentPlanTrigger,
  WorkflowStage,
} from "@/lib/definitions";

type DraggableCode = string | null;
type VersionEntry<T> = {
  version: number;
  publishedAt: string;
  snapshot: T;
};

const requiredMigrationMilestones: MigrationMilestoneCode[] = [
  "MEDICAL_EXAMS",
  "PCC",
  "BIOMETRICS",
  "VISA_APPLICATION",
  "EMBASSY_INTERVIEW",
  "TICKETING",
  "DEPLOYMENT",
];

function reorderByIndex<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function validateWorkflowDraft(stages: WorkflowStage[]) {
  const codes = stages.map((item) => item.code.trim());
  if (codes.some((code) => code.length === 0)) {
    return "Workflow stage code cannot be empty.";
  }

  if (new Set(codes).size !== codes.length) {
    return "Workflow stage codes must be unique within a template.";
  }

  if (stages.some((item) => item.slaHours < 0)) {
    return "Workflow SLA hours cannot be negative.";
  }

  return null;
}

function validatePaymentPlanDraft(plan: PaymentPlanTemplate) {
  if (plan.installments.length === 0) {
    return "Payment plan requires at least one installment.";
  }

  if (plan.installments.some((item) => item.percent <= 0)) {
    return "Each installment percent must be greater than zero.";
  }

  const totalPercent = plan.installments.reduce((sum, item) => sum + item.percent, 0);
  if (totalPercent !== 100) {
    return "Installment percentages must total exactly 100.";
  }

  return null;
}

function validateMigrationDraft(milestones: MigrationMilestoneTemplate[]) {
  const codes = milestones.map((item) => item.code);
  const missing = requiredMigrationMilestones.filter((requiredCode) => !codes.includes(requiredCode));

  if (missing.length > 0) {
    return `Missing required migration milestones: ${missing.join(", ")}.`;
  }

  if (new Set(codes).size !== codes.length) {
    return "Migration milestone codes must be unique in a country template.";
  }

  if (milestones.some((item) => (item.slaDays ?? 0) < 0)) {
    return "Migration SLA days cannot be negative.";
  }

  return null;
}

export function ConfigStudioPage() {
  const { toast } = useToast();
  const [draggedId, setDraggedId] = useState<DraggableCode>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedWorkflowTemplateId, setSelectedWorkflowTemplateId] = useState(workflowTemplates[0]?.id ?? "");
  const [selectedPackId, setSelectedPackId] = useState(documentPacks[0]?.id ?? "");
  const [selectedPlanId, setSelectedPlanId] = useState(paymentPlanTemplates[0]?.id ?? "");
  const [selectedCountry, setSelectedCountry] = useState<MigrationCountry>("Germany");

  const [workflowDraft, setWorkflowDraft] = useState(
    workflowStages
      .filter((item) => item.workflowTemplateId === (workflowTemplates[0]?.id ?? ""))
      .sort((a, b) => a.sequence - b.sequence)
      .map((item) => ({ ...item }))
  );

  const [packDocumentsDraft, setPackDocumentsDraft] = useState<string[]>(
    documentPacks.find((item) => item.id === (documentPacks[0]?.id ?? ""))?.documentList ?? []
  );
  const [newPackDocument, setNewPackDocument] = useState("");

  const [planDraft, setPlanDraft] = useState(
    paymentPlanTemplates.find((item) => item.id === (paymentPlanTemplates[0]?.id ?? ""))
      ? { ...paymentPlanTemplates.find((item) => item.id === (paymentPlanTemplates[0]?.id ?? ""))! }
      : {
          id: "ppt-new",
          name: "New Plan",
          model: "Candidate Pay" as BillingModel,
          currency: "USD" as (typeof transactionCurrencies)[number],
          notes: "",
          installments: [],
        }
  );
  const [newInstallmentLabel, setNewInstallmentLabel] = useState("");
  const [newInstallmentPercent, setNewInstallmentPercent] = useState("25");
  const [newInstallmentTrigger, setNewInstallmentTrigger] = useState<PaymentPlanTrigger>("Enrollment");

  const [migrationDraft, setMigrationDraft] = useState(
    migrationMilestoneTemplates
      .filter((item) => item.country === "Germany")
      .sort((a, b) => a.sequence - b.sequence)
      .map((item) => ({ ...item }))
  );

  const [workflowHistory, setWorkflowHistory] = useState<Record<string, VersionEntry<WorkflowStage[]>[]>>(() => {
    const byTemplate: Record<string, VersionEntry<WorkflowStage[]>[]> = {};
    for (const template of workflowTemplates) {
      const snapshot = workflowStages
        .filter((stage) => stage.workflowTemplateId === template.id)
        .sort((a, b) => a.sequence - b.sequence)
        .map((stage) => ({ ...stage }));
      byTemplate[template.id] = [{ version: 1, publishedAt: new Date().toISOString(), snapshot }];
    }
    return byTemplate;
  });
  const [selectedWorkflowVersion, setSelectedWorkflowVersion] = useState<string>("latest");

  const [packHistory, setPackHistory] = useState<Record<string, VersionEntry<string[]>[]>>(() => {
    const byPack: Record<string, VersionEntry<string[]>[]> = {};
    for (const pack of documentPacks) {
      byPack[pack.id] = [{ version: 1, publishedAt: new Date().toISOString(), snapshot: [...pack.documentList] }];
    }
    return byPack;
  });
  const [selectedPackVersion, setSelectedPackVersion] = useState<string>("latest");

  const [planHistory, setPlanHistory] = useState<Record<string, VersionEntry<PaymentPlanTemplate>[]>>(() => {
    const byPlan: Record<string, VersionEntry<PaymentPlanTemplate>[]> = {};
    for (const plan of paymentPlanTemplates) {
      byPlan[plan.id] = [{ version: 1, publishedAt: new Date().toISOString(), snapshot: deepClone(plan) }];
    }
    return byPlan;
  });
  const [selectedPlanVersion, setSelectedPlanVersion] = useState<string>("latest");

  const [migrationHistory, setMigrationHistory] = useState<Record<MigrationCountry, VersionEntry<MigrationMilestoneTemplate[]>[]>>(() => {
    const byCountry: Record<MigrationCountry, VersionEntry<MigrationMilestoneTemplate[]>[]> = {
      GCC: [],
      Germany: [],
      UK: [],
      "USA/Canada": [],
    };
    for (const country of Object.keys(byCountry) as MigrationCountry[]) {
      byCountry[country] = [
        {
          version: 1,
          publishedAt: new Date().toISOString(),
          snapshot: migrationMilestoneTemplates
            .filter((item) => item.country === country)
            .sort((a, b) => a.sequence - b.sequence)
            .map((item) => ({ ...item })),
        },
      ];
    }
    return byCountry;
  });
  const [selectedMigrationVersion, setSelectedMigrationVersion] = useState<string>("latest");

  const countries: MigrationCountry[] = ["GCC", "Germany", "UK", "USA/Canada"];

  const currentPack = useMemo(
    () => documentPacks.find((item) => item.id === selectedPackId),
    [selectedPackId]
  );

  const paymentModels: BillingModel[] = ["Candidate Pay", "Employer Pay", "Hybrid"];
  const installmentTriggers: PaymentPlanTrigger[] = [
    "Enrollment",
    "Document Approval",
    "Visa Filed",
    "Offer Accepted",
    "Pre-Departure",
    "Deployment",
  ];

  const loadWorkflowTemplate = (templateId: string) => {
    setSelectedWorkflowTemplateId(templateId);
    setSelectedWorkflowVersion("latest");
    setWorkflowDraft(
      workflowStages
        .filter((item) => item.workflowTemplateId === templateId)
        .sort((a, b) => a.sequence - b.sequence)
        .map((item) => ({ ...item }))
    );
  };

  const loadPack = (packId: string) => {
    setSelectedPackId(packId);
    setSelectedPackVersion("latest");
    setPackDocumentsDraft(documentPacks.find((item) => item.id === packId)?.documentList ?? []);
  };

  const loadPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setSelectedPlanVersion("latest");
    const selectedPlan = paymentPlanTemplates.find((item) => item.id === planId);
    if (selectedPlan) {
      setPlanDraft({
        ...selectedPlan,
        installments: selectedPlan.installments.map((item) => ({ ...item })),
      });
    }
  };

  const loadCountryTemplate = (country: MigrationCountry) => {
    setSelectedCountry(country);
    setSelectedMigrationVersion("latest");
    setMigrationDraft(
      migrationMilestoneTemplates
        .filter((item) => item.country === country)
        .sort((a, b) => a.sequence - b.sequence)
        .map((item) => ({ ...item }))
    );
  };

  const handleDropReorder = (itemsLength: number, onReorder: (from: number, to: number) => void, targetId: string, ids: string[]) => {
    if (!draggedId) {
      return;
    }
    const fromIndex = ids.indexOf(draggedId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex || fromIndex >= itemsLength || toIndex >= itemsLength) {
      return;
    }
    onReorder(fromIndex, toIndex);
  };

  const getNextVersion = <T,>(history: VersionEntry<T>[]) => (history[history.length - 1]?.version ?? 0) + 1;

  const exportAllConfigs = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      configs: {
        workflowStages,
        documentPacks,
        paymentPlanTemplates,
        migrationMilestoneTemplates,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `config-studio-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast({ title: "Config exported", description: "All studio configurations downloaded as JSON." });
  };

  const importAllConfigs = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        configs?: {
          workflowStages?: WorkflowStage[];
          documentPacks?: typeof documentPacks;
          paymentPlanTemplates?: PaymentPlanTemplate[];
          migrationMilestoneTemplates?: MigrationMilestoneTemplate[];
        };
      };

      if (!parsed.configs?.workflowStages || !parsed.configs.documentPacks || !parsed.configs.paymentPlanTemplates || !parsed.configs.migrationMilestoneTemplates) {
        throw new Error("JSON does not contain a valid config payload.");
      }

      const workflowByTemplate = new Map<string, WorkflowStage[]>();
      for (const stage of parsed.configs.workflowStages) {
        const current = workflowByTemplate.get(stage.workflowTemplateId) ?? [];
        current.push(stage);
        workflowByTemplate.set(stage.workflowTemplateId, current);
      }
      for (const [, stages] of workflowByTemplate) {
        const error = validateWorkflowDraft(stages);
        if (error) {
          throw new Error(error);
        }
      }

      for (const plan of parsed.configs.paymentPlanTemplates) {
        const error = validatePaymentPlanDraft(plan);
        if (error) {
          throw new Error(`Payment plan ${plan.name}: ${error}`);
        }
      }

      const migrationByCountry = new Map<MigrationCountry, MigrationMilestoneTemplate[]>();
      for (const item of parsed.configs.migrationMilestoneTemplates) {
        const current = migrationByCountry.get(item.country) ?? [];
        current.push(item);
        migrationByCountry.set(item.country, current);
      }
      for (const country of countries) {
        const countryMilestones = migrationByCountry.get(country) ?? [];
        const error = validateMigrationDraft(countryMilestones);
        if (error) {
          throw new Error(`${country}: ${error}`);
        }
      }

      workflowStages.splice(0, workflowStages.length, ...deepClone(parsed.configs.workflowStages));
      documentPacks.splice(0, documentPacks.length, ...deepClone(parsed.configs.documentPacks));
      paymentPlanTemplates.splice(0, paymentPlanTemplates.length, ...deepClone(parsed.configs.paymentPlanTemplates));
      migrationMilestoneTemplates.splice(0, migrationMilestoneTemplates.length, ...deepClone(parsed.configs.migrationMilestoneTemplates));

      loadWorkflowTemplate(selectedWorkflowTemplateId);
      loadPack(selectedPackId);
      loadPlan(selectedPlanId);
      loadCountryTemplate(selectedCountry);

      toast({ title: "Config imported", description: "Studio configs were imported and applied." });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Invalid JSON payload.",
        variant: "destructive",
      });
    }
  };

  const saveWorkflowTemplate = () => {
    const workflowError = validateWorkflowDraft(workflowDraft);
    if (workflowError) {
      toast({ title: "Invalid workflow template", description: workflowError, variant: "destructive" });
      return;
    }

    const next = workflowDraft.map((stage, index) => ({ ...stage, sequence: index + 1 }));
    const untouched = workflowStages.filter((item) => item.workflowTemplateId !== selectedWorkflowTemplateId);
    workflowStages.splice(0, workflowStages.length, ...untouched, ...next);

    setWorkflowDraft(next);
    toast({ title: "Workflow template saved", description: "Stage sequence has been updated." });
  };

  const saveDocumentPack = () => {
    const pack = documentPacks.find((item) => item.id === selectedPackId);
    if (!pack) {
      return;
    }

    if (packDocumentsDraft.length === 0) {
      toast({ title: "Invalid pack", description: "Document pack cannot be empty.", variant: "destructive" });
      return;
    }

    pack.documentList = [...packDocumentsDraft];
    toast({ title: "Document pack saved", description: `${pack.name} has been updated.` });
  };

  const savePaymentPlan = () => {
    const error = validatePaymentPlanDraft(planDraft);
    if (error) {
      toast({ title: "Invalid payment plan", description: error, variant: "destructive" });
      return;
    }

    const existingIndex = paymentPlanTemplates.findIndex((item) => item.id === planDraft.id);
    const nextPlan = {
      ...planDraft,
      installments: planDraft.installments.map((item, index) => ({ ...item, id: item.id || `ppi-${Date.now()}-${index}` })),
    };

    if (existingIndex >= 0) {
      paymentPlanTemplates[existingIndex] = nextPlan;
    } else {
      paymentPlanTemplates.unshift({ ...nextPlan, id: `ppt-${paymentPlanTemplates.length + 1}` });
    }

    toast({ title: "Payment plan saved", description: "No-code payment plan configuration updated." });
  };

  const saveMigrationTemplate = () => {
    const migrationError = validateMigrationDraft(migrationDraft);
    if (migrationError) {
      toast({ title: "Invalid migration template", description: migrationError, variant: "destructive" });
      return;
    }

    const normalized = migrationDraft.map((item, index) => ({ ...item, sequence: index + 1 }));
    const untouched = migrationMilestoneTemplates.filter((item) => item.country !== selectedCountry);
    migrationMilestoneTemplates.splice(0, migrationMilestoneTemplates.length, ...untouched, ...normalized);
    setMigrationDraft(normalized);

    toast({ title: "Migration template saved", description: `${selectedCountry} template updated.` });
  };

  const publishWorkflowVersion = () => {
    const workflowError = validateWorkflowDraft(workflowDraft);
    if (workflowError) {
      toast({ title: "Invalid workflow template", description: workflowError, variant: "destructive" });
      return;
    }

    const next = workflowDraft.map((stage, index) => ({ ...stage, sequence: index + 1 }));
    const untouched = workflowStages.filter((item) => item.workflowTemplateId !== selectedWorkflowTemplateId);
    workflowStages.splice(0, workflowStages.length, ...untouched, ...next);
    setWorkflowDraft(next);

    const currentHistory = workflowHistory[selectedWorkflowTemplateId] ?? [];
    const publishedEntry: VersionEntry<WorkflowStage[]> = {
      version: getNextVersion(currentHistory),
      publishedAt: new Date().toISOString(),
      snapshot: deepClone(next),
    };

    setWorkflowHistory((current) => ({
      ...current,
      [selectedWorkflowTemplateId]: [...(current[selectedWorkflowTemplateId] ?? []), publishedEntry],
    }));
    setSelectedWorkflowVersion("latest");
    toast({ title: "Workflow published", description: `Version ${publishedEntry.version} published.` });
  };

  const rollbackWorkflowVersion = () => {
    const history = workflowHistory[selectedWorkflowTemplateId] ?? [];
    if (history.length === 0) {
      return;
    }

    const target =
      selectedWorkflowVersion === "latest"
        ? history[history.length - 1]
        : history.find((entry) => String(entry.version) === selectedWorkflowVersion);
    if (!target) {
      return;
    }

    setWorkflowDraft(target.snapshot.map((item) => ({ ...item })));
    const untouched = workflowStages.filter((item) => item.workflowTemplateId !== selectedWorkflowTemplateId);
    workflowStages.splice(0, workflowStages.length, ...untouched, ...deepClone(target.snapshot));
    toast({ title: "Workflow rolled back", description: `Restored version ${target.version}.` });
  };

  const publishPackVersion = () => {
    if (packDocumentsDraft.length === 0) {
      toast({ title: "Invalid pack", description: "Document pack cannot be empty.", variant: "destructive" });
      return;
    }

    const pack = documentPacks.find((item) => item.id === selectedPackId);
    if (pack) {
      pack.documentList = [...packDocumentsDraft];
    }

    const currentHistory = packHistory[selectedPackId] ?? [];
    const publishedEntry: VersionEntry<string[]> = {
      version: getNextVersion(currentHistory),
      publishedAt: new Date().toISOString(),
      snapshot: [...packDocumentsDraft],
    };

    setPackHistory((current) => ({
      ...current,
      [selectedPackId]: [...(current[selectedPackId] ?? []), publishedEntry],
    }));
    setSelectedPackVersion("latest");
    toast({ title: "Document pack published", description: `Version ${publishedEntry.version} published.` });
  };

  const rollbackPackVersion = () => {
    const history = packHistory[selectedPackId] ?? [];
    if (history.length === 0) {
      return;
    }

    const target =
      selectedPackVersion === "latest"
        ? history[history.length - 1]
        : history.find((entry) => String(entry.version) === selectedPackVersion);
    if (!target) {
      return;
    }

    setPackDocumentsDraft([...target.snapshot]);
    const pack = documentPacks.find((item) => item.id === selectedPackId);
    if (pack) {
      pack.documentList = [...target.snapshot];
    }
    toast({ title: "Document pack rolled back", description: `Restored version ${target.version}.` });
  };

  const publishPlanVersion = () => {
    const error = validatePaymentPlanDraft(planDraft);
    if (error) {
      toast({ title: "Invalid payment plan", description: error, variant: "destructive" });
      return;
    }

    const existingIndex = paymentPlanTemplates.findIndex((item) => item.id === planDraft.id);
    const nextPlan = {
      ...planDraft,
      installments: planDraft.installments.map((item, index) => ({ ...item, id: item.id || `ppi-${Date.now()}-${index}` })),
    };
    if (existingIndex >= 0) {
      paymentPlanTemplates[existingIndex] = nextPlan;
    } else {
      paymentPlanTemplates.unshift({ ...nextPlan, id: `ppt-${paymentPlanTemplates.length + 1}` });
    }

    const currentHistory = planHistory[selectedPlanId] ?? [];
    const publishedEntry: VersionEntry<PaymentPlanTemplate> = {
      version: getNextVersion(currentHistory),
      publishedAt: new Date().toISOString(),
      snapshot: deepClone(nextPlan),
    };
    setPlanHistory((current) => ({
      ...current,
      [selectedPlanId]: [...(current[selectedPlanId] ?? []), publishedEntry],
    }));
    setSelectedPlanVersion("latest");
    toast({ title: "Payment plan published", description: `Version ${publishedEntry.version} published.` });
  };

  const rollbackPlanVersion = () => {
    const history = planHistory[selectedPlanId] ?? [];
    if (history.length === 0) {
      return;
    }

    const target =
      selectedPlanVersion === "latest"
        ? history[history.length - 1]
        : history.find((entry) => String(entry.version) === selectedPlanVersion);
    if (!target) {
      return;
    }

    setPlanDraft(deepClone(target.snapshot));
    const existingIndex = paymentPlanTemplates.findIndex((item) => item.id === target.snapshot.id);
    if (existingIndex >= 0) {
      paymentPlanTemplates[existingIndex] = deepClone(target.snapshot);
    }
    toast({ title: "Payment plan rolled back", description: `Restored version ${target.version}.` });
  };

  const publishMigrationVersion = () => {
    const error = validateMigrationDraft(migrationDraft);
    if (error) {
      toast({ title: "Invalid migration template", description: error, variant: "destructive" });
      return;
    }

    const normalized = migrationDraft.map((item, index) => ({ ...item, sequence: index + 1 }));
    const untouched = migrationMilestoneTemplates.filter((item) => item.country !== selectedCountry);
    migrationMilestoneTemplates.splice(0, migrationMilestoneTemplates.length, ...untouched, ...normalized);
    setMigrationDraft(normalized);

    const currentHistory = migrationHistory[selectedCountry] ?? [];
    const publishedEntry: VersionEntry<MigrationMilestoneTemplate[]> = {
      version: getNextVersion(currentHistory),
      publishedAt: new Date().toISOString(),
      snapshot: deepClone(normalized),
    };

    setMigrationHistory((current) => ({
      ...current,
      [selectedCountry]: [...(current[selectedCountry] ?? []), publishedEntry],
    }));
    setSelectedMigrationVersion("latest");
    toast({ title: "Migration template published", description: `Version ${publishedEntry.version} published.` });
  };

  const rollbackMigrationVersion = () => {
    const history = migrationHistory[selectedCountry] ?? [];
    if (history.length === 0) {
      return;
    }

    const target =
      selectedMigrationVersion === "latest"
        ? history[history.length - 1]
        : history.find((entry) => String(entry.version) === selectedMigrationVersion);
    if (!target) {
      return;
    }

    setMigrationDraft(deepClone(target.snapshot));
    const untouched = migrationMilestoneTemplates.filter((item) => item.country !== selectedCountry);
    migrationMilestoneTemplates.splice(0, migrationMilestoneTemplates.length, ...untouched, ...deepClone(target.snapshot));
    toast({ title: "Migration rolled back", description: `Restored version ${target.version}.` });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Admin / No-Code Config Studio">
        <Badge variant="outline">Drag & Drop Builder</Badge>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              importAllConfigs(file);
            }
            event.currentTarget.value = "";
          }}
        />
        <Button variant="outline" onClick={exportAllConfigs}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Import JSON
        </Button>
      </PageHeader>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="documents">Document Packs</TabsTrigger>
          <TabsTrigger value="payments">Payment Plans</TabsTrigger>
          <TabsTrigger value="migration">Migration Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Select value={selectedWorkflowTemplateId} onValueChange={loadWorkflowTemplate}>
                  <SelectTrigger className="w-[320px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {workflowTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={saveWorkflowTemplate}>Save Workflow</Button>
                <Button variant="secondary" onClick={publishWorkflowVersion}>Publish Version</Button>
                <div className="flex items-center gap-2">
                  <Select value={selectedWorkflowVersion} onValueChange={setSelectedWorkflowVersion}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      {(workflowHistory[selectedWorkflowTemplateId] ?? []).map((entry) => (
                        <SelectItem key={entry.version} value={String(entry.version)}>
                          v{entry.version} - {new Date(entry.publishedAt).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={rollbackWorkflowVersion}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Rollback
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {workflowDraft.map((stage, index) => (
                  <div
                    key={stage.id}
                    draggable
                    onDragStart={() => setDraggedId(stage.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() =>
                      handleDropReorder(
                        workflowDraft.length,
                        (from, to) => setWorkflowDraft((current) => reorderByIndex(current, from, to)),
                        stage.id,
                        workflowDraft.map((item) => item.id)
                      )
                    }
                    className="grid gap-2 rounded-md border p-3 md:grid-cols-[60px_1fr_160px_120px]"
                  >
                    <div className="text-sm text-muted-foreground">#{index + 1}</div>
                    <Input
                      value={stage.label}
                      onChange={(event) =>
                        setWorkflowDraft((current) =>
                          current.map((item) => (item.id === stage.id ? { ...item, label: event.target.value } : item))
                        )
                      }
                    />
                    <Input
                      value={stage.code}
                      onChange={(event) =>
                        setWorkflowDraft((current) =>
                          current.map((item) =>
                            item.id === stage.id ? { ...item, code: event.target.value.trim().toUpperCase() } : item
                          )
                        )
                      }
                      placeholder="STAGE_CODE"
                    />
                    <Input
                      type="number"
                      value={stage.slaHours}
                      onChange={(event) =>
                        setWorkflowDraft((current) =>
                          current.map((item) =>
                            item.id === stage.id ? { ...item, slaHours: Number(event.target.value) || 0 } : item
                          )
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Pack Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Select value={selectedPackId} onValueChange={loadPack}>
                  <SelectTrigger className="w-[360px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {documentPacks.map((pack) => (
                      <SelectItem key={pack.id} value={pack.id}>{pack.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={saveDocumentPack}>Save Pack</Button>
                <Button variant="secondary" onClick={publishPackVersion}>Publish Version</Button>
                <div className="flex items-center gap-2">
                  <Select value={selectedPackVersion} onValueChange={setSelectedPackVersion}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      {(packHistory[selectedPackId] ?? []).map((entry) => (
                        <SelectItem key={entry.version} value={String(entry.version)}>
                          v{entry.version} - {new Date(entry.publishedAt).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={rollbackPackVersion}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Rollback
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input
                  value={newPackDocument}
                  placeholder="Add document requirement"
                  onChange={(event) => setNewPackDocument(event.target.value)}
                />
                <Button
                  onClick={() => {
                    if (!newPackDocument.trim()) {
                      return;
                    }
                    setPackDocumentsDraft((current) => [...current, newPackDocument.trim()]);
                    setNewPackDocument("");
                  }}
                >
                  Add Document
                </Button>
              </div>

              <div className="space-y-2">
                {packDocumentsDraft.map((documentName, index) => (
                  <div
                    key={`${documentName}-${index}`}
                    draggable
                    onDragStart={() => setDraggedId(`${documentName}-${index}`)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      const ids = packDocumentsDraft.map((name, idx) => `${name}-${idx}`);
                      handleDropReorder(
                        packDocumentsDraft.length,
                        (from, to) => setPackDocumentsDraft((current) => reorderByIndex(current, from, to)),
                        `${documentName}-${index}`,
                        ids
                      );
                    }}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <span>{index + 1}. {documentName}</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setPackDocumentsDraft((current) => current.filter((_, idx) => idx !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Editing: {currentPack?.country ?? "N/A"} / {currentPack?.role ?? "N/A"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Plan Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Select value={selectedPlanId} onValueChange={loadPlan}>
                  <SelectTrigger className="w-[360px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentPlanTemplates.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={savePaymentPlan}>Save Plan</Button>
                <Button variant="secondary" onClick={publishPlanVersion}>Publish Version</Button>
                <div className="flex items-center gap-2">
                  <Select value={selectedPlanVersion} onValueChange={setSelectedPlanVersion}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      {(planHistory[selectedPlanId] ?? []).map((entry) => (
                        <SelectItem key={entry.version} value={String(entry.version)}>
                          v{entry.version} - {new Date(entry.publishedAt).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={rollbackPlanVersion}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Rollback
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={planDraft.name}
                    onChange={(event) => setPlanDraft((current) => ({ ...current, name: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select
                    value={planDraft.model}
                    onValueChange={(value: BillingModel) => setPlanDraft((current) => ({ ...current, model: value }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {paymentModels.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={planDraft.currency}
                    onValueChange={(value: (typeof transactionCurrencies)[number]) =>
                      setPlanDraft((current) => ({ ...current, currency: value }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {transactionCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={planDraft.notes ?? ""}
                    onChange={(event) => setPlanDraft((current) => ({ ...current, notes: event.target.value }))}
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Installments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {planDraft.installments.map((installment, index) => (
                    <div
                      key={installment.id}
                      draggable
                      onDragStart={() => setDraggedId(installment.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() =>
                        handleDropReorder(
                          planDraft.installments.length,
                          (from, to) =>
                            setPlanDraft((current) => ({
                              ...current,
                              installments: reorderByIndex(current.installments, from, to),
                            })),
                          installment.id,
                          planDraft.installments.map((item) => item.id)
                        )
                      }
                      className="grid gap-2 rounded-md border p-3 md:grid-cols-[1.6fr_0.6fr_1fr_auto]"
                    >
                      <Input
                        value={installment.label}
                        onChange={(event) =>
                          setPlanDraft((current) => ({
                            ...current,
                            installments: current.installments.map((item) =>
                              item.id === installment.id ? { ...item, label: event.target.value } : item
                            ),
                          }))
                        }
                      />
                      <Input
                        type="number"
                        value={installment.percent}
                        onChange={(event) =>
                          setPlanDraft((current) => ({
                            ...current,
                            installments: current.installments.map((item) =>
                              item.id === installment.id
                                ? { ...item, percent: Number(event.target.value) || 0 }
                                : item
                            ),
                          }))
                        }
                      />
                      <Select
                        value={installment.trigger}
                        onValueChange={(value: PaymentPlanTrigger) =>
                          setPlanDraft((current) => ({
                            ...current,
                            installments: current.installments.map((item) =>
                              item.id === installment.id ? { ...item, trigger: value } : item
                            ),
                          }))
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {installmentTriggers.map((trigger) => (
                            <SelectItem key={trigger} value={trigger}>{trigger}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setPlanDraft((current) => ({
                            ...current,
                            installments: current.installments.filter((item) => item.id !== installment.id),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <div className="grid gap-2 rounded-md border border-dashed p-3 md:grid-cols-[1.6fr_0.6fr_1fr_auto]">
                    <Input value={newInstallmentLabel} placeholder="Installment label" onChange={(event) => setNewInstallmentLabel(event.target.value)} />
                    <Input value={newInstallmentPercent} type="number" onChange={(event) => setNewInstallmentPercent(event.target.value)} />
                    <Select value={newInstallmentTrigger} onValueChange={(value: PaymentPlanTrigger) => setNewInstallmentTrigger(value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {installmentTriggers.map((trigger) => (
                          <SelectItem key={trigger} value={trigger}>{trigger}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        const percent = Number(newInstallmentPercent);
                        if (!newInstallmentLabel.trim() || Number.isNaN(percent)) {
                          return;
                        }
                        const nextInstallment: PaymentPlanInstallment = {
                          id: `ppi-${Date.now()}`,
                          label: newInstallmentLabel.trim(),
                          percent,
                          trigger: newInstallmentTrigger,
                        };
                        setPlanDraft((current) => ({ ...current, installments: [...current.installments, nextInstallment] }));
                        setNewInstallmentLabel("");
                        setNewInstallmentPercent("25");
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Total split: {planDraft.installments.reduce((sum, item) => sum + item.percent, 0)}%
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Template Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Select value={selectedCountry} onValueChange={(value: MigrationCountry) => loadCountryTemplate(value)}>
                  <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={saveMigrationTemplate}>Save Migration Template</Button>
                <Button variant="secondary" onClick={publishMigrationVersion}>Publish Version</Button>
                <div className="flex items-center gap-2">
                  <Select value={selectedMigrationVersion} onValueChange={setSelectedMigrationVersion}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      {(migrationHistory[selectedCountry] ?? []).map((entry) => (
                        <SelectItem key={entry.version} value={String(entry.version)}>
                          v{entry.version} - {new Date(entry.publishedAt).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={rollbackMigrationVersion}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Rollback
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {migrationDraft.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    draggable
                    onDragStart={() => setDraggedId(milestone.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() =>
                      handleDropReorder(
                        migrationDraft.length,
                        (from, to) => setMigrationDraft((current) => reorderByIndex(current, from, to)),
                        milestone.id,
                        migrationDraft.map((item) => item.id)
                      )
                    }
                    className="grid gap-2 rounded-md border p-3 md:grid-cols-[60px_1fr_120px]"
                  >
                    <div className="text-sm text-muted-foreground">#{index + 1}</div>
                    <Input
                      value={milestone.label}
                      onChange={(event) =>
                        setMigrationDraft((current) =>
                          current.map((item) =>
                            item.id === milestone.id ? { ...item, label: event.target.value } : item
                          )
                        )
                      }
                    />
                    <Input
                      type="number"
                      value={milestone.slaDays ?? 0}
                      onChange={(event) =>
                        setMigrationDraft((current) =>
                          current.map((item) =>
                            item.id === milestone.id
                              ? { ...item, slaDays: Number(event.target.value) || 0 }
                              : item
                          )
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
