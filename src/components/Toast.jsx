import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  RiCheckboxCircleFill, 
  RiCloseCircleFill, 
  RiErrorWarningFill, 
  RiInformationFill,
  RiCloseLine
} from 'react-icons/ri';

const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[100] flex flex-col gap-2 w-[92vw] max-w-[350px] pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md';
        let borderColor = 'border-slate-200 dark:border-slate-800';
        let textColor = 'text-slate-900 dark:text-white';
        let Icon = RiInformationFill;
        let iconColor = 'text-blue-500';

        switch (toast.type) {
          case 'success':
            borderColor = 'border-[#D9A441]/50 dark:border-[#D9A441]/40';
            Icon = RiCheckboxCircleFill;
            iconColor = 'text-[#D9A441]';
            break;
          case 'error':
            borderColor = 'border-[#A83E68]/50 dark:border-[#A83E68]/40';
            Icon = RiCloseCircleFill;
            iconColor = 'text-[#A83E68]';
            break;
          case 'warning':
            borderColor = 'border-[#D9A441]/50 dark:border-[#D9A441]/40';
            Icon = RiErrorWarningFill;
            iconColor = 'text-[#D9A441]';
            break;
          case 'info':
            borderColor = 'border-[#A83E68]/50 dark:border-[#A83E68]/40';
            Icon = RiInformationFill;
            iconColor = 'text-[#A83E68]';
            break;
          default:
            break;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border shadow-xl ${bgColor} ${borderColor} ${textColor} pointer-events-auto transition-all duration-300 transform translate-y-0 scale-100`}
            role="alert"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${iconColor}`} />
              <p className="text-xs sm:text-sm font-semibold truncate leading-tight">{toast.message}</p>
            </div>
            {removeToast && (
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                aria-label="Close notification"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
