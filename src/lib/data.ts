import type {
  AssessmentTemplate,
  BillingProfile,
  CandidateAssessmentAttempt,
  CandidateAttendanceRecord,
  CandidateMigrationMilestone,
  ComplianceAuditEvent,
  CertificateRecord,
  DunningCase,
  DunningStage,
  DunningStatus,
  CandidateCommunicationEvent,
  CandidateDocumentRecord,
  CandidateIdentityProfile,
  CandidateLifecycleSnapshot,
  CandidatePaymentRecord,
  CandidateTimelineEvent,
  CandidateTrainingEnrollment,
  DocumentVerificationQueueItem,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  PaymentPlanTemplate,
  Receipt,
  ReconciliationRecord,
  ReconciliationStatus,
  Refund,
  RefundStatus,
  TrainingBatch,
  TrainingSession,
  Candidate,
  CandidateWorkflowInstance,
  Client,
  CommercialTerm,
  DocumentPack,
  Mandate,
  MigrationMilestoneTemplate,
  ProgressUpdate,
  TrainingCourse,
  Transaction,
  WorkflowEvent,
  WorkflowStage,
  WorkflowTemplate,
  WorkflowTransition,
  WorkflowTrigger,
} from './definitions';

export const clients: Client[] = [
  { id: 'cli-1', name: 'Innovatech Solutions', industry: 'Technology', contactName: 'Alex Chen', contactEmail: 'alex.c@innovatech.com', contactPhone: '123-456-7890', createdAt: '2023-01-15' },
  { id: 'cli-2', name: 'Quantum Financial', industry: 'Finance', contactName: 'Priya Sharma', contactEmail: 'priya.s@quantum.com', contactPhone: '234-567-8901', createdAt: '2023-02-20' },
  { id: 'cli-3', name: 'Vitalis Health', industry: 'Healthcare', contactName: 'Ben Carter', contactEmail: 'ben.c@vitalis.com', contactPhone: '345-678-9012', createdAt: '2023-03-10' },
  { id: 'cli-4', name: 'Globex Retail', industry: 'Retail', contactName: 'Sophia Loren', contactEmail: 'sophia.l@globex.com', contactPhone: '456-789-0123', createdAt: '2023-04-05' },
  { id: 'cli-5', name: 'Stark Industries', industry: 'Manufacturing', contactName: 'Tony Stark', contactEmail: 'tony@stark.com', contactPhone: '567-890-1234', createdAt: '2023-05-25' },
];

export const mandates: Mandate[] = [
  { id: 'man-1', clientId: 'cli-1', role: 'Senior Frontend Developer', headcount: 2, fees: '15% of annual salary', stage: 'Interviewing' },
  { id: 'man-2', clientId: 'cli-2', role: 'Financial Analyst', headcount: 1, fees: '20% of annual salary', stage: 'Sourcing' },
  { id: 'man-3', clientId: 'cli-3', role: 'Registered Nurse', headcount: 5, fees: 'Fixed Fee $5,000 per placement', stage: 'Offer' },
  { id: 'man-4', clientId: 'cli-1', role: 'Cloud Solutions Architect', headcount: 1, fees: '18% of annual salary', stage: 'Sourcing' },
  { id: 'man-5', clientId: 'cli-4', role: 'E-commerce Manager', headcount: 1, fees: '22% of annual salary', stage: 'Interviewing' },
  { id: 'man-6', clientId: 'cli-5', role: 'Mechanical Engineer', headcount: 3, fees: '12% of annual salary', stage: 'Closed' },
  { id: 'man-7', clientId: 'cli-2', role: 'Compliance Officer', headcount: 1, fees: 'Fixed Fee $30,000', stage: 'Sourcing' },
];

export const activeMandates = mandates.filter(m => m.stage !== 'Closed');

export const commercialTerms: CommercialTerm[] = [
  { id: 'com-1', title: 'Standard Retained Agreement', details: '20% fee, payable in three tranches.', clientId: 'cli-1' },
  { id: 'com-2', title: 'Contingency Agreement - Finance', details: '25% fee, payable on successful placement.', clientId: 'cli-2' },
  { id: 'com-3', title: 'Bulk Placement Deal', details: 'Fixed fee of $5,000 per nurse placed.', mandateId: 'man-3' },
  { id: 'com-4', title: 'Standard Terms', details: '15% fee, payable on successful placement.', clientId: 'cli-4' },
];

export const progressUpdates: ProgressUpdate[] = [
    { id: 'upd-1', mandateId: 'man-1', updateText: 'Initial longlist of 15 candidates identified.', createdAt: '2023-06-01' },
    { id: 'upd-2', mandateId: 'man-1', updateText: 'Shortlisted 5 candidates for first-round interviews.', createdAt: '2023-06-10' },
    { id: 'upd-3', mandateId: 'man-1', updateText: 'Client has selected 2 candidates for final round.', createdAt: '2023-06-15' },
    { id: 'upd-4', mandateId: 'man-2', updateText: 'Market mapping completed. Initial outreach to 20 potential candidates.', createdAt: '2023-06-12' },
    { id: 'upd-5', mandateId: 'man-3', updateText: 'Offer extended to 3 candidates. Awaiting response.', createdAt: '2023-06-18' },
    { id: 'upd-6', mandateId: 'man-3', updateText: '2 offers accepted. Continuing to source for remaining 3 positions.', createdAt: '2023-06-20' },
];

export const candidates: Candidate[] = [
  { id: 'can-1', name: 'John Doe', email: 'john.doe@email.com', phone: '111-222-3333', mandateId: 'man-1', status: 'Screening', migrationStatus: 'Visa processing', createdAt: '2023-06-01', knackId: 'k_jd_01', languageLevel: 'B2', cvUrl: '#', languageCertificateUrl: '#' },
    { id: 'can-2', name: 'Jane Smith', email: 'jane.smith@email.com', phone: '444-555-6666', mandateId: 'man-1', status: 'Training', migrationStatus: 'Awaiting documents', createdAt: '2023-06-05', knackId: 'k_js_02', languageLevel: 'A2', cvUrl: '#', languageCertificateUrl: '#' },
    { id: 'can-3', name: 'Peter Jones', email: 'peter.jones@email.com', phone: '777-888-9999', mandateId: 'man-2', status: 'Screening', migrationStatus: 'Not started', createdAt: '2023-06-10', knackId: 'k_pj_03', languageLevel: 'C1' },
    { id: 'can-4', name: 'Maria Garcia', email: 'maria.g@email.com', phone: '123-987-4561', mandateId: 'man-5', status: 'Documentation', migrationStatus: 'Documents submitted', createdAt: '2023-06-15', knackId: 'k_mg_04', languageLevel: 'B1', cvUrl: '#' },
];

