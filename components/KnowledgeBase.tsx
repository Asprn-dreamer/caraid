
import React, { useState } from 'react';
import { KnowledgeEntry } from '../types';

interface KnowledgeBaseProps {
  entries: KnowledgeEntry[];
  onAddEntry: (entry: KnowledgeEntry) => void;
  onUpdateEntry: (entry: KnowledgeEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ entries, onAddEntry, onUpdateEntry, onDeleteEntry }) => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<KnowledgeEntry>>({});

  const filtered = entries.filter(e => 
    e.productName.toLowerCase().includes(search.toLowerCase()) ||
    e.faultType.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productName && formData.faultType) {
      if (editingId) {
        onUpdateEntry({ ...formData, id: editingId } as KnowledgeEntry);
      } else {
        onAddEntry({
          ...formData,
          id: Math.random().toString(36).substr(2, 9),
        } as KnowledgeEntry);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({});
    }
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id);
    setFormData(entry);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6.197-6.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="搜索专家知识（产品、部位、故障描述）..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({}); }}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          贡献专家知识
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(entry => (
          <div key={entry.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{entry.productName}</h3>
                <p className="text-sm text-slate-500">{entry.faultType}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(entry)} className="p-1.5 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => onDeleteEntry(entry.id)} className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 w-16">真实原因:</span>
                <p className="text-sm text-slate-700">{entry.cause}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 w-16">故障部位:</span>
                <p className="text-sm text-slate-700 font-medium text-indigo-600">{entry.location}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 w-16">解决方案:</span>
                <p className="text-sm text-slate-700 italic">"{entry.solution}"</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-50">
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">已接入 AI 预测引擎</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{editingId ? '修改专家知识' : '向知识库贡献内容'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">产品名称</label>
                <input
                  required
                  className="w-full px-4 py-2 mt-1 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.productName || ''}
                  placeholder="例如：手持吸尘器"
                  onChange={e => setFormData({...formData, productName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">故障/现象描述</label>
                <input
                  required
                  className="w-full px-4 py-2 mt-1 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.faultType || ''}
                  placeholder="例如：间歇性停机"
                  onChange={e => setFormData({...formData, faultType: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">经过验证的真实原因</label>
                <input
                  className="w-full px-4 py-2 mt-1 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.cause || ''}
                  placeholder="例如：电池温控探头松动"
                  onChange={e => setFormData({...formData, cause: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">具体物理部位</label>
                <input
                  className="w-full px-4 py-2 mt-1 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.location || ''}
                  placeholder="例如：主控板右侧探头接口"
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">标准化解决方案</label>
                <textarea
                  className="w-full px-4 py-2 mt-1 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.solution || ''}
                  placeholder="说明如何修复..."
                  rows={3}
                  onChange={e => setFormData({...formData, solution: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  {editingId ? '保存修改' : '确认存入'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
