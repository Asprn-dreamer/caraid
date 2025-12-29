
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const tabNames: Record<AppTab, string> = {
    [AppTab.DIAGNOSIS]: '售后分析',
    [AppTab.DASHBOARD]: '数据看板',
    [AppTab.HISTORY]: '历史记录',
    [AppTab.KNOWLEDGE]: '知识库'
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-screen z-40">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => setActiveTab(AppTab.DIAGNOSIS)}
        >
          <div className="flex items-baseline scale-90 origin-left select-none">
            <div className="flex items-baseline">
              <span className="text-4xl font-[900] italic text-slate-900 tracking-tighter">
                Cara
              </span>
              <div className="relative inline-block">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" className="text-slate-900">
                    <path d="M2 1 L9 5 V7 L2 11 Z M18 1 L11 5 V7 L18 11 Z" />
                  </svg>
                </div>
                <span className="text-4xl font-[900] italic text-slate-900 tracking-tighter">i</span>
              </div>
              <span className="text-4xl font-[900] italic text-slate-900 tracking-tighter">
                d
              </span>
            </div>
            <span className="ml-2 text-2xl font-bold text-slate-900 whitespace-nowrap" style={{ fontFamily: 'system-ui, sans-serif' }}>
              車管家
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => setActiveTab(AppTab.DIAGNOSIS)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === AppTab.DIAGNOSIS ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            售后分析
          </button>
          <button
            onClick={() => setActiveTab(AppTab.DASHBOARD)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === AppTab.DASHBOARD ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            数据看板
          </button>
          <button
            onClick={() => setActiveTab(AppTab.HISTORY)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === AppTab.HISTORY ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            历史记录
          </button>
          <button
            onClick={() => setActiveTab(AppTab.KNOWLEDGE)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === AppTab.KNOWLEDGE ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            知识库
          </button>
        </nav>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">服务状态</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">Gemini 3 Pro 在线</span>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{tabNames[activeTab]}</h1>
            <p className="text-slate-500">智能管理和监控产品健康状况。</p>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