export const documentPacks: DocumentPack[] = [
    { id: 'dp-1', name: 'Germany - Registered Nurse Pack', country: 'Germany', role: 'Registered Nurse', documentList: ['Passport', 'Visa Application', 'B2 German Certificate', 'Degree Certificate'] },
    { id: 'dp-2', name: 'Canada - Software Developer Pack', country: 'Canada', role: 'Software Developer', documentList: ['Passport', 'Work Permit Application', 'IELTS Score', 'Educational Credential Assessment'] },
    { id: 'dp-3', name: 'New Zealand - General Pack', country: 'New Zealand', role: 'Any', documentList: ['Passport', 'Visa', 'Medical Certificate'] },
    {
      id: 'dp-4',
      name: 'Germany - Nursing Documents Pack',
      country: 'Germany',
      role: 'Nursing',
      documentList: [
        'Passport',
        'Nursing Marksheets',
        'Nursing Certificate',
        '10th Marksheet',
        '12th Marksheet',
        'Transcript Record',
        'Nursing Registration',
        'Experience Letter (If Any)',
        'Birth Certificate',
        'Marriage Certificate (If Married)',
        'English CV',
        'MMR Vaccine',
        'PCC',
        'Good Standing Certificate',
        'German CV',
        'Motivation Letter',
        'Self Introduction Video',
        'German Language Certificate (B2)',
      ],
    },
    {
      id: 'dp-5',
      name: 'UAE - Car & Commercial Vehicle Technician Pack',
      country: 'UAE',
      role: 'Car & Commercial Vehicle Technician',
      documentList: [
        "Bachelor's Degree or Examination Certificate",
        'Curriculum (List of Courses & Academic Framework)',
        'Driving Licence',
        'Identity Card',
        'Passport',
        'Proof of Accreditation of College/University (Year of Graduation)',
        'Proof of Employment/Job Reference',
        'School Leaving Certificates',
      ],
    },
    {
      id: 'dp-6',
      name: 'UAE - Truck / Bus Driver Pack',
      country: 'UAE',
      role: 'Truck / Bus Driver',
      documentList: [
        'Driving Licence (TRANS)',
        'Identity Card',
        'Passport',
        'Proof of Employment/Job Reference',
        'School Leaving Certificates',
      ],
    },
];

export const trainingCourses: TrainingCourse[] = [
    { id: 'tr-1', title: 'German Language A1', category: 'Language', level: 'A1', duration: '8 Weeks' },
    { id: 'tr-2', title: 'German Language B2', category: 'Language', level: 'B2', duration: '12 Weeks' },
    { id: 'tr-3', title: 'IELTS Preparation', category: 'Language', level: 'Advanced', duration: '6 Weeks' },
    { id: 'tr-4', title: 'Certified Nursing Assistant (CNA)', category: 'Technical', level: 'Beginner', duration: '10 Weeks' },
];

export const transactions: Transaction[] = [
    { id: 'txn-1', amount: 500, currency: 'EUR', payerType: 'Candidate', payerId: 'can-2', description: 'German A1 Course Fee', status: 'Paid', createdAt: '2023-06-06' },
    { id: 'txn-2', amount: 2500, currency: 'USD', payerType: 'Employer', payerId: 'cli-1', description: 'First tranche for man-1', status: 'Paid', createdAt: '2023-06-02' },
    { id: 'txn-3', amount: 150, currency: 'CAD', payerType: 'Candidate', payerId: 'can-4', description: 'Document Verification Fee', status: 'Pending', createdAt: '2023-06-16' },
    { id: 'txn-4', amount: 5000, currency: 'NZD', payerType: 'Employer', payerId: 'cli-3', description: 'Placement fee for RN', status: 'Paid', createdAt: '2023-05-20' },
];

export const mandateStages: Mandate['stage'][] = ['Sourcing', 'Interviewing', 'Offer', 'Closed'];
export const clientIndustries: Client['industry'][] = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'];
export const candidateStatuses: Candidate['status'][] = ['Screening', 'Training', 'Documentation', 'Ready for Deployment', 'Deployed'];
export const trainingCategories: TrainingCourse['category'][] = ['Language', 'Technical'];
export const transactionStatuses: Transaction['status'][] = ['Pending', 'Paid', 'Failed', 'Refunded'];
export const transactionCurrencies: Transaction['currency'][] = ['INR', 'EUR', 'CAD', 'NZD', 'USD', 'QAR'];

export const billingProfiles: BillingProfile[] = [
  {
    id: 'bp-1',
    candidateId: 'can-1',
    mandateId: 'man-1',
    model: 'Hybrid',
    baseCurrency: 'EUR',
    splitType: 'Percentage',
    candidateShare: 30,
    employerShare: 70,
    notes: 'Language and documentation by candidate, placement by employer.',
    createdAt: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'bp-2',
    candidateId: 'can-2',
    mandateId: 'man-1',
    model: 'Candidate Pay',
    baseCurrency: 'INR',
    notes: 'Candidate-self funded language track.',
    createdAt: '2026-03-11T08:00:00.000Z',
  },
  {
    id: 'bp-3',
    candidateId: 'can-4',
    mandateId: 'man-5',
    model: 'Employer Pay',
    baseCurrency: 'USD',
    notes: 'Client covers visa and deployment costs.',
    createdAt: '2026-03-12T08:00:00.000Z',
  },
];

