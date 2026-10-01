import React from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check } from 'lucide-react';

export const ModalMarkAllNotificationsRead = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-[#00529C] max-w-sm w-full p-6 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Blue Circle Icon with Checkmark Badge (Matching Image 1) */}
        <div className="relative w-16 h-16 rounded-full bg-[#3B82F6] text-white flex items-center justify-center mx-auto shadow-md">
          <Bell className="w-8 h-8 fill-white/20" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-[#00529C] flex items-center justify-center shadow-xs border border-slate-100">
            <div className="w-4 h-4 rounded-full bg-[#00529C] text-white flex items-center justify-center text-[9px] font-extrabold">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-[#001D38] tracking-tight">
            Tandai Semua Sudah Dibaca
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Seluruh notifikasi akan ditandai sebagai sudah dibaca. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Action Buttons (Matching Image 1 Grid) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm && onConfirm();
              onClose();
            }}
            className="w-full py-2 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer leading-tight flex items-center justify-center text-center"
          >
            Tandai Sudah<br />Dibaca
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ModalMarkAllNotificationsRead;
