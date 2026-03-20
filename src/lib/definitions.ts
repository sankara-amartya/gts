export type Client = {
  id: string;
  name: string;
  industry: 'Technology' | 'Finance' | 'Healthcare' | 'Retail' | 'Manufacturing';
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
};

export type MandateStage = 'Sourcing' | 'Interviewing' | 'Offer' | 'Closed';

export type Mandate = {
  id: string;
  clientId: string;
  role: string;
  headcount: number;
  fees: string;
  stage: MandateStage;
};

export type CommercialTerm = {
  id: string;
  title: string;
  details: string;
  clientId?: string;
  mandateId?: string;
};

export type ProgressUpdate = {
  id: string;
  mandateId: string;
  updateText: string;
  createdAt: string;
};

export type CandidateStatus = 'Screening' | 'Training' | 'Documentation' | 'Ready for Deployment' | 'Deployed';

export type Candidate = {
    id: string;
    knackId?: string;
    name: string;
    email: string;
    phone?: string;
    mandateId: string;
    status: CandidateStatus;
    languageLevel?: string;
    migrationStatus: string;
    cvUrl?: string;
    languageCertificateUrl?: string;
    createdAt: string;
}

export type DocumentPack = {
    id: string;
    name: string;
    country: string;
    role: string;
    documentList: string[];
}

export type TrainingCourse = {
    id: string;
    title: string;
    category: 'Language' | 'Technical';
    level: string;
    duration: string;
}

export type TransactionStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type TransactionPayer = 'Candidate' | 'Employer';

export type Transaction = {
    id: string;
    amount: number;
    currency: 'INR' | 'EUR' | 'CAD' | 'NZD' | 'USD' | 'QAR';
    payerType: TransactionPayer;
    payerId: string;
    description: string;
    status: TransactionStatus;
    createdAt: string;
}

export type WorkflowTriggerEvent = 'on_enter' | 'on_exit' | 'on_breach';
export type WorkflowActionType = 'notify' | 'create_task' | 'update_candidate';

export type WorkflowTemplate = {
  id: string;
  name: string;
  country: string;
  role: string;
  description?: string;
  version: number;
  isActive: boolean;
};

export type WorkflowStage = {
  id: string;
  workflowTemplateId: string;
  code: string;
  label: string;
  sequence: number;
  slaHours: number;
};

export type WorkflowCondition = {
  field: 'languageLevel' | 'migrationStatus' | 'status';
  operator: 'equals' | 'in';
  value: string | string[];
};

export type WorkflowTransition = {
  id: string;
  workflowTemplateId: string;
  fromStageCode: string;
  toStageCode: string;
  label: string;
  actorRole: 'ops' | 'recruiter' | 'trainer' | 'admin';
  conditions: WorkflowCondition[];
};

export type WorkflowTrigger = {
  id: string;
  workflowTemplateId: string;
  stageCode: string;
  eventType: WorkflowTriggerEvent;
  actionType: WorkflowActionType;
  actionConfig: {
    title: string;
    message: string;
  };
};

export type CandidateWorkflowInstance = {
  id: string;
  candidateId: string;
  workflowTemplateId: string;
  currentStageCode: string;
  stageEnteredAt: string;
  stageDueAt: string;
};

export type WorkflowEvent = {
  id: string;
  instanceId: string;
  eventType: 'transition' | 'trigger';
  actorId: string;
  payload: Record<string, string>;
  createdAt: string;
};

export type WorkflowSlaState = 'On Track' | 'At Risk' | 'Breached';
