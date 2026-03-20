"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { candidates, workflowTemplates } from "@/lib/data";
import {
  getAllowedTransitions,
  getCandidateWorkflowInstance,
  getSlaState,
  getStageByCode,
  getWorkflowHistory,
  getWorkflowStages,
  moveCandidateToStage,
} from "@/lib/workflow-engine";
import { useToast } from "@/hooks/use-toast";

type SlaVariant = "default" | "secondary" | "outline" | "destructive";

const slaVariantMap: Record<string, SlaVariant> = {
  "On Track": "secondary",
  "At Risk": "outline",
  Breached: "destructive",
};

export function WorkflowsPage() {
  const { toast } = useToast();
  const [templateId, setTemplateId] = useState(workflowTemplates[0]?.id ?? "");
  const [tick, setTick] = useState(0);

  const stages = useMemo(() => {
    return templateId ? getWorkflowStages(templateId) : [];
  }, [templateId, tick]);

  const templateCandidates = useMemo(() => {
    if (!templateId) {
      return [];
    }

    return candidates
      .map((candidate) => {
        const instance = getCandidateWorkflowInstance(candidate.id);
        if (!instance || instance.workflowTemplateId !== templateId) {
          return null;
        }

        const stage = getStageByCode(templateId, instance.currentStageCode);
        const transitions = getAllowedTransitions(candidate.id);
        const history = getWorkflowHistory(instance.id);

        return {
          candidate,
          instance,
          stage,
          transitions,
          history,
          sla: getSlaState(instance),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [templateId, tick]);

  const handleMove = (candidateId: string, transitionId: string) => {
    const result = moveCandidateToStage(candidateId, transitionId, "workflow-console");

    if (!result.ok) {
      toast({
        title: "Transition blocked",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    setTick((current) => current + 1);
    toast({
      title: "Stage updated",
      description: "Candidate moved to the next workflow stage.",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Workflow Engine">
        <Select value={templateId} onValueChange={setTemplateId}>
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Select workflow template" />
          </SelectTrigger>
          <SelectContent>
            {workflowTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} v{template.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Template Stages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stages.map((stage) => (
              <div key={stage.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{stage.sequence}. {stage.label}</p>
                  <Badge variant="outline">{stage.slaHours}h SLA</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Code: {stage.code}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Candidate Runtime</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {templateCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No candidates attached to this workflow.</p>
            ) : (
              templateCandidates.map((item) => (
                <div key={item.candidate.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{item.candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{item.candidate.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{item.stage?.label ?? item.instance.currentStageCode}</Badge>
                      <Badge variant={slaVariantMap[item.sla]}>{item.sla}</Badge>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex flex-wrap gap-2">
                    {item.transitions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No allowed transitions right now.</p>
                    ) : (
                      item.transitions.map((transition) => (
                        <Button
                          key={transition.id}
                          size="sm"
                          variant="outline"
                          onClick={() => handleMove(item.candidate.id, transition.id)}
                        >
                          {transition.label}
                        </Button>
                      ))
                    )}
                  </div>

                  {item.history[0] ? (
                    <p className="text-xs text-muted-foreground mt-3">
                      Last event: {item.history[0].eventType} at {new Date(item.history[0].createdAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
