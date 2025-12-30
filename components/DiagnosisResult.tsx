
import React, { useState, useEffect, useRef } from 'react';
import { FaultDiagnosis, KnowledgeEntry } from '../types';

interface DiagnosisResultProps {
  diagnosis: FaultDiagnosis;
  onClose: () => void;
  onUpdateActualResult?: (id: string, actualResult: string) => void;
  onUpdateTracking?: (id: string, trackingNumber: string) => void;
  onUpdateRemark?: (id: string, remark: string) => void;
  onSaveToKnowledge?: (entry: KnowledgeEntry) => void;
}

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ 
  diagnosis, 
  onClose, 
  onUpdateActualResult, 
  onUpdateTracking,
  onUpdateRemark,
  onSaveToKnowledge 
}) => {
  const { result, actualResult: existingActualResult, remark: existingRemark, trackingNumber: existingTracking, status, description: originalDescription, imageUrl } = diagnosis;
  const [tempActualResult, setTempActualResult] = useState(existingActualResult || '');
  const [tempTracking, setTempTracking] = useState(existingTracking || '');
  const [tempRemark, setTempRemark] = useState(existingRemark || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isTrackingSaved, setIsTrackingSaved] = useState(false);
  const [isRemarkSaved, setIsRemarkSaved] = useState(false);
  
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (tempTracking.trim() === (existingTracking || '')) return;
    const timer = setTimeout(() => {
      if (onUpdateTracking) {
        onUpdateTracking(diagnosis.id, tempTracking.trim());
        setIsTrackingSaved(true);
        setTimeout(() => setIsTrackingSaved(false), 2000);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [tempTracking, diagnosis.id, onUpdateTracking, existingTracking]);

  useEffect(() => { setTempRemark(existingRemark || ''); }, [existingRemark]);
  useEffect(() => { setTempActualResult(existingActualResult || ''); }, [existingActualResult]);
  useEffect(() => { setTempTracking(existingTracking || ''); }, [existingTracking]);

  const steps = [
    { label: '售后报修', active: true },
    { label: 'AI 诊断', active: true },
    { label: '方案核实', active: status === 'Processing' || status === 'Processed' },
    { label: '售后完成', active: status === 'Processed' }
  ];

  const getSeverityStyle = (s: string) => {
    switch(s) {
      case 'Critical': return 'from-rose-600 to-rose-700 text-white';
      case 'High': return 'from-orange-500 to-orange-600 text-white';
      case 'Medium': return 'from-amber-400 to-amber-500 text-white';
      default: return 'from-emerald-500 to-emerald-600 text-white';
    }
  };

  const handleSaveActual = () => {
    if (onUpdateActualResult) {
      onUpdateActualResult(diagnosis.id, tempActualResult);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSaveRemark = () => {
    if (onUpdateRemark) {
      onUpdateRemark(diagnosis.id, tempRemark);
      setIsRemarkSaved(true);
      setTimeout(() => setIsRemarkSaved(false), 2000);
    }
  };

  const handleManualQuery = () => {
    const trimmed = tempTracking.trim();
    if (trimmed) {
      if (onUpdateTracking) onUpdateTracking(diagnosis.id, trimmed);
      window.open(`https://www.kuaidi100.com/chaxun?nu=${trimmed}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" aria-modal="true" role="dialog">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col max-h-[92vh]">
        
        {/* Modern Header */}
        <div className="px-10 py-8 flex justify-between items-start border-b border-slate-100 bg-white">
          <div className="flex gap-5 items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${diagnosis.id.startsWith('MAN-') ? 'bg-slate-100' : 'bg-indigo-600'}`}>
              {diagnosis.id.startsWith('MAN-') ? (
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">售后详情报告</h2>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${getSeverityStyle(result.severity)}`}>
                  {result.severity} Level
                </span>
              </div>
              <p className="text-slate-400 text-sm font-medium">工单流水: <span className="text-slate-600 font-bold">{diagnosis.id}</span> • {new Date(diagnosis.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all shadow-sm border border-slate-100">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-10 overflow-y-auto flex-1 bg-slate-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Content: The Report */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* AI Report Card */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                  AI 智能诊断引擎结论
                </h3>
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                     <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                   
                   <div className="flex flex-col gap-6 relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="flex-1">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">判定的故障问题</p>
                           <p className="text-2xl font-black text-slate-900 leading-tight">{result.faultIssue}</p>
                        </div>
                        <div className="text-right">
                           <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Confidence</span>
                                <span className="text-xl font-black text-indigo-600">{Math.round(result.confidence * 100)}%</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                           故障推演逻辑
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{result.reasoning}"</p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.suggestedActions.map((action, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all group">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-xs font-bold text-slate-700 leading-snug">{action}</span>
                          </div>
                        ))}
                     </div>
                   </div>
                </div>
              </div>

              {/* Customer Voice Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  报修原始反馈
                </h3>
                <div className="bg-slate-100/50 rounded-[2rem] p-8 border border-slate-100 relative">
                   <div className="absolute top-4 left-4 text-slate-200">
                     <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 7.55228 14.017 7V5C14.017 4.44772 14.4647 4 15.017 4H19.017C20.6739 4 22.017 5.34315 22.017 7V15C22.017 18.866 18.883 22 15.017 22H14.017V21ZM2.017 21L2.017 18C2.017 16.8954 2.91243 16 4.017 16H7.017C7.56928 16 8.017 15.5523 8.017 15V9C8.017 8.44772 7.56928 8 7.017 8H3.017C2.46472 8 2.017 7.55228 2.017 7V5C2.017 4.44772 2.46472 4 3.017 4H7.017C8.67386 4 10.017 5.34315 10.017 7V15C10.017 18.866 6.883 22 3.017 22H2.017V21Z" /></svg>
                   </div>
                   <p className="text-base text-slate-700 leading-relaxed font-medium pl-8 py-2">
                    {originalDescription || '无详细描述'}
                   </p>
                   {imageUrl && (
                    <div className="mt-8">
                      <div className="inline-block p-1.5 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden group">
                        <img src={imageUrl} alt="Proof" className="max-h-[300px] w-auto rounded-[1.25rem] object-contain hover:scale-105 transition-transform duration-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Operations */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Status Timeline Card */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">售后服务节点</h4>
                 <div className="space-y-6">
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${step.active ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-300'}`}>
                           {step.active ? (
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           ) : <span className="text-sm font-bold">{i+1}</span>}
                        </div>
                        <div className="flex-1 border-b border-slate-50 pb-2">
                           <p className={`text-sm font-black ${step.active ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</p>
                           {step.active && i === 1 && <p className="text-[10px] text-indigo-500 font-bold">引擎诊断已就绪</p>}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Logistics & Real Info Card */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>
                 </div>
                 
                 <div className="relative z-10 space-y-8">
                    {/* Logistics */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">物流状态同步 (Auto-Save)</label>
                        {isTrackingSaved && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-black animate-pulse">Synced</span>}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                          value={tempTracking}
                          onChange={(e) => setTempTracking(e.target.value)}
                          placeholder="寄回快递单号..."
                        />
                        <button 
                          disabled={!tempTracking.trim()}
                          onClick={handleManualQuery} 
                          className="px-5 py-3 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-indigo-50 transition-colors disabled:opacity-30"
                        >
                          TRACK
                        </button>
                      </div>
                    </div>

                    {/* Verification */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">故障核实录入</label>
                      <textarea 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] placeholder:text-slate-600"
                        value={tempActualResult}
                        onChange={(e) => setTempActualResult(e.target.value)}
                        placeholder="维修工程师核实后的真实原因..."
                      />
                      <button onClick={handleSaveActual} className={`w-full py-4 rounded-xl text-xs font-black transition-all shadow-xl ${isSaved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        {isSaved ? '已保存核实结论' : '提交核实记录'}
                      </button>
                    </div>

                    {/* Remark */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">售后服务备注</label>
                      <textarea 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px] placeholder:text-slate-600"
                        value={tempRemark}
                        onChange={(e) => setTempRemark(e.target.value)}
                        placeholder="客服跟进备注..."
                      />
                      <button onClick={handleSaveRemark} className={`w-full py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${isRemarkSaved ? 'bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
                        {isRemarkSaved ? '备注已保存' : '保存备注信息'}
                      </button>
                    </div>
                 </div>
              </div>

              {/* Asset Snapshot Card */}
              <div className="bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100 flex flex-col gap-4">
                 <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">产品规格档案</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100/50">
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">型号</p>
                       <p className="text-sm font-black text-slate-900">{diagnosis.productName}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100/50">
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">品类</p>
                       <p className="text-sm font-black text-slate-900">{diagnosis.category}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100/50 col-span-2">
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">售后覆盖区域</p>
                       <p className="text-sm font-black text-slate-900">{diagnosis.sourceRegion}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResult;
