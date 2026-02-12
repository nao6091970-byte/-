
export interface Task {
  id: string;
  name: string;
  hourlyWage: number;
  active: boolean;
  sortOrder: number;
}

export interface WorkLog {
  id: string;
  taskId: string;
  startAt: string; // ISO string
  endAt?: string;  // ISO string
  hourlyWage: number; // Stored at the time of log creation
  paid: boolean;
}

export interface TodoItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes: string;
  completed: boolean;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalMinutes: number;
  totalAmount: number;
  isPaid: boolean;
  logCount: number;
}

export enum ViewMode {
  PUNCH = 'PUNCH',
  TODO = 'TODO',
  HISTORY = 'HISTORY',
  MONTHLY = 'MONTHLY',
  SETTINGS = 'SETTINGS'
}
