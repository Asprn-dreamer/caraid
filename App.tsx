import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DiagnosisForm from './components/DiagnosisForm';
import DiagnosisResult from './components/DiagnosisResult';
import Dashboard from './components/Dashboard';
import KnowledgeBase from './components/KnowledgeBase';
import { AppTab, FaultDiagnosis, KnowledgeEntry, ProcessingStatus } from './types';

const INITIAL_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'kb-1',
    productName: '手持无线吸尘器',
    faultType: '吸力明显减弱',
    cause: '滤网堵塞或电机进风口阻塞',
    location: 'HEPA 滤网组件',
    solution: '清洗或更换 HEPA 滤网，检查吸嘴是否有异物堵塞。'
  },
  {
    id: 'kb-2',
    productName: '车载充气泵',
    faultType: '充气缓慢且噪音大',
    cause: '气缸密封圈磨损',
    location: '内部压缩气缸',
    solution: '检查润滑油，必要时更换压缩组件。'
  }
];

const INITIAL_DATA: FaultDiagnosis[] = [
  {
    id: 'csa-001',
    timestamp: Date.now() - 86400000 * 2,
    productName: '高压洗车器',
    category: '洗车器',
    sourceRegion: '江苏省',
    remark: '客户反馈在野外露营时使用，环境沙尘较大。',
    description: '开机后水压非常小，伴随异常抖动。',
    status: 'Processed',
    trackingNumber: 'SF1234567890',
    result: {
      faultIssue: '压力泵密封阀磨损导致水压泄露',
      confidence: 0.88,
      severity: 'Medium',
      reasoning: '江苏省近期湿度较高，且客户提及沙尘环境，可能导致密封件被细微颗粒磨损或因潮湿产生水垢堵塞阀口。',
      suggestedActions: [
        '检查进水过滤网是否堵塞。',
        '检查进水管接口是否漏气。',
        '清理压力泵出口阀门。'
      ],
      estimatedRepairCost: ''
    },
    actualResult: '进水滤网严重堵塞',
    feedback: { rating: 'Helpful', comment: '清理了滤网后恢复了。' }
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DIAGNOSIS);
  const [history, setHistory] = useState<FaultDiagnosis[]>(() => {
    const saved = localStorage.getItem('fixwise_history');
    const parsed = saved ? JSON.parse(saved) : INITIAL_DATA;
    return parsed.map((item: any) => ({
      ...item,
      status: item.status || 'Unprocessed'
    }));
  });
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>(() => {
    const saved = localStorage.getItem('fixwise_knowledge');
    return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE;
  });
  const [currentDiagnosis, setCurrentDiagnosis] = useState<FaultDiagnosis | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('fixwise_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('fixwise_knowledge', JSON.stringify(knowledge));
  }, [knowledge]);

  const handleNewDiagnosis = (diagnosis: FaultDiagnosis) => {
    setHistory(prev => [diagnosis, ...prev]);
    setCurrentDiagnosis(diagnosis);
  };

  const handleUpdateActualResult = (id: string, actualResult: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, actualResult } : item
    ));
  };

  const handleUpdateTracking = (id: string, trackingNumber: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, trackingNumber: trackingNumber.trim() || undefined } : item
    ));
  };

  const handleUpdateRemark = (id: string, remark: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, remark: remark.trim() || undefined } : item
    ));
  };

  const handleUpdateStatus = (id: string, status: ProcessingStatus) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };

  const handleSaveToKnowledge = (entry: KnowledgeEntry) => {
    setKnowledge(prev => {
      const exists = prev.find(k => k.productName === entry.productName && k.faultType === entry.faultType);
      if (exists) {
        return prev.map(k => k.id === exists.id ? entry : k);
      }
      return [entry, ...prev];
    });
  };

  const handleUpdateKnowledge = (updated: KnowledgeEntry) => {
    setKnowledge(prev => prev.map(k => k.id === updated.id ? updated : k));
  };

  const handleDeleteKnowledge = (id: string) => {
    if (confirm('确定要删除这条专家知识吗？')) {
      setKnowledge(prev => prev.filter(k => k.id !== id));
    }
  };

  const filteredHistory = history.filter(item => 
    item.productName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
    (item.trackingNumber && item.trackingNumber.toLowerCase().includes(historySearchQuery.toLowerCase()))
  );

  const getStatusStyle = (status: ProcessingStatus) => {
    switch (status) {
      case 'Unprocessed': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Processed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const handleQueryLogistics = (num: string) => {
    window.open(`https://www.kuaidi100.com/chaxun?nu=${num}`, '_blank');
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-7xl mx-auto">
        {activeTab === AppTab.DIAGNOSIS && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <DiagnosisForm onResult={handleNewDiagnosis} history={history} knowledge={knowledge} />
          </div>
        )}

        {activeTab === AppTab.DASHBOARD && (
          <div className="animate-in fade-in duration-500">
            <Dashboard history={history} />
          </div>
        )}

        {activeTab === AppTab.KNOWLEDGE && (
          <div className="animate-in fade-in duration-500">
            <KnowledgeBase 
              entries={knowledge} 
              onAddEntry={handleSaveToKnowledge} 
              onUpdateEntry={handleUpdateKnowledge}
              onDeleteEntry={handleDeleteKnowledge}
            />
          </div>
        )}

        {activeTab === AppTab.HISTORY && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative flex-1 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6.197-6.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索产品、快递单号..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                />
              </div>
              <div className="text-sm text-slate-400 font-medium px-2">
                共找到 {filteredHistory.length} 条记录
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">日期</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">产品信息</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">诊断结果</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">售后状态</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">物流单号</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors align-top">
                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{item.productName}</span>
                            <span className="text-xs text-indigo-500 font-medium">{item.category}</span>
                            <span className="text-[10px] text-slate-400">{item.sourceRegion}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-slate-700 line-clamp-1">{item.result.faultIssue}</span>
                            {item.actualResult && <span className="text-[11px] text-emerald-600 font-bold">核实: {item.actualResult}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={item.status}
                            onChange={(e) => handleUpdateStatus(item.id, e.target.value as ProcessingStatus)}
                            className={`appearance-none px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all ${getStatusStyle(item.status)}`}
                          >
                            <option value="Unprocessed">未处理</option>
                            <option value="Processing">处理中</option>
                            <option value="Processed">已处理</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          {item.trackingNumber ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-mono text-slate-600 font-bold">{item.trackingNumber}</span>
                              <button 
                                onClick={() => handleQueryLogistics(item.trackingNumber!)}
                                className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                              >
                                一键查询
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">未录入</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button 
                            onClick={() => setCurrentDiagnosis(item)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-bold"
                          >
                            详情
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                        未找到匹配的历史记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentDiagnosis && (
          <DiagnosisResult 
            diagnosis={currentDiagnosis} 
            onClose={() => setCurrentDiagnosis(null)}
            onUpdateActualResult={handleUpdateActualResult}
            onUpdateTracking={handleUpdateTracking}
            onUpdateRemark={handleUpdateRemark}
            onSaveToKnowledge={handleSaveToKnowledge}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;
