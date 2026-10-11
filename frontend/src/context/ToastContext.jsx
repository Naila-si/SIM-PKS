import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { CustomDialog } from '../components/CustomDialog';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '',
    cancelText: '',
  });

  const showToast = (type = 'info', message, title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, message, title };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showDialog = (type, title, message, onConfirm = null, confirmText = '', cancelText = '') => {
    setDialogState({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  // Intercept window.alert so no ugly native browser alerts appear
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      const msgStr = String(msg || '');
      const isSuccess = msgStr.toLowerCase().includes('berhasil') || msgStr.toLowerCase().includes('sukses');
      const isError = msgStr.toLowerCase().includes('gagal') || msgStr.toLowerCase().includes('error') || msgStr.toLowerCase().includes('kesalahan');
      const type = isSuccess ? 'success' : isError ? 'error' : 'info';
      showToast(type, msgStr, isSuccess ? 'Berhasil' : isError ? 'Perhatian' : 'Informasi');
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showDialog, closeDialog }}>
      {children}

      {/* Modern Floating Toasts Container (Top-Right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none font-sans">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start space-x-3 transition-all duration-300 animate-in slide-in-from-top-3 fade-in bg-white/95 backdrop-blur-md ${
              toast.type === 'success'
                ? 'border-emerald-200 text-slate-800'
                : toast.type === 'error'
                ? 'border-rose-200 text-slate-800'
                : toast.type === 'warning'
                ? 'border-amber-200 text-slate-800'
                : 'border-blue-200 text-slate-800'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : toast.type === 'error'
                  ? 'bg-rose-100 text-rose-600'
                  : toast.type === 'warning'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-blue-100 text-[#00529C]'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              {toast.title && (
                <p className="text-xs font-extrabold text-slate-900 tracking-tight leading-tight">
                  {toast.title}
                </p>
              )}
              <p className="text-xs text-slate-600 font-medium leading-snug mt-0.5">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Global Custom Dialog */}
      <CustomDialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onConfirm={() => {
          if (dialogState.onConfirm) dialogState.onConfirm();
          closeDialog();
        }}
        onCancel={closeDialog}
        onClose={closeDialog}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
