// Indicador de etapas do design system (usado na criação de evento em 2 passos).
export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-[Outfit] font-semibold transition-colors ${
                i < current
                  ? 'bg-[#16A34A] text-white'
                  : i === current
                    ? 'bg-[#E5181B] text-white'
                    : 'bg-[#EFEFEF] text-[#9A9A9A]'
              }`}
              aria-current={i === current ? 'step' : undefined}
            >
              {i < current ? '✓' : i + 1}
            </span>
            <span
              className={`font-[Outfit] text-[13px] hidden sm:inline ${
                i === current ? 'text-[#111111] font-medium' : 'text-[#9A9A9A]'
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span className={`w-8 sm:w-12 h-px mx-2 ${i < current ? 'bg-[#16A34A]' : 'bg-[#E0E0E0]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
