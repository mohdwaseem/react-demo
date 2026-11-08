// Form building blocks. In React 19 `ref` is a normal prop, so React Hook Form's
// {...register("email")} (which includes a ref) works on these components directly.

const inputBase =
  "block rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
  "disabled:bg-slate-100";

function borderFor(hasError: boolean) {
  return hasError ? "border-rose-400 focus:ring-rose-400" : "border-slate-300";
}

/** Label + control + error message. `children` is the input/select you put inside. */
export function FormField({ label, htmlFor, error, hint, required, children }: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-rose-600" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

/** fullWidth (default true) → w-full. Pass fullWidth={false} for compact controls like filters. */
type Common = { hasError?: boolean; fullWidth?: boolean };
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & Common & { ref?: React.Ref<HTMLInputElement> };

export function Input({ hasError = false, fullWidth = true, className = "", ...rest }: InputProps) {
  return <input className={`${inputBase} ${borderFor(hasError)} ${fullWidth ? "w-full" : ""} ${className}`} aria-invalid={hasError} {...rest} />;
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & Common & { ref?: React.Ref<HTMLSelectElement> };

export function Select({ hasError = false, fullWidth = true, className = "", children, ...rest }: SelectProps) {
  return (
    <select className={`${inputBase} ${borderFor(hasError)} ${fullWidth ? "w-full" : ""} ${className}`} aria-invalid={hasError} {...rest}>
      {children}
    </select>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & Common & { ref?: React.Ref<HTMLTextAreaElement> };

export function Textarea({ hasError = false, fullWidth = true, className = "", ...rest }: TextareaProps) {
  return <textarea className={`${inputBase} ${borderFor(hasError)} ${fullWidth ? "w-full" : ""} ${className}`} aria-invalid={hasError} {...rest} />;
}
