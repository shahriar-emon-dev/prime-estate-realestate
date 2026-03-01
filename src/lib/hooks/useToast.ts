/**
 * Toast Notification Hook
 * Simple toast notification system without external dependencies
 * 
 * Usage:
 * const toast = useToast();
 * toast.success('Operation successful!');
 * toast.error('Something went wrong');
 * toast.info('Information message');
 */

'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

let toastCount = 0;
const listeners: Array<(toast: Toast) => void> = [];

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastCount}`;
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    listeners.forEach(listener => listener(newToast));

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 3000);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'success', message, duration });
  }, [addToast]);

  const error = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'error', message, duration });
  }, [addToast]);

  const info = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'info', message, duration });
  }, [addToast]);

  const warning = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'warning', message, duration });
  }, [addToast]);

  return {
    toasts,
    success,
    error,
    info,
    warning,
    remove: removeToast,
  };
}

// Singleton toast for global usage
class ToastManager {
  private listeners: Array<(toast: Toast) => void> = [];

  subscribe(listener: (toast: Toast) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(toast: Toast) {
    this.listeners.forEach(listener => listener(toast));
  }

  success(message: string, duration = 3000) {
    this.notify({
      id: `toast-${Date.now()}`,
      type: 'success',
      message,
      duration,
    });
  }

  error(message: string, duration = 3000) {
    this.notify({
      id: `toast-${Date.now()}`,
      type: 'error',
      message,
      duration,
    });
  }

  info(message: string, duration = 3000) {
    this.notify({
      id: `toast-${Date.now()}`,
      type: 'info',
      message,
      duration,
    });
  }

  warning(message: string, duration = 3000) {
    this.notify({
      id: `toast-${Date.now()}`,
      type: 'warning',
      message,
      duration,
    });
  }
}

export const toast = new ToastManager();
