import type { Client, Mandate, CommercialTerm, ProgressUpdate, Candidate, DocumentPack, TrainingCourse, Transaction } from './definitions';

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
    { id: 'can-1', name: 'John Doe', email: 'john.doe@email.com', phone: '111-222-3333', mandateId: 'man-1', status: 'Interviewing', migrationStatus: 'Visa processing', createdAt: '2023-06-01' },
    { id: 'can-2', name: 'Jane Smith', email: 'jane.smith@email.com', phone: '444-555-6666', mandateId: 'man-1', status: 'Training', migrationStatus: 'Awaiting documents', createdAt: '2023-06-05' },
    { id: 'can-3', name: 'Peter Jones', email: 'peter.jones@email.com', phone: '777-888-9999', mandateId: 'man-2', status: 'Screening', migrationStatus: 'Not started', createdAt: '2023-06-10' },
    { id: 'can-4', name: 'Maria Garcia', email: 'maria.g@email.com', phone: '123-987-4561', mandateId: 'man-5', status: 'Documentation', migrationStatus: 'Documents submitted', createdAt: '2023-06-15' },
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
