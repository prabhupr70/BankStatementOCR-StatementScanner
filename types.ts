export interface Transaction {
  date: string;
  description: string;
  category: string;
  amount: number;
}

export enum FileStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ExtractionResult {
  transactions: Transaction[];
  rawText?: string;
}