export const paymentPlanTemplates: PaymentPlanTemplate[] = [
  {
    id: 'ppt-1',
    name: 'Candidate Pay - Germany Standard',
    model: 'Candidate Pay',
    currency: 'EUR',
    notes: 'Candidate-funded model with staged milestones.',
    installments: [
      { id: 'ppi-1', label: 'Enrollment Advance', percent: 30, trigger: 'Enrollment' },
      { id: 'ppi-2', label: 'Documents Completed', percent: 30, trigger: 'Document Approval' },
      { id: 'ppi-3', label: 'Visa Filing', percent: 20, trigger: 'Visa Filed' },
      { id: 'ppi-4', label: 'Pre-Departure Balance', percent: 20, trigger: 'Pre-Departure' },
    ],
  },
  {
    id: 'ppt-2',
    name: 'Hybrid - GCC Express',
    model: 'Hybrid',
    currency: 'USD',
    notes: 'Candidate pays onboarding, employer pays closure milestones.',
    installments: [
      { id: 'ppi-5', label: 'Candidate Onboarding', percent: 25, trigger: 'Enrollment' },
      { id: 'ppi-6', label: 'Employer Offer Milestone', percent: 35, trigger: 'Offer Accepted' },
      { id: 'ppi-7', label: 'Deployment Completion', percent: 40, trigger: 'Deployment' },
    ],
  },
];

export const invoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0001',
    candidateId: 'can-1',
    mandateId: 'man-1',
    payerType: 'Candidate',
    payerId: 'can-1',
    currency: 'EUR',
    issuedAt: '2026-03-05T08:00:00.000Z',
    dueAt: '2026-03-15T08:00:00.000Z',
    status: 'Partially Paid',
    lineItems: [
      { id: 'ili-1', description: 'B2 Training Fee', quantity: 1, unitAmount: 600, taxPercent: 0, discountAmount: 0 },
      { id: 'ili-2', description: 'Document Verification', quantity: 1, unitAmount: 150, taxPercent: 0, discountAmount: 0 },
    ],
    notes: 'Hybrid candidate-side invoice.',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0002',
    candidateId: 'can-1',
    mandateId: 'man-1',
    payerType: 'Employer',
    payerId: 'cli-1',
    currency: 'USD',
    issuedAt: '2026-03-07T08:00:00.000Z',
    dueAt: '2026-03-21T08:00:00.000Z',
    status: 'Sent',
    lineItems: [
      { id: 'ili-3', description: 'Placement Retainer Tranche 1', quantity: 1, unitAmount: 2500, taxPercent: 0, discountAmount: 0 },
    ],
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0003',
    candidateId: 'can-4',
    mandateId: 'man-5',
    payerType: 'Employer',
    payerId: 'cli-4',
    currency: 'CAD',
    issuedAt: '2026-03-01T08:00:00.000Z',
    dueAt: '2026-03-10T08:00:00.000Z',
    status: 'Overdue',
    lineItems: [
      { id: 'ili-4', description: 'Visa Filing Support', quantity: 1, unitAmount: 500, taxPercent: 0, discountAmount: 0 },
    ],
  },
];

export const receipts: Receipt[] = [
  {
    id: 'rcp-1',
    receiptNumber: 'RCP-2026-0001',
    payerType: 'Candidate',
    payerId: 'can-1',
    currency: 'EUR',
    amount: 400,
    method: 'Bank Transfer',
    bankReference: 'BNK-778812',
    receivedAt: '2026-03-12T09:00:00.000Z',
    status: 'Captured',
    allocations: [{ invoiceId: 'inv-1', amount: 400 }],
  },
  {
    id: 'rcp-2',
    receiptNumber: 'RCP-2026-0002',
    payerType: 'Employer',
    payerId: 'cli-1',
    currency: 'USD',
    amount: 1000,
    method: 'Gateway',
    gatewayReference: 'GTW-12345',
    receivedAt: '2026-03-18T10:00:00.000Z',
    status: 'Captured',
    allocations: [{ invoiceId: 'inv-2', amount: 1000 }],
  },
];

export const refunds: Refund[] = [
  {
    id: 'rfd-1',
    refundNumber: 'RFD-2026-0001',
    invoiceId: 'inv-1',
    receiptId: 'rcp-1',
    payerType: 'Candidate',
    payerId: 'can-1',
    currency: 'EUR',
    amount: 50,
    reason: 'Duplicate charge correction',
    status: 'Processed',
    createdAt: '2026-03-13T09:00:00.000Z',
    processedAt: '2026-03-13T12:00:00.000Z',
  },
];

export const reconciliationRecords: ReconciliationRecord[] = [
  {
    id: 'rec-1',
    receiptId: 'rcp-1',
    bankReference: 'BNK-778812',
    statementAmount: 400,
    statementDate: '2026-03-12T00:00:00.000Z',
    status: 'Matched',
    differenceAmount: 0,
    note: 'Auto-matched by bank reference and amount.',
  },
  {
    id: 'rec-2',
    receiptId: 'rcp-2',
    bankReference: 'GTW-12345',
    statementAmount: 980,
    statementDate: '2026-03-18T00:00:00.000Z',
    status: 'Exception',
    differenceAmount: -20,
    note: 'Gateway fee mismatch.',
  },
];

export const dunningCases: DunningCase[] = [
  {
    id: 'dun-1',
    invoiceId: 'inv-3',
    payerType: 'Employer',
    payerId: 'cli-4',
    stage: 'Warning',
    status: 'Sent',
    nextActionAt: '2026-03-22T09:00:00.000Z',
    lastSentAt: '2026-03-18T09:00:00.000Z',
    attemptCount: 2,
  },
];

export const invoiceStatuses: InvoiceStatus[] = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];
export const paymentMethods: PaymentMethod[] = ['Bank Transfer', 'Card', 'Cash', 'Gateway'];
export const refundStatuses: RefundStatus[] = ['Initiated', 'Processed', 'Failed'];
export const reconciliationStatuses: ReconciliationStatus[] = ['Unmatched', 'Matched', 'Exception'];
export const dunningStages: DunningStage[] = ['Friendly Reminder', 'Warning', 'Final Notice', 'Escalated'];
export const dunningStatuses: DunningStatus[] = ['Pending', 'Sent', 'Resolved'];

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'wf-germany-nurse-v1',
    name: 'Germany Nurse Journey',
    country: 'Germany',
    role: 'Registered Nurse',
    description: '12-stage migration and deployment journey from onboarding to ready to fly.',
    version: 1,
    isActive: true,
  },
];

