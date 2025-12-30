
import React, { useState } from 'react';
import { analyzeProductFault } from '../services/geminiService';
import { FaultDiagnosis, KnowledgeEntry } from '../types';
import { normalizeToProvince } from '../utils/geoUtils';

interface DiagnosisFormProps {
  onResult: (diagnosis: FaultDiagnosis) => void;
  history: FaultDiagnosis[];
  knowledge: KnowledgeEntry[];
}

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ onResult, history, knowledge }) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('吸尘器');
  const [sourceRegion, setSourceRegion] = useState('');
  const [description, setDescription] = useState('');
  const [remark, setRemark] = useState('');
  
  const [manualIssue, setManualIssue] = useState('');
  const [manualSolution, setManualSolution] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = ['洗车器', '吸尘器', '车载空气净化器', '车载小冰箱', '车载便携充气泵', '户外露营产品'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !description) return;

    const normalizedProvince = normalizeToProvince(sourceRegion);

    if (mode === 'ai') {
      setIsAnalyzing(true);
      try {
        const result = await analyzeProductFault(
          productName, 
          category, 
          description, 
          normalizedProvince,
          history, 
          knowledge, 
          imagePreview || undefined
        );
        const diagnosis: FaultDiagnosis = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          productName,
          category,
          description,
          sourceRegion: normalizedProvince,
          remark: remark.trim() || undefined,
          status: 'Unprocessed',
          imageUrl: imagePreview || undefined,
          result
        };
        onResult(diagnosis);
        resetForm();
      } catch (err: any) {
        alert(err.message || "分析失败。请检查输入信息并重试。");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      const diagnosis: FaultDiagnosis = {
        id: `MAN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        timestamp: Date.now(),
        productName,
        category,
        description,
        sourceRegion: normalizedProvince,
        remark: remark.trim() || undefined,
        status: 'Processed',
        trackingNumber: trackingNumber.trim() || undefined,
        imageUrl: imagePreview || undefined,
        result: {
          faultIssue: manualIssue || '未标注问题',
          confidence: 1.0,
          severity: 'Medium',
          reasoning: '此记录为人工手动录入，未经 AI 分析。',
          suggestedActions: manualSolution ? [manualSolution] : ['按标准售后流程处理'],
          estimatedRepairCost: ''
        },
        actualResult: manualIssue
      };
      onResult(diagnosis);
      resetForm();
    }
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setSourceRegion('');
    setRemark('');
    setManualIssue('');
    setManualSolution('');
    setTrackingNumber('');
    setImagePreview(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex bg-slate-50 p-1 m-6 mb-0 rounded-xl w-fit border border-slate-100">
        <button
          onClick={() => setMode('ai')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            mode === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI 智能诊断
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            mode === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          手动补录
        </button>
      </div>

      <div className="p-8 pt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === 'ai' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          {mode === 'ai' ? '录入故障并开始分析' : '快速登记售后单据'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">产品型号</label>
              <input
                required
                type="text"
                placeholder="例如：CX-500"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">所属品类</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">售后来源 (可选)</label>
              <input
                type="text"
                placeholder="默认为其他区域"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={sourceRegion}
                onChange={(e) => setSourceRegion(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">故障详细描述</label>
            <textarea
              required
              rows={3}
              placeholder="请输入故障的具体表现，如：无法开机、有异响、水压不足等..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {mode === 'manual' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2">
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-indigo-500 uppercase tracking-wider ml-1">故障问题</label>
                <input
                  required
                  type="text"
                  placeholder="核实的故障问题..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={manualIssue}
                  onChange={(e) => setManualIssue(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-indigo-500 uppercase tracking-wider ml-1">处理方案</label>
                <input
                  type="text"
                  placeholder="最终维修措施..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={manualSolution}
                  onChange={(e) => setManualSolution(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">物流单号 (可选)</label>
                <input
                  type="text"
                  placeholder="选填寄回单号..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">备注说明</label>
            <textarea
              rows={1}
              placeholder="内部备注、快递状态等补充信息"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">上传故障图片证据 (可选)</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="h-24 rounded-lg object-cover shadow-sm" />
                      <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 mb-2 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-xs text-slate-500">点击或拖拽上传照片</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <div className="flex-1 self-end">
              <button
                disabled={isAnalyzing || !productName || !description || (mode === 'manual' && !manualIssue)}
                type="submit"
                className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isAnalyzing ? 'bg-indigo-400 cursor-not-allowed' : (mode === 'ai' ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200' : 'bg-slate-800 hover:bg-slate-900')
                }`}
              >
                {isAnalyzing ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>AI 正在深入分析...</span></>
                ) : (
                  <>
                    {mode === 'ai' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    <span>{mode === 'ai' ? '开始智能诊断' : '确认录入'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiagnosisForm;
