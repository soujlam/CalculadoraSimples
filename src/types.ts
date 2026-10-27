export interface CalculationRecord {
  id: string;
  expression: string;
  result: number;
  formattedResult: string;
  timestamp: string;
}

export type Operator = '+' | '-' | '*' | '/' | null;

export type ThemeMode = 'dark' | 'light';

export type AppTab = 'calculator' | 'python-code';

export interface BackendStatus {
  status: string;
  runtime: string;
  pythonVersion: string;
  historyCount: number;
  timestamp: string;
}
