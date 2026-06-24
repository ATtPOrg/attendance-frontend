"use client";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

/** Centered loading spinner for page/section content while data is fetched. */
export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={26} color="#570000" className="animate-spin" />
      <span className="text-[13px] text-gray-400">{label}</span>
    </div>
  );
}

/** Error panel with retry, shown when a fetch fails. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50">
        <AlertCircle size={20} color="#dc2626" />
      </div>
      <p className="text-[14px] font-medium text-gray-900">
        Couldn&apos;t load data
      </p>
      <p className="text-[13px] max-w-sm text-gray-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg border text-[13px] font-medium transition-colors hover:bg-gray-50 border-gray-200 text-gray-700"
        >
          <RefreshCw size={13} /> Try again
        </button>
      )}
    </div>
  );
}

/** Inline error line for form/action failures inside drawers and modals. */
export function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-[12px] mt-2 text-red-600">
      <AlertCircle size={13} /> {message}
    </p>
  );
}
