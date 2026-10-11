import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Edit3, Info } from 'lucide-react';

export const CustomDialog = ({
  isOpen,
  type = 'info',
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText,
  cancelText,
  promptValue = '',
  setPromptValue
}) => {
  if (!isOpen) return null;

  const handleCancel = onCancel || onClose;
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(type === 'prompt' ? promptValue : true);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
        onClick={handleCancel}
      />
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-7 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs ring-8 ${
            type === 'info' ? 'bg-blue-50 text-[#00529C] ring-blue-50/50' :
            type === 'confirm' ? 'bg-amber-50 text-amber-600 ring-amber-50/50' :
            type === 'success' ? 'bg-emerald-50 text-emerald-600 ring-emerald-50/50' :
            type === 'prompt' ? 'bg-rose-50 text-rose-600 ring-rose-50/50' :
            'bg-rose-50 text-rose-600 ring-rose-50/50'
          }`}>
            {type === 'info' && <Info className="w-8 h-8" />}
            {type === 'confirm' && <AlertTriangle className="w-8 h-8" />}
            {type === 'success' && <CheckCircle2 className="w-8 h-8" />}
            {type === 'prompt' && <Edit3 className="w-8 h-8" />}
            {type === 'error' && <XCircle className="w-8 h-8" />}
          </div>

          <h3 className="text-base font-extrabold text-slate-900 mb-1.5 leading-snug">{title}</h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">{message}</p>
          
          {type === 'prompt' && (
            <div className="mb-5 text-left">
              <textarea
                autoFocus
                rows="3"
                value={promptValue}
                onChange={(e) => setPromptValue && setPromptValue(e.target.value)}
                placeholder="Tuliskan catatan perbaikan di sini..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 outline-none font-medium resize-none transition-all"
              />
            </div>
          )}

          {type === 'confirm' || type === 'prompt' ? (
            <div className="flex space-x-2.5">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {cancelText || 'Batal'}
              </button>
              <button
                type="button"
                disabled={type === 'prompt' && (!promptValue || promptValue.trim() === '')}
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                  type === 'prompt' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#00529C] hover:bg-[#003E75]'
                }`}
              >
                {confirmText || (type === 'prompt' ? 'Kirim Catatan' : 'Ya, Lanjutkan')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className={`w-full px-4 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs ${
                type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                type === 'error' ? 'bg-rose-600 hover:bg-rose-700 text-white' :
                'bg-[#00529C] hover:bg-[#003E75] text-white'
              }`}
            >
              {confirmText || (type === 'success' ? 'Lanjutkan' : 'Mengerti')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
