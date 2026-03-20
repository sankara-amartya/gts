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
