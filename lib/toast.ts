'use client';

/**
 * lib/toast.ts
 * Global Toast & Auth Guard Notification System for Azyra.
 * Can be imported anywhere (components, hooks, or event handlers).
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'auth';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, defaults to 4000
  action?: ToastAction;
}

type Listener = (toasts: ToastItem[]) => void;

let activeToasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn([...activeToasts]));
}

export const toast = {
  show(item: Omit<ToastItem, 'id'>): string {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = {
      id,
      duration: 4000,
      ...item,
    };
    activeToasts = [newToast, ...activeToasts].slice(0, 5); // Keep max 5 visible
    notify();

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, newToast.duration);
    }
    return id;
  },

  success(title: string, message?: string, action?: ToastAction) {
    return toast.show({ type: 'success', title, message, action });
  },

  error(title: string, message?: string, action?: ToastAction) {
    return toast.show({ type: 'error', title, message, action, duration: 5000 });
  },

  warning(title: string, message?: string, action?: ToastAction) {
    return toast.show({ type: 'warning', title, message, action });
  },

  info(title: string, message?: string, action?: ToastAction) {
    return toast.show({ type: 'info', title, message, action });
  },

  auth(title: string = 'Authentication Required', message?: string) {
    return toast.show({
      type: 'auth',
      title,
      message: message || 'Please sign in to continue. Redirecting to login...',
      duration: 3500,
      action: {
        label: 'Log In Now',
        onClick: () => {
          if (typeof window !== 'undefined') {
            const redirect = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?redirect=${redirect}`;
          }
        },
      },
    });
  },

  dismiss(id: string) {
    activeToasts = activeToasts.filter((t) => t.id !== id);
    notify();
  },

  clear() {
    activeToasts = [];
    notify();
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    listener([...activeToasts]);
    return () => {
      listeners.delete(listener);
    };
  },
};

/**
 * Global unauthorized handler:
 * Displays a sleek auth toast and smoothly redirects to `/login` with the current URL encoded.
 */
export function handleUnauthorized(customMessage?: string, delayMs = 1200) {
  if (typeof window === 'undefined') return;

  toast.auth(
    'Session Expired or Login Required',
    customMessage || 'Your session is not authenticated. Redirecting you to sign in...'
  );

  setTimeout(() => {
    const currentUrl = window.location.pathname + window.location.search;
    window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
  }, delayMs);
}
