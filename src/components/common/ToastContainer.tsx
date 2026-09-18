import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePayroll();

  if (toasts.length === 0) return null;

  return (
    <aside aria-label="Notifications" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-[#4A6B53] shrink-0" />;
        let borderClass = 'border-[#E2E4DE]';
        let bgClass = 'bg-[#FFFFFF]';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0" />;
          borderClass = 'border-[#C2DBC7]';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />;
          borderClass = 'border-[#FDE68A]';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />;
          borderClass = 'border-[#FECACA]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded border ${borderClass} ${bgClass} shadow-sm transition-all duration-200`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[#18191B]">{toast.title}</h4>
              <p className="text-xs text-[#5F6773] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#8A92A0] hover:text-[#18191B] p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};
