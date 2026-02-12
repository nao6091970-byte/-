
import React, { useState } from 'react';
import { WorkLog, Task } from '../types';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';
import { calculateMinutes, calculateAmount, formatCurrency, getLogsForMonth, downloadCSV } from '../utils';

interface MonthlyViewProps {
  logs: WorkLog[];
  tasks: Task[];
  monthlyStatus: Record<string, boolean>;
  onTogglePaid: (month: string, paid: boolean) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ logs, tasks, monthlyStatus, onTogglePaid }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  // Last 12 months for dropdown
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 11),
    end: new Date(),
  }).reverse();

  const monthLogs = getLogsForMonth(logs, selectedMonth).filter(l => l.endAt);
  const totalMinutes = monthLogs.reduce((acc, log) => acc + calculateMinutes(log.startAt, log.endAt!), 0);
  const totalAmount = monthLogs.reduce((acc, log) => acc + calculateAmount(calculateMinutes(log.startAt, log.endAt!), log.hourlyWage), 0);
  const isPaid = monthlyStatus[selectedMonth] || false;

  // Group by task for visualization
  const taskBreakdown = monthLogs.reduce((acc: Record<string, { minutes: number, amount: number }>, log) => {
    const task = tasks.find(t => t.id === log.taskId);
    const name = task?.name || '不明';
    const mins = calculateMinutes(log.startAt, log.endAt!);
    const amt = calculateAmount(mins, log.hourlyWage);
    
    if (!acc[name]) acc[name] = { minutes: 0, amount: 0 };
    acc[name].minutes += mins;
    acc[name].amount += amt;
    return acc;
  }, {});

  const handleCloseMonth = () => {
    if (confirm(`${selectedMonth}の分を締め（支払い完了）にしますか？`)) {
      onTogglePaid(selectedMonth, true);
    }
  };

  const handleExportCSV = () => {
    downloadCSV(monthLogs, tasks, selectedMonth);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">月次集計</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none p-2 bg-white border border-gray-200 text-gray-600 rounded-lg shadow-sm text-sm font-bold hover:bg-gray-50 flex items-center justify-center gap-1"
          >
            📥 CSV出力
          </button>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 sm:flex-none p-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map(m => (
              <option key={format(m, 'yyyy-MM')} value={format(m, 'yyyy-MM')}>
                {format(m, 'yyyy年MM月')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-gray-500 mb-1">合計報酬額</p>
          <p className="text-4xl font-black text-blue-600 mb-4">{formatCurrency(totalAmount)}</p>
          
          <div className="flex flex-col gap-2 w-full max-w-[240px]">
            {!isPaid ? (
              <button 
                onClick={handleCloseMonth}
                className="w-full px-6 py-3 rounded-full font-bold bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                🔒 この月を締める
              </button>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full px-6 py-3 rounded-full font-bold bg-green-100 text-green-700 flex items-center justify-center gap-2">
                  ✅ 締め・支払い済み
                </div>
                <button 
                  onClick={() => onTogglePaid(selectedMonth, false)}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  締まりを解除
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-4">活動状況</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-800">{monthLogs.length}</p>
              <p className="text-xs text-gray-400">回数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{(totalMinutes / 60).toFixed(1)}</p>
              <p className="text-xs text-gray-400">合計時間 (h)</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
             <p className="text-xs text-gray-400 leading-relaxed">
               ※ 30分単位での計算ルールを適用した月次合計です。
             </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-700">作業別の内訳</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {Object.entries(taskBreakdown).length === 0 ? (
            <p className="p-8 text-center text-gray-400">データがありません。</p>
          ) : (
            Object.entries(taskBreakdown).map(([name, data]) => (
              <div key={name} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-500">{data.minutes}分 ({(data.minutes/60).toFixed(1)}h)</p>
                </div>
                <div className="text-right font-bold text-gray-700">
                  {formatCurrency(data.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyView;
