// Campo de busca do design system: ícone à esquerda e botão de limpar à direita.
// O Input base não cobre esse padrão (sem afixos), por isso o componente próprio.
import { IconSearch, IconX } from './icons.jsx';

export default function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar eventos, filmes...',
  'aria-label': ariaLabel = 'Buscar',
}) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-[#9A9A9A] pointer-events-none">
        <IconSearch />
      </span>
      <input
        type="search"
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
        placeholder={placeholder}
        className="h-10 pl-9 pr-8 rounded-[4px] border border-[#E0E0E0] font-[Outfit] text-[14px] text-[#111111] placeholder-[#9A9A9A] bg-white outline-none focus:border-[#E5181B] focus:ring-1 focus:ring-[#E5181B]/20 transition-colors w-full [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => onChange?.('')}
          className="absolute right-3 text-[#9A9A9A] hover:text-[#111111] cursor-pointer"
        >
          <IconX />
        </button>
      )}
    </div>
  );
}
