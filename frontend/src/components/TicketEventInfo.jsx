// Pôster + título + data + local do evento, o cabeçalho comum às duas telas
// de ingresso. O `children` recebe a linha extra de cada tela (comprador,
// quantidade), que não existe na visão pública.
import { IconCalendar, IconLocation, IconFilm } from './icons.jsx';
import { formatDate, formatTime } from '../lib/format.js';

export default function TicketEventInfo({ event, children }) {
  return (
    <div className="flex gap-5 p-6">
      <div className="w-[60px] shrink-0 bg-[#EFEFEF] rounded-[4px] overflow-hidden" style={{ aspectRatio: '2/3' }}>
        {event?.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9A9A9A]">
            <IconFilm size={22} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <h2 className="font-[DM_Serif_Display] text-[26px] text-[#111111] leading-tight">
          {event?.title}
        </h2>
        <span className="flex items-center gap-1.5 font-[Outfit] text-[13px] text-[#4A4A4A]">
          <IconCalendar />
          {formatDate(event?.eventDate)} · {formatTime(event?.eventDate)}
        </span>
        <span className="flex items-center gap-1.5 font-[Outfit] text-[13px] text-[#4A4A4A]">
          <IconLocation />
          <span className="truncate">{event?.venue}</span>
        </span>
        {children}
      </div>
    </div>
  );
}