export const workflowStages: WorkflowStage[] = [
  { id: 'wfs-1', workflowTemplateId: 'wf-germany-nurse-v1', code: 'DOC_COLLECTION', label: 'Document Collection', sequence: 1, slaHours: 72 },
  { id: 'wfs-2', workflowTemplateId: 'wf-germany-nurse-v1', code: 'DOC_VERIFICATION', label: 'Document Verification', sequence: 2, slaHours: 48 },
  { id: 'wfs-3', workflowTemplateId: 'wf-germany-nurse-v1', code: 'PROFILE_APPROVAL', label: 'Profile Approval', sequence: 3, slaHours: 48 },
  { id: 'wfs-4', workflowTemplateId: 'wf-germany-nurse-v1', code: 'LANGUAGE_A1', label: 'German A1 Training', sequence: 4, slaHours: 240 },
  { id: 'wfs-5', workflowTemplateId: 'wf-germany-nurse-v1', code: 'LANGUAGE_A2', label: 'German A2 Training', sequence: 5, slaHours: 240 },
  { id: 'wfs-6', workflowTemplateId: 'wf-germany-nurse-v1', code: 'LANGUAGE_B1', label: 'German B1 Training', sequence: 6, slaHours: 336 },
  { id: 'wfs-7', workflowTemplateId: 'wf-germany-nurse-v1', code: 'LANGUAGE_B2', label: 'German B2 Certification', sequence: 7, slaHours: 336 },
  { id: 'wfs-8', workflowTemplateId: 'wf-germany-nurse-v1', code: 'INTERVIEW', label: 'Employer Interview', sequence: 8, slaHours: 96 },
  { id: 'wfs-9', workflowTemplateId: 'wf-germany-nurse-v1', code: 'OFFER', label: 'Offer & Acceptance', sequence: 9, slaHours: 72 },
  { id: 'wfs-10', workflowTemplateId: 'wf-germany-nurse-v1', code: 'VISA_FILING', label: 'Visa Filing', sequence: 10, slaHours: 168 },
  { id: 'wfs-11', workflowTemplateId: 'wf-germany-nurse-v1', code: 'PRE_DEPARTURE', label: 'Pre-Departure Compliance', sequence: 11, slaHours: 120 },
  { id: 'wfs-12', workflowTemplateId: 'wf-germany-nurse-v1', code: 'READY_TO_FLY', label: 'Ready to Fly', sequence: 12, slaHours: 24 },
];

export const workflowTransitions: WorkflowTransition[] = [
  { id: 'wft-1', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'DOC_COLLECTION', toStageCode: 'DOC_VERIFICATION', label: 'Submit docs for verification', actorRole: 'ops', conditions: [] },
  { id: 'wft-2', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'DOC_VERIFICATION', toStageCode: 'PROFILE_APPROVAL', label: 'Approve verified profile', actorRole: 'ops', conditions: [{ field: 'migrationStatus', operator: 'in', value: ['Documents submitted', 'Visa processing'] }] },
  { id: 'wft-3', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'PROFILE_APPROVAL', toStageCode: 'LANGUAGE_A1', label: 'Start language track', actorRole: 'recruiter', conditions: [] },
  { id: 'wft-4', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'LANGUAGE_A1', toStageCode: 'LANGUAGE_A2', label: 'A1 complete', actorRole: 'trainer', conditions: [] },
  { id: 'wft-5', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'LANGUAGE_A2', toStageCode: 'LANGUAGE_B1', label: 'A2 complete', actorRole: 'trainer', conditions: [] },
  { id: 'wft-6', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'LANGUAGE_B1', toStageCode: 'LANGUAGE_B2', label: 'B1 complete', actorRole: 'trainer', conditions: [] },
  { id: 'wft-7', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'LANGUAGE_B2', toStageCode: 'INTERVIEW', label: 'B2 pass and schedule interview', actorRole: 'trainer', conditions: [{ field: 'languageLevel', operator: 'in', value: ['B2', 'C1', 'C2'] }] },
  { id: 'wft-8', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'INTERVIEW', toStageCode: 'OFFER', label: 'Interview cleared', actorRole: 'recruiter', conditions: [] },
  { id: 'wft-9', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'OFFER', toStageCode: 'VISA_FILING', label: 'Offer accepted', actorRole: 'recruiter', conditions: [] },
  { id: 'wft-10', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'VISA_FILING', toStageCode: 'PRE_DEPARTURE', label: 'Visa approved', actorRole: 'ops', conditions: [{ field: 'migrationStatus', operator: 'in', value: ['Visa processing', 'Visa approved'] }] },
  { id: 'wft-11', workflowTemplateId: 'wf-germany-nurse-v1', fromStageCode: 'PRE_DEPARTURE', toStageCode: 'READY_TO_FLY', label: 'Compliance completed', actorRole: 'ops', conditions: [] },
];

export const workflowTriggers: WorkflowTrigger[] = [
  {
    id: 'wftr-1',
    workflowTemplateId: 'wf-germany-nurse-v1',
    stageCode: 'LANGUAGE_A1',
    eventType: 'on_enter',
    actionType: 'create_task',
    actionConfig: {
      title: 'Assign A1 course batch',
      message: 'Auto-create language onboarding task in training module.',
    },
  },
  {
    id: 'wftr-2',
    workflowTemplateId: 'wf-germany-nurse-v1',
    stageCode: 'VISA_FILING',
    eventType: 'on_breach',
    actionType: 'notify',
    actionConfig: {
      title: 'Visa SLA breach escalation',
      message: 'Escalate stalled visa cases to operations manager.',
    },
  },
];

