import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const CustomDialog = ({ isOpen, type = 'info', title, message, onConfirm, onCancel, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose || onCancel}></div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            type === 'info' ? 'bg-blue-100 text-blue-600' :
            type === 'confirm' ? 'bg-amber-100 text-amber-600' :
            type === 'success' ? 'bg-emerald-100 text-emerald-600' :
            'bg-rose-100 text-rose-600'
          }`}>
            {type === 'info' && <CheckCircle2 className="w-8 h-8" />}
            {type === 'confirm' && <AlertTriangle className="w-8 h-8" />}
            {type === 'success' && <CheckCircle2 className="w-8 h-8" />}
            {type === 'error' && <XCircle className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 mb-6">{message}</p>
          
          {type === 'confirm' ? (
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-sm font-bold rounded-xl transition-colors"
              >
                Ya, Lanjutkan
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
