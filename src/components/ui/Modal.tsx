"use client";
import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

const ANIMATION_MS = 300;

/**
 * Slide-over drawer that enters from the right edge of the screen.
 * Keeps the old centered-modal API (open/onClose/title/subtitle/width)
 * so existing call sites work unchanged.
 */
export default function Modal({ open, onClose, title, subtitle, children, width = "max-w-lg" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  // Two-phase mount so CSS transitions run on both enter and exit.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  // Render-phase adjustments keep mount/exit state in sync with `open`
  // without setting state synchronously inside an effect.
  if (open && !mounted) setMounted(true);
  if (!open && shown) setShown(false);

  useEffect(() => {
    if (open) {
      // Let the browser paint the off-screen position first, then animate in.
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    const t = setTimeout(() => setMounted(false), ANIMATION_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50"
      style={{
        background: shown ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
        backdropFilter: shown ? "blur(4px)" : "none",
        transition: `background ${ANIMATION_MS}ms ease, backdrop-filter ${ANIMATION_MS}ms ease`,
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={`absolute right-0 top-0 h-full w-full ${width} bg-white shadow-2xl flex flex-col`}
        style={{
          transform: shown ? "translateX(0)" : "translateX(100%)",
          transition: `transform ${ANIMATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-[17px] font-bold tracking-tight text-gray-900">{title}</h2>
            {subtitle && <p className="text-[13px] mt-0.5 text-gray-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} color="#9ca3af" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  /** May be async — the dialog shows a spinner and closes when it resolves. */
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

/**
 * Small centered confirmation dialog. Deliberately NOT a drawer — a yes/no
 * question doesn't warrant a full-height panel.
 */
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setBusy(false);
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = async () => {
    setError(null);
    try {
      setBusy(true);
      await onConfirm();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/[0.45] backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current && !busy) handleClose(); }}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2 className="text-[16px] font-bold tracking-tight mb-2 text-gray-900">{title}</h2>
        <p className="text-[14px] leading-relaxed mb-2 text-gray-500">{message}</p>
        {error && <p className="text-[12px] mb-2 text-red-600">{error}</p>}
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={handleClose}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors hover:bg-gray-50 disabled:opacity-50 border-gray-200 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-60 ${danger ? "bg-red-500 text-white" : "bg-sp-accent text-sp-primary"}`}
          >
            {busy && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
