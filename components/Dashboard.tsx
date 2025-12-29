import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaultDiagnosis } from '../types';
import { normalizeToProvince } from '../utils/geoUtils';

interface DashboardProps {
  history: FaultDiagnosis[];
}

type TimeGranularity = 'day' | 'week' | 'month' | 'quarter' | 'year';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b', '#ec4899', '#0ea5e9'];

const CATEGORIES = ['全部品类', '洗车器', '吸尘器', '车载空气净化器', '车载小冰箱', '车载便携充气泵', '户外露营产品'];

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [granularity, setGranularity] = useState<TimeGranularity>('month');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部品类');

  const filteredHistory = useMemo(() => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    
    if (granularity === 'day') { start.setHours(0,0,0,0); end.setDate(end.getDate() + 1); end.setHours(0,0,0,0); }
    else if (granularity === 'week') { const day = start.getDay() || 7; start.setDate(start.getDate() - day + 1); start.setHours(0,0,0,0); end.setTime(start.getTime() + 7 * 86400000); }
    else if (granularity === 'month') { start.setDate(1); start.setHours(0,0,0,0); end.setMonth(end.getMonth() + 1); end.setDate(1); end.setHours(0,0,0,0); }
    else if (granularity === 'quarter') { const q = Math.floor(start.getMonth() / 3); start.setMonth(q * 3, 1); start.setHours(0,0,0,0); end.setMonth(start.getMonth() + 3, 1); end.setHours(0,0,0,0); }
    else if (granularity === 'year') { start.setMonth(0, 1); start.setHours(0,0,0,0); end.setFullYear(end.getFullYear() + 1, 0, 1); end.setHours(0,0,0,0); }

    return history.filter(item => item.timestamp >= start.getTime() && item.timestamp < end.getTime());
  }, [history, selectedDate, granularity]);

  const regionStats = useMemo(() => {
    const regions: Record<string, number> = {};
    filteredHistory.forEach(d => {
      const prov = normalizeToProvince(d.sourceRegion);
      regions[prov] = (regions[prov] || 0) + 1;
    });
    return Object.entries(regions)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredHistory]);

  const issueStats = useMemo(() => {
    const counts: Record<string, number> = {};
    
    if (selectedCategory === '全部品类') {
      filteredHistory.forEach(h => {
        counts[h.category] = (counts[h.category] || 0) + 1;
      });
    } else {
      const dataForIssues = filteredHistory.filter(h => h.category === selectedCategory);
      dataForIssues.forEach(d => {
        // 统计故障问题分布
        counts[d.result.faultIssue] = (counts[d.result.faultIssue] || 0) + 1;
      });
    }

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredHistory, selectedCategory]);

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 w-72">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setSelectedDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <span className="font-bold text-slate-700">{year}年 {month + 1}月</span>
          <button onClick={() => setSelectedDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['一', '二', '三', '四', '五', '六', '日'].map(d => <span key={d} className="text-[10px] font-bold text-slate-300 uppercase">{d}</span>)}
          {days.map((day, idx) => (
            <div key={idx} className="h-8 flex items-center justify-center">
              {day && (
                <button
                  onClick={() => { setSelectedDate(new Date(year, month, day)); setShowCalendar(false); }}
                  className={`w-7 h-7 rounded-lg text-xs transition-all ${selectedDate.getDate() === day && selectedDate.getMonth() === month ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-indigo-50 text-slate-600'}`}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all">
              <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
              <span className="text-sm font-bold text-slate-700">{selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </button>
            {showCalendar && renderCalendar()}
          </div>
          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            {['day', 'week', 'month', 'quarter', 'year'].map(t => (
              <button key={t} onClick={() => setGranularity(t as TimeGranularity)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${granularity === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                {t === 'day' ? '日' : t === 'week' ? '周' : t === 'month' ? '月' : t === 'quarter' ? '季' : '年'}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">多维售后分析看板</h2>
          <p className="text-xs text-slate-400">所有数据均已汇总到标准省级行政区</p>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm text-slate-300">
           <h3 className="text-lg font-bold text-slate-400">当前时段暂无售后数据</h3>
           <p className="mt-1 text-sm text-slate-400/60">请尝试切换日历日期或统计颗粒度</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: '售后案例总数', value: filteredHistory.length, color: 'text-slate-800' },
              { label: '覆盖省份数量', value: regionStats.length, color: 'text-indigo-600' }
            ].map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[550px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    售后来源省份分布排行
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">基于标准化省份的数据分布</p>
                </div>
              </div>
              
              <div className="flex-1 w-full overflow-y-auto">
                <ResponsiveContainer width="100%" height={Math.max(regionStats.length * 40, 450)}>
                  <BarChart data={regionStats} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                      width={80}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                      {regionStats.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[550px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {selectedCategory === '全部品类' ? '各产品类型售后分布' : '常见故障问题频率'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedCategory === '全部品类' ? '跨品类售后密集度分析' : `针对 ${selectedCategory} 的具体问题分布分析`}
                  </p>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              <div className="flex-1 w-full">
                {issueStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={issueStats} margin={{ bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} height={40} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                        {issueStats.map((_, index) => (
                          <Cell key={index} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <svg className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm font-bold">该选定条件下暂无数据</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
