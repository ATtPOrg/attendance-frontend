interface FormFieldProps {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, id, required, children }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] uppercase tracking-[0.1em] mb-1.5 font-medium"
        style={{ color: "#6b7280" }}
      >
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

export function Input({ className = "", fullWidth = true, ...props }: InputProps) {
  return (
    <input
      className={`${fullWidth ? "w-full" : ""} px-3 py-2.5 rounded-lg border text-[14px] outline-none transition-colors focus:border-[#570000] ${className}`}
      style={{ borderColor: "#e5e7eb", color: "#111827", fontFamily: "'Inter',sans-serif", background: "#fff" }}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  fullWidth?: boolean;
}

export function Select({ className = "", fullWidth = true, children, ...props }: SelectProps) {
  return (
    <select
      className={`${fullWidth ? "w-full" : ""} px-3 py-2.5 rounded-lg border text-[14px] outline-none transition-colors focus:border-[#570000] ${className}`}
      style={{ borderColor: "#e5e7eb", color: "#111827", fontFamily: "'Inter',sans-serif", background: "#fff" }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none transition-colors focus:border-[#570000] resize-none"
      style={{ borderColor: "#e5e7eb", color: "#111827", fontFamily: "'Inter',sans-serif", background: "#fff" }}
      rows={3}
      {...props}
    />
  );
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 justify-end pt-2 mt-4 border-t" style={{ borderColor: "#f3f4f6" }}>
      {children}
    </div>
  );
}

export function BtnPrimary({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{ background: "#FED65B", color: "#570000", fontFamily: "'Inter',sans-serif" }}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="px-5 py-2.5 rounded-lg text-[13px] font-medium border transition-colors hover:bg-gray-50"
      style={{ borderColor: "#e5e7eb", color: "#374151", fontFamily: "'Inter',sans-serif" }}
      {...props}
    >
      {children}
    </button>
  );
}
