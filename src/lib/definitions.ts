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

export type TrainingBatch = {
  id: string;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  trainer: string;
};

export type TrainingSession = {
  id: string;
  batchId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
};

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export type CandidateAttendanceRecord = {
  id: string;
  candidateId: string;
  sessionId: string;
  status: AttendanceStatus;
  markedBy: string;
  markedAt: string;
};

export type AssessmentType = 'Language' | 'Technical' | 'Aptitude';

export type AssessmentTemplate = {
  id: string;
  courseId: string;
  name: string;
  type: AssessmentType;
  passingScore: number;
  maxScore: number;
};

export type CandidateAssessmentAttempt = {
  id: string;
  candidateId: string;
  templateId: string;
  attemptNo: number;
  score: number;
  passed: boolean;
  attemptedAt: string;
  gradedBy: string;
};

export type CertificateRecord = {
  id: string;
  candidateId: string;
  courseId: string;
  certificateCode: string;
  issuedAt: string;
  issuedBy: string;
  grade?: string;
};

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

export type BillingModel = 'Candidate Pay' | 'Employer Pay' | 'Hybrid';
export type BillingSplitType = 'Fixed' | 'Percentage';

export type BillingProfile = {
  id: string;
  candidateId: string;
  mandateId: string;
  model: BillingModel;
  baseCurrency: Transaction['currency'];
  splitType?: BillingSplitType;
  candidateShare?: number;
  employerShare?: number;
  notes?: string;
  createdAt: string;
};

export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';
export type InvoicePayerType = 'Candidate' | 'Employer';

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  taxPercent: number;
  discountAmount: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  candidateId?: string;
  mandateId?: string;
  payerType: InvoicePayerType;
  payerId: string;
  currency: Transaction['currency'];
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  notes?: string;
};

export type ReceiptStatus = 'Captured' | 'Reversed';
export type PaymentMethod = 'Bank Transfer' | 'Card' | 'Cash' | 'Gateway';

export type ReceiptAllocation = {
  invoiceId: string;
  amount: number;
};

export type Receipt = {
  id: string;
  receiptNumber: string;
  payerType: InvoicePayerType;
  payerId: string;
  currency: Transaction['currency'];
  amount: number;
  method: PaymentMethod;
  gatewayReference?: string;
  bankReference?: string;
  receivedAt: string;
  status: ReceiptStatus;
  allocations: ReceiptAllocation[];
};

export type RefundStatus = 'Initiated' | 'Processed' | 'Failed';

export type Refund = {
  id: string;
  refundNumber: string;
  invoiceId: string;
  receiptId?: string;
  payerType: InvoicePayerType;
  payerId: string;
  currency: Transaction['currency'];
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  processedAt?: string;
};

export type ReconciliationStatus = 'Unmatched' | 'Matched' | 'Exception';

export type ReconciliationRecord = {
  id: string;
  receiptId: string;
  bankReference: string;
  statementAmount: number;
  statementDate: string;
  status: ReconciliationStatus;
  differenceAmount: number;
  note?: string;
};

export type DunningStage = 'Friendly Reminder' | 'Warning' | 'Final Notice' | 'Escalated';
export type DunningStatus = 'Pending' | 'Sent' | 'Resolved';

export type DunningCase = {
  id: string;
  invoiceId: string;
  payerType: InvoicePayerType;
  payerId: string;
  stage: DunningStage;
  status: DunningStatus;
  nextActionAt: string;
  lastSentAt?: string;
  attemptCount: number;
};

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

export type CandidateDocumentStatus = 'Missing' | 'Submitted' | 'Verified' | 'Rejected';

export type CandidateDocumentRecord = {
  id: string;
  candidateId: string;
  packId?: string;
  documentName: string;
  status: CandidateDocumentStatus;
  complianceStatus?: 'Compliant' | 'At Risk' | 'Non-Compliant';
  url?: string;
  submittedAt?: string;
  verifiedAt?: string;
  expiryDate?: string;
  reminderWindowDays?: number;
  lastUpdatedAt: string;
  verifiedBy?: string;
  notes?: string;
};

export type VerificationQueueStatus = 'Pending Review' | 'In Review' | 'Approved' | 'Rejected';
export type VerificationQueuePriority = 'Low' | 'Medium' | 'High';

export type DocumentVerificationQueueItem = {
  id: string;
  candidateId: string;
  documentId: string;
  packId: string;
  queueStatus: VerificationQueueStatus;
  priority: VerificationQueuePriority;
  createdAt: string;
  updatedAt: string;
};

export type ComplianceAuditAction =
  | 'Submitted'
  | 'Verified'
  | 'Rejected'
  | 'Expiry Updated'
  | 'Pack Assigned';

export type ComplianceAuditEvent = {
  id: string;
  candidateId: string;
  documentId: string;
  action: ComplianceAuditAction;
  actor: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
};

export type CandidateTrainingStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Failed';

export type CandidateTrainingEnrollment = {
  id: string;
  candidateId: string;
  courseId: string;
  status: CandidateTrainingStatus;
  progressPercent: number;
  score?: number;
  startedAt?: string;
  completedAt?: string;
};

export type CandidatePaymentRecord = {
  id: string;
  candidateId: string;
  transactionId: string;
  category: 'Training' | 'Documentation' | 'Visa' | 'Other';
  notes?: string;
};

export type CandidateCommunicationChannel = 'Call' | 'Email' | 'WhatsApp' | 'SMS' | 'Note';

export type CandidateCommunicationEvent = {
  id: string;
  candidateId: string;
  channel: CandidateCommunicationChannel;
  direction: 'Inbound' | 'Outbound' | 'Internal';
  summary: string;
  createdAt: string;
  createdBy: string;
};

export type CandidateIdentityProfile = {
  candidateId: string;
  nationality: string;
  passportNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

export type CandidateLifecycleSnapshot = {
  candidate: Candidate;
  identity?: CandidateIdentityProfile;
  workflow?: CandidateWorkflowInstance;
  currentStageLabel?: string;
  slaState?: WorkflowSlaState;
  documents: CandidateDocumentRecord[];
  training: CandidateTrainingEnrollment[];
  payments: CandidatePaymentRecord[];
  communications: CandidateCommunicationEvent[];
  riskFlags: string[];
};

export type CandidateTimelineEvent = {
  id: string;
  timestamp: string;
  type: 'workflow' | 'document' | 'training' | 'payment' | 'communication';
  title: string;
  detail: string;
};
