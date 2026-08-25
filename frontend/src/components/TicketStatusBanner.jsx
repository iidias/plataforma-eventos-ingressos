// Selo de status do ingresso: verde para VALID, cinza para USED.
// No utilizado aparece também quando foi validado, que é a informação que
// explica por que aquele QR não vale mais.
import { IconCheck, IconX } from './icons.jsx';
import { formatDateTime } from '../lib/format.js';

export default function TicketStatusBanner({ status, usedAt, label }) {
  const used = status === 'USED';

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] border ${
        used
          ? 'bg-[#F7F7F7] border-[#E0E0E0] text-[#4A4A4A]'
          : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'
      }`}
    >
      {used ? <IconX /> : <IconCheck />}
      <span className="font-[Outfit] font-medium text-[13px] uppercase tracking-wide">
        {label ?? (used ? 'Ingresso utilizado' : 'Válido')}
      </span>
      {used && usedAt && (
        <span className="font-[Outfit] text-[12px] text-[#9A9A9A] ml-auto">
          {formatDateTime(usedAt)}
        </span>
      )}
    </div>
  );
}
