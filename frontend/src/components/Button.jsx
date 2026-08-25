// Button: variantes, tamanhos, disabled e loading do design system.
import Spinner from './Spinner.jsx';

const variants = {
  primary: 'bg-[#E5181B] text-white hover:bg-[#CC1518] active:bg-[#B31214]',
  secondary: 'bg-[#1A1A1A] text-white hover:bg-[#333333]',
  outline: 'border border-[#1A1A1A] text-[#111111] bg-transparent hover:bg-[#F7F7F7]',
  ghost: 'text-[#4A4A4A] bg-transparent hover:bg-[#F7F7F7]',
};

const sizes = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-5 text-[14px]',
  lg: 'h-12 px-6 text-[15px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const isBlocked = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isBlocked}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2 font-[Outfit] font-medium',
        'rounded-[4px] transition-colors duration-150',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        isBlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
