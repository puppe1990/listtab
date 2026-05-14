import { useState, useCallback, useRef, useEffect } from 'react';

const AUTO_HIDE_MS = 2500;

interface ToastState {
  message: string;
  isVisible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    isVisible: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const showToast = useCallback((message: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast({ message, isVisible: true });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, AUTO_HIDE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    message: toast.message,
    isVisible: toast.isVisible,
    showToast,
    hideToast,
  };
}
