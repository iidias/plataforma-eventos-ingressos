// Card de evento da lista pública.
// Mostra pôster, título, data, local e preço — os quatro campos são exigidos
// pela especificação — além do selo de disponibilidade.
import { Link } from 'react-router-dom';
import Badge from './Badge.jsx';
import Button from './Button.jsx';
import { IconCalendar, IconLocation, IconFilm } from './icons.jsx';
import { availabilityOf, formatDate, formatTime, formatPrice } from '../lib/format.js';

export default function EventCard({ event }) {
  const availability = availabilityOf(event);
  const isSoldOut = availability.key === 'sold-out';

  return (
    <article
      className={`bg-white border border-[#E0E0E0] rounded-[6px] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow duration-200 flex flex-col ${
        isSoldOut ? 'opacity-60' : ''
      }`}
    >
      <div className="relative bg-[#EFEFEF]" style={{ aspectRatio: '2/3' }}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9A9A9A]">
            <IconFilm />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge color={availability.color}>{availability.label}</Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-[Outfit] font-semibold text-[20px] text-[#111111] leading-tight line-clamp-2">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 text-[#4A4A4A]">
          <span className="flex items-center gap-1.5 text-[13px] font-[Outfit]">
            <IconCalendar />
            {formatDate(event.eventDate)} · {formatTime(event.eventDate)}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] font-[Outfit]">
            <IconLocation />
            <span className="truncate">{event.venue}</span>
          </span>
        </div>

        <div className="border-t border-[#E0E0E0] mt-auto pt-3 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-[Outfit] text-[#9A9A9A] uppercase tracking-wide">
              A partir de
            </span>
            <p className="font-[Outfit] font-semibold text-[18px] text-[#E5181B]">
              {formatPrice(event.priceCents)}
            </p>
          </div>
          {isSoldOut ? (
            <Button size="sm" disabled>
              Esgotado
            </Button>
          ) : (
            <Link to={`/eventos/${event.id}`}>
              <Button size="sm">Ver evento</Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
