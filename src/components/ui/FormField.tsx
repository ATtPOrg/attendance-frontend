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
        className="block text-[11px] uppercase tracking-[0.1em] mb-1.5 font-medium text-gray-500"
      >
        {label}{required && <span className="text-red-500"> *</span>}
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
      className={`${fullWidth ? "w-full" : ""} px-3 py-2.5 rounded-lg border text-[14px] outline-none transition-colors focus:border-[#570000] border-gray-200 text-gray-900 bg-white ${className}`}
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
      className={`${fullWidth ? "w-full" : ""} px-3 py-2.5 rounded-lg border text-[14px] outline-none transition-colors focus:border-[#570000] border-gray-200 text-gray-900 bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none transition-colors focus:border-[#570000] resize-none border-gray-200 text-gray-900 bg-white"
      rows={3}
      {...props}
    />
  );
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 justify-end pt-2 mt-4 border-t border-gray-100">
      {children}
    </div>
  );
}

export function BtnPrimary({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 bg-sp-accent text-sp-primary"
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="px-5 py-2.5 rounded-lg text-[13px] font-medium border transition-colors hover:bg-gray-50 border-gray-200 text-gray-700"
      {...props}
    >
      {children}
    </button>
  );
}