export const candidateWorkflowInstances: CandidateWorkflowInstance[] = [
  {
    id: 'cwi-1',
    candidateId: 'can-1',
    workflowTemplateId: 'wf-germany-nurse-v1',
    currentStageCode: 'LANGUAGE_B2',
    stageEnteredAt: '2026-03-15T09:00:00.000Z',
    stageDueAt: '2026-03-29T09:00:00.000Z',
  },
  {
    id: 'cwi-2',
    candidateId: 'can-2',
    workflowTemplateId: 'wf-germany-nurse-v1',
    currentStageCode: 'DOC_VERIFICATION',
    stageEnteredAt: '2026-03-19T09:00:00.000Z',
    stageDueAt: '2026-03-21T09:00:00.000Z',
  },
  {
    id: 'cwi-3',
    candidateId: 'can-4',
    workflowTemplateId: 'wf-germany-nurse-v1',
    currentStageCode: 'VISA_FILING',
    stageEnteredAt: '2026-03-10T09:00:00.000Z',
    stageDueAt: '2026-03-17T09:00:00.000Z',
  },
];

export const workflowEvents: WorkflowEvent[] = [
  {
    id: 'wfe-1',
    instanceId: 'cwi-1',
    eventType: 'transition',
    actorId: 'ops-1',
    payload: {
      fromStage: 'LANGUAGE_B1',
      toStage: 'LANGUAGE_B2',
      note: 'B1 exam cleared and moved to B2 certification stage.',
    },
    createdAt: '2026-03-15T09:00:00.000Z',
  },
  {
    id: 'wfe-2',
    instanceId: 'cwi-3',
    eventType: 'trigger',
    actorId: 'system',
    payload: {
      triggerId: 'wftr-2',
      message: 'Visa SLA breach escalation alert fired.',
    },
    createdAt: '2026-03-18T09:00:00.000Z',
  },
];

export const candidateIdentityProfiles: CandidateIdentityProfile[] = [
  {
    candidateId: 'can-1',
    nationality: 'Indian',
    passportNumber: 'P9087654',
    dateOfBirth: '1995-08-12',
    gender: 'Male',
    city: 'Bengaluru',
    country: 'India',
    emergencyContactName: 'Mary Doe',
    emergencyContactPhone: '+91-9000000011',
  },
  {
    candidateId: 'can-2',
    nationality: 'Indian',
    passportNumber: 'P8099652',
    dateOfBirth: '1997-03-21',
    gender: 'Female',
    city: 'Kochi',
    country: 'India',
    emergencyContactName: 'Anita Smith',
    emergencyContactPhone: '+91-9000000012',
  },
  {
    candidateId: 'can-4',
    nationality: 'Indian',
    passportNumber: 'P7004432',
    dateOfBirth: '1994-11-02',
    gender: 'Female',
    city: 'Pune',
    country: 'India',
    emergencyContactName: 'Carlos Garcia',
    emergencyContactPhone: '+91-9000000014',
  },
];

export const candidateDocuments: CandidateDocumentRecord[] = [
  { id: 'cdr-1', candidateId: 'can-1', packId: 'dp-1', documentName: 'Passport', status: 'Verified', complianceStatus: 'Compliant', url: '#', submittedAt: '2026-03-10T09:00:00.000Z', verifiedAt: '2026-03-11T10:00:00.000Z', expiryDate: '2031-08-20T00:00:00.000Z', reminderWindowDays: 90, lastUpdatedAt: '2026-03-11T10:00:00.000Z', verifiedBy: 'ops-1' },
  { id: 'cdr-2', candidateId: 'can-1', packId: 'dp-1', documentName: 'Nursing Degree', status: 'Verified', complianceStatus: 'Compliant', url: '#', submittedAt: '2026-03-10T09:15:00.000Z', verifiedAt: '2026-03-11T10:10:00.000Z', reminderWindowDays: 365, lastUpdatedAt: '2026-03-11T10:10:00.000Z', verifiedBy: 'ops-1' },
  { id: 'cdr-3', candidateId: 'can-1', packId: 'dp-1', documentName: 'B2 Certificate', status: 'Submitted', complianceStatus: 'At Risk', url: '#', submittedAt: '2026-03-16T09:00:00.000Z', expiryDate: '2026-04-10T00:00:00.000Z', reminderWindowDays: 30, lastUpdatedAt: '2026-03-16T09:00:00.000Z' },
  { id: 'cdr-4', candidateId: 'can-2', packId: 'dp-1', documentName: 'Passport', status: 'Submitted', complianceStatus: 'At Risk', url: '#', submittedAt: '2026-03-19T07:30:00.000Z', expiryDate: '2027-02-10T00:00:00.000Z', reminderWindowDays: 90, lastUpdatedAt: '2026-03-19T07:30:00.000Z' },
  { id: 'cdr-5', candidateId: 'can-2', packId: 'dp-1', documentName: 'Nursing Degree', status: 'Missing', complianceStatus: 'Non-Compliant', reminderWindowDays: 365, lastUpdatedAt: '2026-03-19T07:30:00.000Z' },
  { id: 'cdr-6', candidateId: 'can-4', packId: 'dp-1', documentName: 'Passport', status: 'Verified', complianceStatus: 'Compliant', url: '#', submittedAt: '2026-03-03T10:00:00.000Z', verifiedAt: '2026-03-05T11:30:00.000Z', expiryDate: '2026-03-19T00:00:00.000Z', reminderWindowDays: 90, lastUpdatedAt: '2026-03-05T11:30:00.000Z', verifiedBy: 'ops-2' },
  { id: 'cdr-7', candidateId: 'can-4', packId: 'dp-1', documentName: 'Visa Application', status: 'Submitted', complianceStatus: 'Non-Compliant', url: '#', submittedAt: '2026-03-12T10:00:00.000Z', expiryDate: '2026-03-22T00:00:00.000Z', reminderWindowDays: 14, lastUpdatedAt: '2026-03-12T10:00:00.000Z' },
];

