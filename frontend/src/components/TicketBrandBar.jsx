// Faixa vermelha do topo do ingresso digital.
import { IconTicket } from './icons.jsx';

export default function TicketBrandBar() {
  return (
    <div className="bg-[#E5181B] text-white px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex flex-col leading-tight">
        <span className="font-[Outfit] text-[11px] uppercase tracking-widest text-white/70">
          ingressoFilm
        </span>
        <span className="font-[Outfit] font-semibold text-[15px]">Ingresso Digital</span>
      </div>
      <IconTicket size={22} />
    </div>
  );
}
