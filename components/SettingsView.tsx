
import React, { useState } from 'react';
import { Task } from '../types';

interface SettingsViewProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ tasks, onUpdateTasks }) => {
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask?.name || !editingTask?.hourlyWage) return;

    if (editingTask.id) {
      // Update
      onUpdateTasks(tasks.map(t => t.id === editingTask.id ? (editingTask as Task) : t));
    } else {
      // Create
      const newTask: Task = {
        id: crypto.randomUUID(),
        name: editingTask.name!,
        hourlyWage: Number(editingTask.hourlyWage),
        active: true,
        sortOrder: tasks.length + 1,
      };
      onUpdateTasks([...tasks, newTask]);
    }
    setEditingTask(null);
  };

  const toggleActive = (id: string) => {
    onUpdateTasks(tasks.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const deleteTask = (id: string) => {
    if (confirm('この作業内容を削除しますか？ (過去の履歴は消えませんが、今後は選択できなくなります)')) {
      onUpdateTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">設定</h2>
        <button 
          onClick={() => setEditingTask({ name: '', hourlyWage: 1000, active: true })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700"
        >
          ＋ 作業を追加
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-700">作業内容と時給の設定</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 flex justify-between items-center group">
              <div>
                <div className="flex items-center gap-2">
                  <p className={`font-bold ${task.active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{task.name}</p>
                  {!task.active && <span className="text-[10px] bg-gray-100 text-gray-400 px-1 rounded font-bold uppercase">無効</span>}
                </div>
                <p className="text-sm text-gray-500">{task.hourlyWage}円 / 時</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setEditingTask(task)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => toggleActive(task.id)}
                  className={`p-2 ${task.active ? 'text-gray-400 hover:text-amber-500' : 'text-amber-500'}`}
                  title={task.active ? '無効にする' : '有効にする'}
                >
                  {task.active ? '👁️' : '🙈'}
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingTask.id ? '作業内容を編集' : '新規作業を追加'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作業名</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  value={editingTask.name || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  placeholder="例: お皿洗い"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">時給 (円)</label>
                <input 
                  required
                  type="number"
                  value={editingTask.hourlyWage || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, hourlyWage: Number(e.target.value) })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold"
                >
                  キャンセル
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
