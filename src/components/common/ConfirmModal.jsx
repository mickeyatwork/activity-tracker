import React from 'react';
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger", // 'danger' | 'primary'
  loading = false,
  onConfirm = () => {},
  onCancel = () => {}
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl space-y-4 border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-full shrink-0 ${
            confirmVariant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
          }`}>
            {confirmVariant === 'danger' ? <AlertTriangle size={24} /> : <AlertCircle size={24} />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-white text-sm font-semibold rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50 ${
              confirmVariant === 'danger' 
                ? 'bg-rose-600 hover:bg-rose-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
