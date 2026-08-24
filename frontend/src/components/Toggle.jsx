// Toggle (switch) do design system.
export default function Toggle({ label, checked, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-fit cursor-pointer"
    >
      <span
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#E5181B]' : 'bg-[#E0E0E0]'
        }`}
      >
        {/* A bolinha é posicionada por `left`, com valor absoluto nos dois
            estados. Antes ela era `absolute` sem `left`, deslocada por
            translate-x: sem âncora, o navegador parte da posição estática
            (perto do meio da trilha), então mesmo desligada ela já encostava
            na borda direita e ao ativar saía para fora.
            Trilha 40px, bolinha 16px: 4px e 20px deixam 4px de folga em cada
            ponta, iguais aos 4px de topo e base do top-1. */}
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-[left] duration-200 ${
            checked ? 'left-5' : 'left-1'
          }`}
        />
      </span>
      <span className="font-[Outfit] text-[14px] text-[#111111]">{label}</span>
    </button>
  );
}
