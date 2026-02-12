
import { format, parseISO, differenceInMinutes, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { WorkLog, Task } from './types';

export const calculateMinutes = (start: string, end: string): number => {
  return differenceInMinutes(parseISO(end), parseISO(start));
};

export const calculateAmount = (minutes: number, hourlyWage: number): number => {
  const hours = minutes / 60;
  return Math.round(hours * hourlyWage);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
};

export const getMonthKey = (dateStr: string): string => {
  return format(parseISO(dateStr), 'yyyy-MM');
};

export const getLogsForMonth = (logs: WorkLog[], monthKey: string): WorkLog[] => {
  const start = startOfMonth(new Date(`${monthKey}-01`));
  const end = endOfMonth(start);
  return logs.filter(log => {
    const logDate = parseISO(log.startAt);
    return isWithinInterval(logDate, { start, end });
  });
};

export const downloadCSV = (logs: WorkLog[], tasks: Task[], monthName: string) => {
  const headers = ['日付', '作業内容', '開始', '終了', '時間(分)', '時給', '金額(円)', '支払状態'];
  const rows = logs.map(log => {
    const task = tasks.find(t => t.id === log.taskId);
    const duration = log.endAt ? calculateMinutes(log.startAt, log.endAt) : 0;
    const amount = calculateAmount(duration, log.hourlyWage);
    return [
      format(parseISO(log.startAt), 'yyyy/MM/dd'),
      task?.name || '不明',
      format(parseISO(log.startAt), 'HH:mm'),
      log.endAt ? format(parseISO(log.endAt), 'HH:mm') : '-',
      duration,
      log.hourlyWage,
      amount,
      log.paid ? '済' : '未'
    ].join(',');
  });

  const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `勤怠集計_${monthName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
