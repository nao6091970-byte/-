
import React, { useState } from 'react';
import { TodoItem } from '../types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TodoViewProps {
  todos: TodoItem[];
  onUpdateTodos: (todos: TodoItem[]) => void;
}

const TodoView: React.FC<TodoViewProps> = ({ todos, onUpdateTodos }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    notes: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      date: form.date,
      title: form.title,
      notes: form.notes,
      completed: false
    };

    onUpdateTodos([...todos, newTodo]);
    setForm({ ...form, title: '', notes: '' });
    setIsModalOpen(false);
  };

  const toggleComplete = (id: string) => {
    onUpdateTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    if (confirm('この予定を削除しますか？')) {
      onUpdateTodos(todos.filter(t => t.id !== id));
    }
  };

  // Group todos by date
  const groupedTodos = todos.reduce((acc: Record<string, TodoItem[]>, todo) => {
    if (!acc[todo.date]) acc[todo.date] = [];
    acc[todo.date].push(todo);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedTodos).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold text-gray-800">やることリスト</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all flex items-center gap-1"
        >
          <span>＋</span> 予定を追加
        </button>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">予定がありません。</p>
          <p className="text-gray-300 text-sm mt-1">「予定を追加」から新しく作りましょう！</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500 border-l-4 border-blue-500 pl-3 ml-1">
                {format(parseISO(date), 'yyyy年MM月dd日 (eee)', { locale: ja })}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {groupedTodos[date].sort((a,b) => Number(a.completed) - Number(b.completed)).map(todo => (
                  <div key={todo.id} className={`bg-white p-4 rounded-xl shadow-sm border transition-all flex items-start gap-4 ${todo.completed ? 'opacity-60 bg-gray-50' : 'border-gray-100'}`}>
                    <input 
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <h4 className={`font-bold text-gray-800 text-lg ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.title}
                      </h4>
                      {todo.notes && (
                        <p className={`text-sm mt-1 whitespace-pre-wrap ${todo.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                          {todo.notes}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-300 hover:text-red-500 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">新しい予定</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                <input 
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作業名・タイトル</label>
                <input 
                  type="text"
                  autoFocus
                  placeholder="例: キッチンの片付け"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備考欄（手入力）</label>
                <textarea 
                  rows={3}
                  placeholder="具体的な内容や注意点など"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold"
                >
                  キャンセル
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700"
                >
                  追加する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoView;
