
import { Task, WorkLog, TodoItem } from './types';

const KEYS = {
  TASKS: 'fwt_tasks',
  LOGS: 'fwt_logs',
  TODOS: 'fwt_todos',
  MONTHLY_STATUS: 'fwt_monthly_status',
};

const defaultTasks: Task[] = [
  { id: '1', name: '掃除', hourlyWage: 1000, active: true, sortOrder: 1 },
  { id: '2', name: '買い物', hourlyWage: 1200, active: true, sortOrder: 2 },
  { id: '3', name: '子守', hourlyWage: 1500, active: true, sortOrder: 3 },
];

export const loadTasks = (): Task[] => {
  const data = localStorage.getItem(KEYS.TASKS);
  return data ? JSON.parse(data) : defaultTasks;
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
};

export const loadLogs = (): WorkLog[] => {
  const data = localStorage.getItem(KEYS.LOGS);
  return data ? JSON.parse(data) : [];
};

export const saveLogs = (logs: WorkLog[]) => {
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
};

export const loadTodos = (): TodoItem[] => {
  const data = localStorage.getItem(KEYS.TODOS);
  return data ? JSON.parse(data) : [];
};

export const saveTodos = (todos: TodoItem[]) => {
  localStorage.setItem(KEYS.TODOS, JSON.stringify(todos));
};

export const loadMonthlyPaymentStatus = (): Record<string, boolean> => {
  const data = localStorage.getItem(KEYS.MONTHLY_STATUS);
  return data ? JSON.parse(data) : {};
};

export const saveMonthlyPaymentStatus = (status: Record<string, boolean>) => {
  localStorage.setItem(KEYS.MONTHLY_STATUS, JSON.stringify(status));
};