export const documentVerificationQueue: DocumentVerificationQueueItem[] = [
  {
    id: 'dq-1',
    candidateId: 'can-1',
    documentId: 'cdr-3',
    packId: 'dp-1',
    queueStatus: 'Pending Review',
    priority: 'Medium',
    createdAt: '2026-03-16T09:05:00.000Z',
    updatedAt: '2026-03-16T09:05:00.000Z',
  },
  {
    id: 'dq-2',
    candidateId: 'can-2',
    documentId: 'cdr-4',
    packId: 'dp-1',
    queueStatus: 'In Review',
    priority: 'Medium',
    createdAt: '2026-03-19T07:35:00.000Z',
    updatedAt: '2026-03-19T10:00:00.000Z',
  },
  {
    id: 'dq-3',
    candidateId: 'can-2',
    documentId: 'cdr-5',
    packId: 'dp-1',
    queueStatus: 'Pending Review',
    priority: 'High',
    createdAt: '2026-03-19T07:35:00.000Z',
    updatedAt: '2026-03-19T07:35:00.000Z',
  },
  {
    id: 'dq-4',
    candidateId: 'can-4',
    documentId: 'cdr-7',
    packId: 'dp-1',
    queueStatus: 'Pending Review',
    priority: 'High',
    createdAt: '2026-03-12T10:05:00.000Z',
    updatedAt: '2026-03-12T10:05:00.000Z',
  },
];

export const complianceAuditEvents: ComplianceAuditEvent[] = [
  {
    id: 'ca-1',
    candidateId: 'can-1',
    documentId: 'cdr-3',
    action: 'Submitted',
    actor: 'candidate',
    timestamp: '2026-03-16T09:00:00.000Z',
    notes: 'B2 certificate uploaded from portal.',
  },
  {
    id: 'ca-2',
    candidateId: 'can-2',
    documentId: 'cdr-5',
    action: 'Rejected',
    actor: 'ops-1',
    timestamp: '2026-03-19T10:15:00.000Z',
    oldValue: 'Submitted',
    newValue: 'Missing',
    notes: 'Degree scan was unreadable. Re-upload requested.',
  },
  {
    id: 'ca-3',
    candidateId: 'can-4',
    documentId: 'cdr-6',
    action: 'Expiry Updated',
    actor: 'compliance-1',
    timestamp: '2026-03-18T14:20:00.000Z',
    oldValue: '2026-03-01T00:00:00.000Z',
    newValue: '2026-03-19T00:00:00.000Z',
    notes: 'Passport renewal acknowledgement attached.',
  },
];

export const candidateTrainingEnrollments: CandidateTrainingEnrollment[] = [
  {
    id: 'cte-1',
    candidateId: 'can-1',
    courseId: 'tr-2',
    status: 'In Progress',
    progressPercent: 85,
    score: 79,
    startedAt: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'cte-2',
    candidateId: 'can-2',
    courseId: 'tr-1',
    status: 'In Progress',
    progressPercent: 40,
    startedAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'cte-3',
    candidateId: 'can-4',
    courseId: 'tr-2',
    status: 'Completed',
    progressPercent: 100,
    score: 88,
    startedAt: '2026-01-01T08:00:00.000Z',
    completedAt: '2026-02-20T08:00:00.000Z',
  },
];

export const candidatePaymentRecords: CandidatePaymentRecord[] = [
  { id: 'cpr-1', candidateId: 'can-2', transactionId: 'txn-1', category: 'Training', notes: 'A1 language fee paid.' },
  { id: 'cpr-2', candidateId: 'can-4', transactionId: 'txn-3', category: 'Documentation', notes: 'Verification fee pending.' },
];

export const candidateCommunications: CandidateCommunicationEvent[] = [
  {
    id: 'cce-1',
    candidateId: 'can-1',
    channel: 'Call',
    direction: 'Outbound',
    summary: 'Discussed B2 exam schedule and interview readiness.',
    createdAt: '2026-03-17T12:00:00.000Z',
    createdBy: 'recruiter-1',
  },
  {
    id: 'cce-2',
    candidateId: 'can-2',
    channel: 'WhatsApp',
    direction: 'Outbound',
    summary: 'Requested degree certificate upload to proceed verification.',
    createdAt: '2026-03-19T09:00:00.000Z',
    createdBy: 'ops-1',
  },
  {
    id: 'cce-3',
    candidateId: 'can-4',
    channel: 'Email',
    direction: 'Inbound',
    summary: 'Shared visa acknowledgement receipt and travel preference.',
    createdAt: '2026-03-13T15:30:00.000Z',
    createdBy: 'candidate',
  },
];

export const candidateLifecycleSnapshots: CandidateLifecycleSnapshot[] = [];
export const candidateTimelineEvents: CandidateTimelineEvent[] = [];

