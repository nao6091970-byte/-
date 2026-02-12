
import React, { useState } from 'react';
import { WorkLog, Task } from '../types';
import { format, parseISO, setHours, setMinutes } from 'date-fns';
import { calculateMinutes, calculateAmount, formatCurrency } from '../utils';

interface HistoryViewProps {
  logs: WorkLog[];
  tasks: Task[];
  onDeleteLog: (id: string) => void;
  onUpdateLog: (log: WorkLog) => void;
  onAddLog: (log: WorkLog) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ logs, tasks, onDeleteLog, onUpdateLog, onAddLog }) => {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  
  // Manual form state
  const [manualForm, setManualForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    taskId: tasks[0]?.id || ''
  });

  const sortedLogs = [...logs].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task = tasks.find(t => t.id === manualForm.taskId);
    if (!task) return;

    const baseDate = parseISO(manualForm.date);
    const [startH, startM] = manualForm.startTime.split(':').map(Number);
    const [endH, endM] = manualForm.endTime.split(':').map(Number);

    const startAt = setMinutes(setHours(baseDate, startH), startM).toISOString();
    const endAt = setMinutes(setHours(baseDate, endH), endM).toISOString();

    const newLog: WorkLog = {
      id: crypto.randomUUID(),
      taskId: manualForm.taskId,
      startAt,
      endAt,
      hourlyWage: task.hourlyWage,
      paid: false
    };

    onAddLog(newLog);
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold text-gray-800">作業履歴</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="text-xs sm:text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-bold border border-blue-100"
          >
            ＋ 手入力で追加
          </button>
          <span className="text-sm text-gray-500 hidden sm:inline">{logs.length} 件の記録</span>
        </div>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400">履歴がまだありません。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLogs.map((log) => {
            const task = tasks.find(t => t.id === log.taskId);
            const duration = log.endAt ? calculateMinutes(log.startAt, log.endAt) : null;
            const amount = duration !== null ? calculateAmount(duration, log.hourlyWage) : 0;
            const isConfirming = confirmingId === log.id;

            return (
              <div key={log.id} className={`bg-white p-4 rounded-xl shadow-sm border ${log.paid ? 'border-green-100' : 'border-gray-100'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {format(parseISO(log.startAt), 'MM/dd')}
                    </span>
                    <h3 className="font-bold text-gray-800">{task?.name || '不明な作業'}</h3>
                    {log.paid && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">支払済</span>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(parseISO(log.startAt), 'HH:mm')} 〜 {log.endAt ? format(parseISO(log.endAt), 'HH:mm') : '実行中'}
                    {duration !== null && <span className="ml-2 font-medium">({duration}分)</span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{log.endAt ? formatCurrency(amount) : '---'}</p>
                    <p className="text-xs text-gray-400">{log.hourlyWage}円/時</p>
                  </div>
                  
                  <div className="flex items-center h-10">
                    {!isConfirming ? (
                      <button 
                        type="button"
                        onClick={() => setConfirmingId(log.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="削除"
                      >
                        <span className="text-xl">🗑️</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                        <button 
                          onClick={() => setConfirmingId(null)}
                          className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-bold"
                        >
                          戻る
                        </button>
                        <button 
                          onClick={() => {
                            onDeleteLog(log.id);
                            setConfirmingId(null);
                          }}
                          className="text-xs bg-red-500 text-white px-3 py-2 rounded-lg font-bold shadow-sm shadow-red-200"
                        >
                          削除OK
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">手入力で記録を追加</h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                <input 
                  type="date"
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                  <input 
                    type="time"
                    value={manualForm.startTime}
                    onChange={(e) => setManualForm({ ...manualForm, startTime: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                  <input 
                    type="time"
                    value={manualForm.endTime}
                    onChange={(e) => setManualForm({ ...manualForm, endTime: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作業内容</label>
                <select 
                  value={manualForm.taskId}
                  onChange={(e) => setManualForm({ ...manualForm, taskId: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {tasks.filter(t => t.active).map(task => (
                    <option key={task.id} value={task.id}>{task.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold"
                >
                  キャンセル
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200"
                >
                  記録を追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
