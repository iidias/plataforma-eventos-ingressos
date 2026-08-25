// Badge: informações curtas e status (disponibilidade, papel, etc.).
const colors = {
  red: 'bg-[#E5181B] text-white',
  black: 'bg-[#1A1A1A] text-white',
  gray: 'bg-[#EFEFEF] text-[#4A4A4A]',
  green: 'bg-[#DCFCE7] text-[#16A34A]',
  amber: 'bg-[#FEF3C7] text-[#D97706]',
  blue: 'bg-[#EFF6FF] text-[#2563EB]',
};

export default function Badge({ color = 'gray', className = '', children, ...rest }) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-[2px]',
        'text-[11px] font-[Outfit] font-medium uppercase tracking-wide',
        colors[color] ?? colors.gray,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}
