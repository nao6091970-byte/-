
import React from 'react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10 hidden md:block">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <h1 className="text-xl font-bold text-gray-800">お手伝い勤怠</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setView(ViewMode.PUNCH)}
            className={`px-4 py-2 rounded-md transition-colors ${currentView === ViewMode.PUNCH ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            打刻
          </button>
          <button 
            onClick={() => setView(ViewMode.TODO)}
            className={`px-4 py-2 rounded-md transition-colors ${currentView === ViewMode.TODO ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            やること
          </button>
          <button 
            onClick={() => setView(ViewMode.HISTORY)}
            className={`px-4 py-2 rounded-md transition-colors ${currentView === ViewMode.HISTORY ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            履歴
          </button>
          <button 
            onClick={() => setView(ViewMode.MONTHLY)}
            className={`px-4 py-2 rounded-md transition-colors ${currentView === ViewMode.MONTHLY ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            集計
          </button>
          <button 
            onClick={() => setView(ViewMode.SETTINGS)}
            className={`px-4 py-2 rounded-md transition-colors ${currentView === ViewMode.SETTINGS ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            設定
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
