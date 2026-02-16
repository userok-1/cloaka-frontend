import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastContainer: HTMLDivElement | null = null;
let toastRoot: ReturnType<typeof createRoot> | null = null;
const toasts: ToastMessage[] = [];
let updateToasts: ((toasts: ToastMessage[]) => void) | null = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
    toastRoot = createRoot(toastContainer);
    toastRoot.render(<ToastContainer />);
  }
}

function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    updateToasts = setMessages;
    return () => {
      updateToasts = null;
    };
  }, []);

  const removeToast = (id: string) => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.splice(index, 1);
      updateToasts?.(toasts.slice());
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96">
      {messages.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${
        type === 'success'
          ? 'bg-zinc-900 border-emerald-500/20'
          : 'bg-zinc-900 border-red-500/20'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      )}
      <p className="text-sm text-zinc-100 flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function showToast(message: string, type: ToastType) {
  ensureToastContainer();
  const id = Math.random().toString(36).substring(7);
  toasts.push({ id, message, type });
  updateToasts?.(toasts.slice());
}

export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
};
