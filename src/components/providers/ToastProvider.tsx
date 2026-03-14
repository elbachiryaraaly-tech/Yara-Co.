"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import Link from "next/link";
import {
  ToastProvider as RadixToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";

type ToastOptions = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  variant?: "default" | "success" | "error";
};

type ToastContextValue = {
  toast: (options: ToastOptions | string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 4000;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {} };
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ToastOptions | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((options: ToastOptions | string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const opts = typeof options === "string" ? { title: options } : options;
    setContent(opts);
    setOpen(true);
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
      setContent(null);
      timeoutRef.current = null;
    }, TOAST_DURATION);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(open);
    if (!open) setContent(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToastProvider>
        {children}
        <ToastViewport />
        {content && (
          <Toast open={open} onOpenChange={handleOpenChange} variant={content.variant ?? "success"}>
            <ToastTitle>{content.title}</ToastTitle>
            {content.description && <ToastDescription>{content.description}</ToastDescription>}
            {content.actionLabel && content.actionHref && (
              <Link
                href={content.actionHref}
                className="mt-2 inline-block text-sm font-medium text-[var(--gold)] hover:underline"
                onClick={() => setOpen(false)}
              >
                {content.actionLabel}
              </Link>
            )}
            <ToastClose />
          </Toast>
        )}
      </RadixToastProvider>
    </ToastContext.Provider>
  );
}
