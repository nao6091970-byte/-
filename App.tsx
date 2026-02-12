
import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, Task, WorkLog, TodoItem } from './types';
import { loadTasks, saveTasks, loadLogs, saveLogs, loadTodos, saveTodos, loadMonthlyPaymentStatus, saveMonthlyPaymentStatus } from './store';
import Navbar from './components/Navbar';
import PunchView from './components/PunchView';
import HistoryView from './components/HistoryView';
import MonthlyView from './components/MonthlyView';
import SettingsView from './components/SettingsView';
import TodoView from './components/TodoView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.PUNCH);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [monthlyStatus, setMonthlyStatus] = useState<Record<string, boolean>>({});

  // Initialize data
  useEffect(() => {
    setTasks(loadTasks());
    setLogs(loadLogs());
    setTodos(loadTodos());
    setMonthlyStatus(loadMonthlyPaymentStatus());
  }, []);

  // Update logic for tasks
  const handleUpdateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const handleUpdateTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    saveTodos(newTodos);
  };

  // Improved update logic for logs using functional updates to ensure latest state
  const handleAddLog = useCallback((log: WorkLog) => {
    setLogs(prev => {
      const next = [...prev, log];
      saveLogs(next);
      return next;
    });
  }, []);

  const handleUpdateLog = useCallback((log: WorkLog) => {
    setLogs(prev => {
      const next = prev.map(l => l.id === log.id ? log : l);
      saveLogs(next);
      return next;
    });
  }, []);

  const handleDeleteLog = useCallback((id: string) => {
    setLogs(prev => {
      const next = prev.filter(l => l.id !== id);
      saveLogs(next);
      return next;
    });
  }, []);

  const handleUpdateMonthlyStatus = (status: Record<string, boolean>) => {
    setMonthlyStatus(status);
    saveMonthlyPaymentStatus(status);
  };

  const activeLog = logs.find(l => !l.endAt);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-16">
      <Navbar currentView={view} setView={setView} />
      
      <main className="max-w-4xl mx-auto p-4">
        {view === ViewMode.PUNCH && (
          <PunchView 
            tasks={tasks} 
            activeLog={activeLog} 
            onAddLog={handleAddLog}
            onUpdateLog={handleUpdateLog}
          />
        )}
        
        {view === ViewMode.TODO && (
          <TodoView 
            todos={todos}
            onUpdateTodos={handleUpdateTodos}
          />
        )}
        
        {view === ViewMode.HISTORY && (
          <HistoryView 
            logs={logs} 
            tasks={tasks} 
            onDeleteLog={handleDeleteLog}
            onUpdateLog={handleUpdateLog}
            onAddLog={handleAddLog}
          />
        )}
        
        {view === ViewMode.MONTHLY && (
          <MonthlyView 
            logs={logs} 
            tasks={tasks}
            monthlyStatus={monthlyStatus}
            onTogglePaid={(month, paid) => {
              const newStatus = { ...monthlyStatus, [month]: paid };
              handleUpdateMonthlyStatus(newStatus);
              // Also update individual logs in that month
              setLogs(prev => {
                const next = prev.map(log => {
                  const logMonth = log.startAt.substring(0, 7);
                  if (logMonth === month) return { ...log, paid };
                  return log;
                });
                saveLogs(next);
                return next;
              });
            }}
          />
        )}
        
        {view === ViewMode.SETTINGS && (
          <SettingsView 
            tasks={tasks} 
            onUpdateTasks={handleUpdateTasks} 
          />
        )}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        <NavButton active={view === ViewMode.PUNCH} onClick={() => setView(ViewMode.PUNCH)} icon="⏱️" label="打刻" />
        <NavButton active={view === ViewMode.TODO} onClick={() => setView(ViewMode.TODO)} icon="✅" label="やる事" />
        <NavButton active={view === ViewMode.HISTORY} onClick={() => setView(ViewMode.HISTORY)} icon="📜" label="履歴" />
        <NavButton active={view === ViewMode.MONTHLY} onClick={() => setView(ViewMode.MONTHLY)} icon="📊" label="集計" />
        <NavButton active={view === ViewMode.SETTINGS} onClick={() => setView(ViewMode.SETTINGS)} icon="⚙️" label="設定" />
      </div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center p-2 text-xs ${active ? 'text-blue-600' : 'text-gray-500'}`}
  >
    <span className="text-xl mb-1">{icon}</span>
    <span>{label}</span>
  </button>
);

export default App;
