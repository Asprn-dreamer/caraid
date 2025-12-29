
import React, { useState, useEffect } from 'react';
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
  const { result, actualResult: existingActualResult, remark: existingRemark, trackingNumber: existingTracking, status, description: originalDescription } = diagnosis;
  const [tempActualResult, setTempActualResult] = useState(existingActualResult || '');
  const [tempTracking, setTempTracking] = useState(existingTracking || '');
  const [tempRemark, setTempRemark] = useState(existingRemark || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isTrackingSaved, setIsTrackingSaved] = useState(false);
  const [isRemarkSaved, setIsRemarkSaved] = useState(false);

  // 当外部数据变化时，同步更新内部缓存，确保“保留输入信息”的一致性
  useEffect(() => {
    setTempRemark(existingRemark || '');
  }, [existingRemark]);

  useEffect(() => {
    setTempActualResult(existingActualResult || '');
  }, [existingActualResult]);

  useEffect(() => {
    setTempTracking(existingTracking || '');
  }, [existingTracking]);

  const steps = [
    { label: '售后报修', active: true },
    { label: 'AI 诊断', active: true },
    { label: '方案核实', active: status === 'Processing' || status === 'Processed' },
    { label: '售后完成', active: status === 'Processed' }
  ];

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

  const handleQueryAndSaveTracking = () => {
    if (onUpdateTracking) {
      const trimmed = tempTracking.trim();
      onUpdateTracking(diagnosis.id, trimmed);
      setIsTrackingSaved(true);
      setTimeout(() => setIsTrackingSaved(false), 2000);
      
      // 如果有单号，触发跳转查询
      if (trimmed) {
        window.open(`https://www.kuaidi100.com/chaxun?nu=${trimmed}`, '_blank');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" aria-modal="true" role="dialog">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${diagnosis.id.startsWith('MAN-') ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white'}`}>
                {diagnosis.id.startsWith('MAN-') ? 'Manual' : 'AI Analysis'}
              </span>
              <h2 className="text-xl font-bold text-slate-900">售后详情</h2>
            </div>
            <p className="text-slate-400 text-xs">单号: {diagnosis.id} • {new Date(diagnosis.timestamp).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          {/* Progress Stepper */}
          <div className="flex justify-between items-center px-4 py-6 bg-slate-50/50 rounded-2xl border border-slate-100">
            {steps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-400'}`}>
                    {step.active ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-[11px] font-bold ${step.active ? 'text-indigo-600' : 'text-slate-400'}`}>{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-100 mx-2 -mt-6 relative">
                    <div className={`absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-1000 ${steps[i+1].active ? 'w-full' : 'w-0'}`}></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Analysis Result */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                  故障分析结论
                </h3>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xl font-black text-slate-900 tracking-tight leading-tight">{result.faultIssue}</p>
                    <div className="flex flex-col items-end shrink-0 ml-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">AI 置信度</span>
                      <span className="text-lg font-bold text-indigo-600">{Math.round(result.confidence * 100)}%</span>
                    </div>
                  </div>
                  <div className="text-slate-600 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-400 text-[10px] uppercase mb-1 tracking-widest">分析逻辑推演</p>
                    <p className="italic">"{result.reasoning}"</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.suggestedActions.map((action, idx) => (
                      <div key={idx} className="flex gap-2 items-start p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/50 text-xs font-medium text-slate-700">
                        <span className="text-indigo-500 mt-0.5">●</span>
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Original Description Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  客户报修原始描述
                </h3>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {originalDescription || '暂无描述信息'}
                  </p>
                </div>
              </div>

              {/* Customer Remark Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  售后处理备注
                </h3>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                  <textarea 
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] transition-all"
                    value={tempRemark}
                    onChange={(e) => setTempRemark(e.target.value)}
                    placeholder="填写售后人员跟进记录、特殊要求等..."
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handleSaveRemark}
                      className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                        isRemarkSaved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white hover:bg-black'
                      }`}
                    >
                      {isRemarkSaved ? '保存成功 ✓' : '保存备注'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Product Info Card */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">资产档案</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">产品型号</p>
                    <p className="font-bold text-lg">{diagnosis.productName}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-slate-400">所属品类</p>
                      <p className="text-sm font-semibold">{diagnosis.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">来源区域</p>
                      <p className="text-sm font-semibold">{diagnosis.sourceRegion}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logistics & Updates */}
              <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">售后物流单号</label>
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={tempTracking}
                        onChange={(e) => setTempTracking(e.target.value)}
                        placeholder="输入单号..."
                      />
                      <button onClick={handleQueryAndSaveTracking} className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors">
                        {isTrackingSaved ? '✓' : '查询'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">真实故障核实</label>
                    <textarea 
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[80px]"
                      value={tempActualResult}
                      onChange={(e) => setTempActualResult(e.target.value)}
                      placeholder="回填实际维修发现..."
                    />
                    <button onClick={handleSaveActual} className="w-full mt-2 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                      {isSaved ? '已保存成功' : '保存核实结果'}
                    </button>
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
