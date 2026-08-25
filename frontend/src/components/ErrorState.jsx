// ErrorState: falha de carregamento, com ação de tentar de novo.
import Button from './Button.jsx';

export default function ErrorState({
  title = 'Algo deu errado',
  message = 'Verifique sua conexão e tente novamente.',
  onRetry,
  retryLabel = 'Tentar novamente',
  className = '',
}) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-4 py-16 px-6 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      <div className="w-16 h-16 rounded-full bg-[#FFF1F2] flex items-center justify-center text-[#E5181B]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 7v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1" fill="currentColor" />
        </svg>
      </div>
      <div>
        <h3 className="font-[Outfit] font-semibold text-[18px] text-[#111111]">{title}</h3>
        {message && <p className="font-[Outfit] text-[14px] text-[#4A4A4A] mt-1">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
