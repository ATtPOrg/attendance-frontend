"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export default function Modal({ open, onClose, title, subtitle, children, width = "max-w-lg" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

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

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={`relative w-full ${width} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}
        style={{ fontFamily: "'Inter',sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b flex-shrink-0" style={{ borderColor: "#f3f4f6" }}>
          <div>
            <h2 className="text-[17px] font-bold tracking-tight" style={{ color: "#111827" }}>{title}</h2>
            {subtitle && <p className="text-[13px] mt-0.5" style={{ color: "#9ca3af" }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
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
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-[14px] leading-relaxed mb-6" style={{ color: "#6b7280" }}>{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors hover:bg-gray-50"
          style={{ borderColor: "#e5e7eb", color: "#374151" }}
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: danger ? "#ef4444" : "#4f46e5" }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
