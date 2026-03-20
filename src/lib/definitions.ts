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
    name: string;
    email: string;
    phone: string;
    mandateId: string;
    status: CandidateStatus;
    migrationStatus: string;
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