export const migrationMilestoneTemplates: MigrationMilestoneTemplate[] = [
  { id: 'mmt-gcc-1', country: 'GCC', code: 'MEDICAL_EXAMS', label: 'Medical Exams', sequence: 1, slaDays: 7 },
  { id: 'mmt-gcc-2', country: 'GCC', code: 'PCC', label: 'Police Clearance Certificate (PCC)', sequence: 2, slaDays: 10 },
  { id: 'mmt-gcc-3', country: 'GCC', code: 'BIOMETRICS', label: 'Biometrics', sequence: 3, slaDays: 5 },
  { id: 'mmt-gcc-4', country: 'GCC', code: 'VISA_APPLICATION', label: 'Visa Application', sequence: 4, slaDays: 14 },
  { id: 'mmt-gcc-5', country: 'GCC', code: 'EMBASSY_INTERVIEW', label: 'Embassy Interview', sequence: 5, slaDays: 10 },
  { id: 'mmt-gcc-6', country: 'GCC', code: 'TICKETING', label: 'Ticketing', sequence: 6, slaDays: 4 },
  { id: 'mmt-gcc-7', country: 'GCC', code: 'DEPLOYMENT', label: 'Deployment', sequence: 7, slaDays: 3 },

  { id: 'mmt-ger-1', country: 'Germany', code: 'MEDICAL_EXAMS', label: 'Medical Exams', sequence: 1, slaDays: 10 },
  { id: 'mmt-ger-2', country: 'Germany', code: 'PCC', label: 'Police Clearance Certificate (PCC)', sequence: 2, slaDays: 14 },
  { id: 'mmt-ger-3', country: 'Germany', code: 'BIOMETRICS', label: 'Biometrics', sequence: 3, slaDays: 7 },
  { id: 'mmt-ger-4', country: 'Germany', code: 'VISA_APPLICATION', label: 'Visa Application', sequence: 4, slaDays: 21 },
  { id: 'mmt-ger-5', country: 'Germany', code: 'EMBASSY_INTERVIEW', label: 'Embassy Interview', sequence: 5, slaDays: 14 },
  { id: 'mmt-ger-6', country: 'Germany', code: 'TICKETING', label: 'Ticketing', sequence: 6, slaDays: 5 },
  { id: 'mmt-ger-7', country: 'Germany', code: 'DEPLOYMENT', label: 'Deployment', sequence: 7, slaDays: 3 },

  { id: 'mmt-uk-1', country: 'UK', code: 'MEDICAL_EXAMS', label: 'Medical Exams', sequence: 1, slaDays: 8 },
  { id: 'mmt-uk-2', country: 'UK', code: 'PCC', label: 'Police Clearance Certificate (PCC)', sequence: 2, slaDays: 12 },
  { id: 'mmt-uk-3', country: 'UK', code: 'BIOMETRICS', label: 'Biometrics', sequence: 3, slaDays: 6 },
  { id: 'mmt-uk-4', country: 'UK', code: 'VISA_APPLICATION', label: 'Visa Application', sequence: 4, slaDays: 16 },
  { id: 'mmt-uk-5', country: 'UK', code: 'EMBASSY_INTERVIEW', label: 'Embassy Interview', sequence: 5, slaDays: 12 },
  { id: 'mmt-uk-6', country: 'UK', code: 'TICKETING', label: 'Ticketing', sequence: 6, slaDays: 4 },
  { id: 'mmt-uk-7', country: 'UK', code: 'DEPLOYMENT', label: 'Deployment', sequence: 7, slaDays: 3 },

  { id: 'mmt-usc-1', country: 'USA/Canada', code: 'MEDICAL_EXAMS', label: 'Medical Exams', sequence: 1, slaDays: 9 },
  { id: 'mmt-usc-2', country: 'USA/Canada', code: 'PCC', label: 'Police Clearance Certificate (PCC)', sequence: 2, slaDays: 12 },
  { id: 'mmt-usc-3', country: 'USA/Canada', code: 'BIOMETRICS', label: 'Biometrics', sequence: 3, slaDays: 7 },
  { id: 'mmt-usc-4', country: 'USA/Canada', code: 'VISA_APPLICATION', label: 'Visa Application', sequence: 4, slaDays: 18 },
  { id: 'mmt-usc-5', country: 'USA/Canada', code: 'EMBASSY_INTERVIEW', label: 'Embassy Interview', sequence: 5, slaDays: 14 },
  { id: 'mmt-usc-6', country: 'USA/Canada', code: 'TICKETING', label: 'Ticketing', sequence: 6, slaDays: 4 },
  { id: 'mmt-usc-7', country: 'USA/Canada', code: 'DEPLOYMENT', label: 'Deployment', sequence: 7, slaDays: 3 },
];

export const candidateMigrationMilestones: CandidateMigrationMilestone[] = [
  { id: 'cmm-1', candidateId: 'can-1', country: 'Germany', code: 'MEDICAL_EXAMS', status: 'Completed', completedAt: '2026-03-02T09:00:00.000Z', updatedAt: '2026-03-02T09:00:00.000Z', updatedBy: 'ops-1' },
  { id: 'cmm-2', candidateId: 'can-1', country: 'Germany', code: 'PCC', status: 'Completed', completedAt: '2026-03-07T09:00:00.000Z', updatedAt: '2026-03-07T09:00:00.000Z', updatedBy: 'ops-1' },
  { id: 'cmm-3', candidateId: 'can-1', country: 'Germany', code: 'BIOMETRICS', status: 'Completed', completedAt: '2026-03-11T09:00:00.000Z', updatedAt: '2026-03-11T09:00:00.000Z', updatedBy: 'ops-1' },
  { id: 'cmm-4', candidateId: 'can-1', country: 'Germany', code: 'VISA_APPLICATION', status: 'In Progress', dueDate: '2026-03-25T09:00:00.000Z', updatedAt: '2026-03-15T09:00:00.000Z', updatedBy: 'ops-1' },
  { id: 'cmm-5', candidateId: 'can-1', country: 'Germany', code: 'EMBASSY_INTERVIEW', status: 'Not Started', updatedAt: '2026-03-15T09:00:00.000Z' },
  { id: 'cmm-6', candidateId: 'can-1', country: 'Germany', code: 'TICKETING', status: 'Not Started', updatedAt: '2026-03-15T09:00:00.000Z' },
  { id: 'cmm-7', candidateId: 'can-1', country: 'Germany', code: 'DEPLOYMENT', status: 'Not Started', updatedAt: '2026-03-15T09:00:00.000Z' },

  { id: 'cmm-8', candidateId: 'can-2', country: 'GCC', code: 'MEDICAL_EXAMS', status: 'Completed', completedAt: '2026-03-05T09:00:00.000Z', updatedAt: '2026-03-05T09:00:00.000Z', updatedBy: 'ops-2' },
  { id: 'cmm-9', candidateId: 'can-2', country: 'GCC', code: 'PCC', status: 'Blocked', dueDate: '2026-03-20T09:00:00.000Z', notes: 'Awaiting district authority clearance.', updatedAt: '2026-03-16T09:00:00.000Z', updatedBy: 'ops-2' },
  { id: 'cmm-10', candidateId: 'can-2', country: 'GCC', code: 'BIOMETRICS', status: 'Not Started', updatedAt: '2026-03-16T09:00:00.000Z' },
  { id: 'cmm-11', candidateId: 'can-2', country: 'GCC', code: 'VISA_APPLICATION', status: 'Not Started', updatedAt: '2026-03-16T09:00:00.000Z' },
  { id: 'cmm-12', candidateId: 'can-2', country: 'GCC', code: 'EMBASSY_INTERVIEW', status: 'Not Started', updatedAt: '2026-03-16T09:00:00.000Z' },
  { id: 'cmm-13', candidateId: 'can-2', country: 'GCC', code: 'TICKETING', status: 'Not Started', updatedAt: '2026-03-16T09:00:00.000Z' },
  { id: 'cmm-14', candidateId: 'can-2', country: 'GCC', code: 'DEPLOYMENT', status: 'Not Started', updatedAt: '2026-03-16T09:00:00.000Z' },

  { id: 'cmm-15', candidateId: 'can-4', country: 'UK', code: 'MEDICAL_EXAMS', status: 'Completed', completedAt: '2026-03-01T09:00:00.000Z', updatedAt: '2026-03-01T09:00:00.000Z', updatedBy: 'ops-3' },
  { id: 'cmm-16', candidateId: 'can-4', country: 'UK', code: 'PCC', status: 'Completed', completedAt: '2026-03-04T09:00:00.000Z', updatedAt: '2026-03-04T09:00:00.000Z', updatedBy: 'ops-3' },
  { id: 'cmm-17', candidateId: 'can-4', country: 'UK', code: 'BIOMETRICS', status: 'In Progress', dueDate: '2026-03-22T09:00:00.000Z', updatedAt: '2026-03-12T09:00:00.000Z', updatedBy: 'ops-3' },
  { id: 'cmm-18', candidateId: 'can-4', country: 'UK', code: 'VISA_APPLICATION', status: 'Not Started', updatedAt: '2026-03-12T09:00:00.000Z' },
  { id: 'cmm-19', candidateId: 'can-4', country: 'UK', code: 'EMBASSY_INTERVIEW', status: 'Not Started', updatedAt: '2026-03-12T09:00:00.000Z' },
  { id: 'cmm-20', candidateId: 'can-4', country: 'UK', code: 'TICKETING', status: 'Not Started', updatedAt: '2026-03-12T09:00:00.000Z' },
  { id: 'cmm-21', candidateId: 'can-4', country: 'UK', code: 'DEPLOYMENT', status: 'Not Started', updatedAt: '2026-03-12T09:00:00.000Z' },
];

