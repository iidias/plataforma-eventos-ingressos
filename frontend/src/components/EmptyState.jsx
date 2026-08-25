// EmptyState: ausência de conteúdo.
export default function EmptyState({ title, message, description, action, className = '' }) {
  const heading = title ?? message ?? 'Nada por aqui';

  return (
    <div
      className={[
        'flex flex-col items-center gap-4 py-16 px-6 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="w-16 h-16 rounded-[6px] bg-[#F7F7F7] border border-[#E0E0E0] flex items-center justify-center text-[#9A9A9A]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 9h18M8 4v16M16 4v16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div>
        <h3 className="font-[Outfit] font-semibold text-[18px] text-[#111111]">{heading}</h3>
        {description && (
          <p className="font-[Outfit] text-[14px] text-[#4A4A4A] mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
