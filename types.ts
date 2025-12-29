export interface GroundingLink {
  title: string;
  uri: string;
}

export interface Feedback {
  rating: 'Helpful' | 'Not Helpful';
  comment?: string;
}

export type ProcessingStatus = 'Unprocessed' | 'Processing' | 'Processed';

export interface FaultDiagnosis {
  id: string;
  timestamp: number;
  productName: string;
  category: string;
  description: string;
  sourceRegion: string; 
  remark?: string;
  status: ProcessingStatus;
  trackingNumber?: string;
  result: {
    faultIssue: string;
    confidence: number;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    reasoning: string;
    suggestedActions: string[];
    estimatedRepairCost: string;
  };
  actualResult?: string;
  feedback?: Feedback;
}

export interface KnowledgeEntry {
  id: string;
  productName: string;
  faultType: string;
  cause: string;
  location: string;
  solution: string;
}

export enum AppTab {
  DIAGNOSIS = 'diagnosis',
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  KNOWLEDGE = 'knowledge'
}
