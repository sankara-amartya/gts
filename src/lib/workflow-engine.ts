import {
  candidateWorkflowInstances,
  candidates,
  workflowEvents,
  workflowStages,
  workflowTemplates,
  workflowTransitions,
  workflowTriggers,
} from "@/lib/data";
import type {
  Candidate,
  CandidateWorkflowInstance,
  WorkflowCondition,
  WorkflowEvent,
  WorkflowSlaState,
  WorkflowStage,
  WorkflowTransition,
} from "@/lib/definitions";

function addHours(baseDateIso: string, hours: number): string {
  const date = new Date(baseDateIso);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function getCandidateFieldValue(candidate: Candidate, field: WorkflowCondition["field"]): string | undefined {
  switch (field) {
    case "languageLevel":
      return candidate.languageLevel;
    case "migrationStatus":
      return candidate.migrationStatus;
    case "status":
      return candidate.status;
    default:
      return undefined;
  }
}

function evaluateCondition(condition: WorkflowCondition, candidate: Candidate): boolean {
  const fieldValue = getCandidateFieldValue(candidate, condition.field);

  if (condition.operator === "equals") {
    return fieldValue === condition.value;
  }

  if (condition.operator === "in") {
    if (!Array.isArray(condition.value)) {
      return false;
    }

    return condition.value.includes(String(fieldValue));
  }

  return false;
}

export function getWorkflowTemplate(templateId: string) {
  return workflowTemplates.find((template) => template.id === templateId);
}

export function getWorkflowStages(templateId: string): WorkflowStage[] {
  return workflowStages
    .filter((stage) => stage.workflowTemplateId === templateId)
    .sort((a, b) => a.sequence - b.sequence);
}

export function getCandidateWorkflowInstance(candidateId: string): CandidateWorkflowInstance | undefined {
  return candidateWorkflowInstances.find((instance) => instance.candidateId === candidateId);
}

export function getStageByCode(templateId: string, stageCode: string): WorkflowStage | undefined {
  return workflowStages.find(
    (stage) => stage.workflowTemplateId === templateId && stage.code === stageCode
  );
}

export function getSlaState(instance: CandidateWorkflowInstance, now = new Date()): WorkflowSlaState {
  const dueAt = new Date(instance.stageDueAt);
  const enteredAt = new Date(instance.stageEnteredAt);

  if (now > dueAt) {
    return "Breached";
  }

  const totalDurationMs = dueAt.getTime() - enteredAt.getTime();
  if (totalDurationMs <= 0) {
    return "At Risk";
  }

  const remainingMs = dueAt.getTime() - now.getTime();
  const remainingRatio = remainingMs / totalDurationMs;

  return remainingRatio <= 0.25 ? "At Risk" : "On Track";
}

export function getAllowedTransitions(candidateId: string): WorkflowTransition[] {
  const candidate = candidates.find((currentCandidate) => currentCandidate.id === candidateId);
  const instance = getCandidateWorkflowInstance(candidateId);

  if (!candidate || !instance) {
    return [];
  }

  return workflowTransitions.filter((transition) => {
    if (
      transition.workflowTemplateId !== instance.workflowTemplateId ||
      transition.fromStageCode !== instance.currentStageCode
    ) {
      return false;
    }

    return transition.conditions.every((condition) => evaluateCondition(condition, candidate));
  });
}

export function getWorkflowHistory(instanceId: string): WorkflowEvent[] {
  return workflowEvents
    .filter((event) => event.instanceId === instanceId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function moveCandidateToStage(candidateId: string, transitionId: string, actorId = "ui-user") {
  const candidate = candidates.find((currentCandidate) => currentCandidate.id === candidateId);
  const instance = getCandidateWorkflowInstance(candidateId);

  if (!candidate || !instance) {
    return { ok: false as const, error: "Candidate workflow instance not found." };
  }

  const transition = workflowTransitions.find((item) => item.id === transitionId);
  if (!transition) {
    return { ok: false as const, error: "Transition not found." };
  }

  if (
    transition.workflowTemplateId !== instance.workflowTemplateId ||
    transition.fromStageCode !== instance.currentStageCode
  ) {
    return { ok: false as const, error: "Transition is not valid for the current stage." };
  }

  const unmetCondition = transition.conditions.find(
    (condition) => !evaluateCondition(condition, candidate)
  );
  if (unmetCondition) {
    return {
      ok: false as const,
      error: `Transition blocked by condition: ${unmetCondition.field} ${unmetCondition.operator}.`,
    };
  }

  const nextStage = getStageByCode(instance.workflowTemplateId, transition.toStageCode);
  if (!nextStage) {
    return { ok: false as const, error: "Target stage not found." };
  }

  const previousStageCode = instance.currentStageCode;
  const now = new Date().toISOString();

  instance.currentStageCode = nextStage.code;
  instance.stageEnteredAt = now;
  instance.stageDueAt = addHours(now, nextStage.slaHours);

  workflowEvents.unshift({
    id: `wfe-${workflowEvents.length + 1}`,
    instanceId: instance.id,
    eventType: "transition",
    actorId,
    payload: {
      fromStage: previousStageCode,
      toStage: nextStage.code,
      transitionId,
    },
    createdAt: now,
  });

  const enterStageTriggers = workflowTriggers.filter(
    (trigger) =>
      trigger.workflowTemplateId === instance.workflowTemplateId &&
      trigger.stageCode === nextStage.code &&
      trigger.eventType === "on_enter"
  );

  enterStageTriggers.forEach((trigger) => {
    workflowEvents.unshift({
      id: `wfe-${workflowEvents.length + 1}`,
      instanceId: instance.id,
      eventType: "trigger",
      actorId: "system",
      payload: {
        triggerId: trigger.id,
        actionType: trigger.actionType,
        title: trigger.actionConfig.title,
      },
      createdAt: now,
    });
  });

  return {
    ok: true as const,
    instance,
  };
}
