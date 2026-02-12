
import React, { useState, useEffect } from 'react';
import { Task, WorkLog } from '../types';
import { format, differenceInSeconds } from 'date-fns';
import { ja } from 'date-fns/locale';

// Fallback UUID function if crypto.randomUUID is not available
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface PunchViewProps {
  tasks: Task[];
  activeLog?: WorkLog;
  onAddLog: (log: WorkLog) => void;
  onUpdateLog: (log: WorkLog) => void;
}

const PunchView: React.FC<PunchViewProps> = ({ tasks, activeLog, onAddLog, onUpdateLog }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks.find(t => t.active)?.id || '');
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    let interval: number;
    if (activeLog) {
      interval = window.setInterval(() => {
        const start = new Date(activeLog.startAt);
        setElapsedTime(differenceInSeconds(new Date(), start));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [activeLog]);

  const handleStart = () => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    const newLog: WorkLog = {
      id: generateId(),
      taskId: selectedTaskId,
      startAt: new Date().toISOString(),
      hourlyWage: task.hourlyWage,
      paid: false,
    };
    onAddLog(newLog);
  };

  const handleStop = () => {
    if (!activeLog) return;
    const updatedLog: WorkLog = {
      ...activeLog,
      endAt: new Date().toISOString(),
    };
    onUpdateLog(updatedLog);
  };

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeTask = tasks.find(t => t.id === activeLog?.taskId);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h2 className="text-lg text-gray-500 mb-2">{format(new Date(), 'yyyy年MM月dd日 (eee)', { locale: ja })}</h2>
        <p className="text-4xl font-mono font-bold text-gray-800">{format(new Date(), 'HH:mm:ss')}</p>
      </div>

      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {!activeLog ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">作業内容を選択</label>
              <select 
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">選択してください</option>
                {tasks.filter(t => t.active).map(task => (
                  <option key={task.id} value={task.id}>
                    {task.name} ({task.hourlyWage}円/時)
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleStart}
              disabled={!selectedTaskId}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              開始する 🚀
            </button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">作業中...</p>
              <h3 className="text-2xl font-bold text-gray-800">{activeTask?.name}</h3>
            </div>
            <div className="py-4 bg-blue-50 rounded-xl">
              <p className="text-5xl font-mono font-bold text-blue-700">{formatElapsed(elapsedTime)}</p>
              <p className="text-xs text-blue-500 mt-2">開始: {format(new Date(activeLog.startAt), 'HH:mm')}</p>
            </div>
            <button 
              onClick={handleStop}
              className="w-full py-4 bg-red-500 text-white rounded-xl font-bold text-xl shadow-lg active:scale-95 transition-all"
            >
              終了する 🏁
            </button>
          </div>
        )}
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 max-w-sm">
        <p className="text-sm text-amber-800 leading-relaxed">
          💡 30分の作業で時給の半額が計算されます。端数は分単位で計算し、1円単位で四捨五入されます。
        </p>
      </div>
    </div>
  );
};

export default PunchView;
