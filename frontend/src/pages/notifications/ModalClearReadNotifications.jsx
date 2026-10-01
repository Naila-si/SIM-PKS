import React from 'react';
import { createPortal } from 'react-dom';
import { BellOff } from 'lucide-react';

export const ModalClearReadNotifications = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Upper Body Area (Matching Image 4) */}
        <div className="p-8 text-center space-y-4">
          {/* Muted Bell Icon in Soft Blue Circle */}
          <div className="w-14 h-14 rounded-full bg-[#EEF4FF] text-slate-700 flex items-center justify-center mx-auto shadow-xs">
            <BellOff className="w-7 h-7 stroke-[2]" />
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-[#001D38] tracking-tight">
              Bersihkan Notifikasi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Apakah Anda yakin ingin menghapus seluruh notifikasi yang sudah dibaca? Notifikasi yang belum dibaca akan tetap tersimpan.
            </p>
          </div>
        </div>

        {/* Footer Container with Light Blue Background #EEF4FF (Matching Image 4) */}
        <div className="px-6 py-4 bg-[#EEF4FF] border-t border-blue-100 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs text-center"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm && onConfirm();
              onClose();
            }}
            className="w-full py-2.5 bg-[#C92A2A] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer text-center"
          >
            Bersihkan
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ModalClearReadNotifications;
