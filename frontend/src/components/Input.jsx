// Input: campo de formulário base com label, erro e disabled.
import { useId } from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  suffix,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-[Outfit] font-medium text-[#111111]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[
            'h-10 w-full px-4 rounded-[4px] border font-[Outfit] text-[14px] text-[#111111]',
            'placeholder-[#9A9A9A] outline-none transition-colors',
            'focus:border-[#E5181B] focus:ring-1 focus:ring-[#E5181B]/20',
            suffix ? 'pr-10' : '',
            error ? 'border-[#E5181B]' : 'border-[#E0E0E0]',
            disabled ? 'bg-[#F7F7F7] text-[#9A9A9A] cursor-not-allowed' : 'bg-white',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {suffix && <span className="absolute right-3 text-[#9A9A9A]">{suffix}</span>}
      </div>
      {error && (
        <span id={errorId} className="text-[12px] font-[Outfit] text-[#E5181B]">
          {error}
        </span>
      )}
    </div>
  );
}
