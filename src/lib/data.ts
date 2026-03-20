import type {
  CandidateCommunicationEvent,
  CandidateDocumentRecord,
  CandidateIdentityProfile,
  CandidateLifecycleSnapshot,
  CandidatePaymentRecord,
  CandidateTimelineEvent,
  CandidateTrainingEnrollment,
  Candidate,
  CandidateWorkflowInstance,
  Client,
  CommercialTerm,
  DocumentPack,
  Mandate,
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
  { id: 'cdr-1', candidateId: 'can-1', documentName: 'Passport', status: 'Verified', url: '#', lastUpdatedAt: '2026-03-11T10:00:00.000Z', verifiedBy: 'ops-1' },
  { id: 'cdr-2', candidateId: 'can-1', documentName: 'Nursing Degree', status: 'Verified', url: '#', lastUpdatedAt: '2026-03-11T10:10:00.000Z', verifiedBy: 'ops-1' },
  { id: 'cdr-3', candidateId: 'can-1', documentName: 'B2 Certificate', status: 'Submitted', url: '#', lastUpdatedAt: '2026-03-16T09:00:00.000Z' },
  { id: 'cdr-4', candidateId: 'can-2', documentName: 'Passport', status: 'Submitted', url: '#', lastUpdatedAt: '2026-03-19T07:30:00.000Z' },
  { id: 'cdr-5', candidateId: 'can-2', documentName: 'Nursing Degree', status: 'Missing', lastUpdatedAt: '2026-03-19T07:30:00.000Z' },
  { id: 'cdr-6', candidateId: 'can-4', documentName: 'Passport', status: 'Verified', url: '#', lastUpdatedAt: '2026-03-05T11:30:00.000Z', verifiedBy: 'ops-2' },
  { id: 'cdr-7', candidateId: 'can-4', documentName: 'Visa Application', status: 'Submitted', url: '#', lastUpdatedAt: '2026-03-12T10:00:00.000Z' },
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