export const trainingBatches: TrainingBatch[] = [
  {
    id: 'tb-1',
    courseId: 'tr-1',
    name: 'German A1 - March Cohort',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    trainer: 'Anna Muller',
  },
  {
    id: 'tb-2',
    courseId: 'tr-2',
    name: 'German B2 - Intensive',
    startDate: '2026-02-01',
    endDate: '2026-05-15',
    trainer: 'Stefan Weber',
  },
  {
    id: 'tb-3',
    courseId: 'tr-3',
    name: 'IELTS Prep - Weekend',
    startDate: '2026-03-08',
    endDate: '2026-04-26',
    trainer: 'Liam Patel',
  },
];

export const trainingSessions: TrainingSession[] = [
  { id: 'ts-1', batchId: 'tb-1', title: 'A1 Grammar Basics', scheduledAt: '2026-03-10T09:00:00.000Z', durationMinutes: 120 },
  { id: 'ts-2', batchId: 'tb-1', title: 'A1 Speaking Practice', scheduledAt: '2026-03-12T09:00:00.000Z', durationMinutes: 120 },
  { id: 'ts-3', batchId: 'tb-2', title: 'B2 Mock Test', scheduledAt: '2026-03-14T09:00:00.000Z', durationMinutes: 150 },
  { id: 'ts-4', batchId: 'tb-2', title: 'B2 Listening Workshop', scheduledAt: '2026-03-17T09:00:00.000Z', durationMinutes: 120 },
  { id: 'ts-5', batchId: 'tb-3', title: 'IELTS Writing Task 2', scheduledAt: '2026-03-16T11:00:00.000Z', durationMinutes: 120 },
];

export const candidateAttendanceRecords: CandidateAttendanceRecord[] = [
  { id: 'car-1', candidateId: 'can-2', sessionId: 'ts-1', status: 'Present', markedBy: 'trainer-anna', markedAt: '2026-03-10T11:30:00.000Z' },
  { id: 'car-2', candidateId: 'can-2', sessionId: 'ts-2', status: 'Late', markedBy: 'trainer-anna', markedAt: '2026-03-12T11:30:00.000Z' },
  { id: 'car-3', candidateId: 'can-1', sessionId: 'ts-3', status: 'Present', markedBy: 'trainer-stefan', markedAt: '2026-03-14T12:00:00.000Z' },
  { id: 'car-4', candidateId: 'can-1', sessionId: 'ts-4', status: 'Present', markedBy: 'trainer-stefan', markedAt: '2026-03-17T11:00:00.000Z' },
  { id: 'car-5', candidateId: 'can-4', sessionId: 'ts-5', status: 'Absent', markedBy: 'trainer-liam', markedAt: '2026-03-16T13:00:00.000Z' },
];

export const assessmentTemplates: AssessmentTemplate[] = [
  { id: 'asmt-1', courseId: 'tr-1', name: 'A1 Final Assessment', type: 'Language', passingScore: 60, maxScore: 100 },
  { id: 'asmt-2', courseId: 'tr-2', name: 'B2 Final Assessment', type: 'Language', passingScore: 70, maxScore: 100 },
  { id: 'asmt-3', courseId: 'tr-3', name: 'IELTS Mock Exam', type: 'Language', passingScore: 65, maxScore: 100 },
  { id: 'asmt-4', courseId: 'tr-4', name: 'CNA Skill Check', type: 'Technical', passingScore: 75, maxScore: 100 },
];

export const candidateAssessmentAttempts: CandidateAssessmentAttempt[] = [
  { id: 'caa-1', candidateId: 'can-2', templateId: 'asmt-1', attemptNo: 1, score: 68, passed: true, attemptedAt: '2026-03-18T10:00:00.000Z', gradedBy: 'trainer-anna' },
  { id: 'caa-2', candidateId: 'can-1', templateId: 'asmt-2', attemptNo: 1, score: 72, passed: true, attemptedAt: '2026-03-19T10:00:00.000Z', gradedBy: 'trainer-stefan' },
  { id: 'caa-3', candidateId: 'can-4', templateId: 'asmt-3', attemptNo: 1, score: 59, passed: false, attemptedAt: '2026-03-19T13:00:00.000Z', gradedBy: 'trainer-liam' },
];

export const certificateRecords: CertificateRecord[] = [
  {
    id: 'cert-1',
    candidateId: 'can-1',
    courseId: 'tr-2',
    certificateCode: 'GTS-B2-2026-0001',
    issuedAt: '2026-03-20T08:00:00.000Z',
    issuedBy: 'lms-system',
    grade: 'B+',
  },
];
