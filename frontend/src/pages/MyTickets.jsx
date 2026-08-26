// A rota GET /tickets/me devolve ingresso por ingresso, porque é assim que o
// modelo funciona (D21). Esta tela é a única que agrupa: o cliente comprou uma
// vez, então vê uma linha, e os QRs individuais ficam no detalhe.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Button from '../components/Button.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { IconCalendar, IconLocation, IconFilm, IconChevronRight } from '../components/icons.jsx';
import { formatDate, formatTime } from '../lib/format.js';

function groupByReservation(tickets) {
  const groups = new Map();

  for (const ticket of tickets) {
    const id = ticket.reservation.id;
    if (!groups.has(id)) {
      groups.set(id, { id, event: ticket.event, tickets: [] });
    }
    groups.get(id).tickets.push(ticket);
  }

  return [...groups.values()];
}

function RowSkeleton() {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[6px] p-4 flex gap-4">
      <Skeleton className="w-[58px] h-[87px] shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3.5 w-1/4" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>
    </div>
  );
}

function ReservationRow({ reservation }) {
  const { event, tickets } = reservation;
  // Enquanto sobrar um ingresso válido a compra ainda vale a entrada de
  // alguém; só quando todos foram lidos a linha inteira vira "utilizado".
  const anyValid = tickets.some((ticket) => ticket.status === 'VALID');

  return (
    <article className="bg-white border border-[#E0E0E0] rounded-[6px] p-4 flex gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow duration-200">
      <div className="w-[58px] shrink-0 bg-[#EFEFEF] rounded-[4px] overflow-hidden" style={{ aspectRatio: '2/3' }}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9A9A9A]">
            <IconFilm size={20} />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 min-w-0">
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <h2 className="font-[Outfit] font-semibold text-[18px] text-[#111111] leading-tight">
          {event.title}
        </h2>
        <span className="flex items-center gap-1.5 font-[Outfit] text-[13px] text-[#4A4A4A]">
          <IconCalendar />
          {formatDate(event.eventDate)} · {formatTime(event.eventDate)}
        </span>
        <span className="flex items-center gap-1.5 font-[Outfit] text-[13px] text-[#4A4A4A]">
          <IconLocation />
          <span className="truncate">{event.venue}</span>
        </span>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
        <Badge color={anyValid ? 'green' : 'gray'}>{anyValid ? 'Válido' : 'Utilizado'}</Badge>
        <span className="font-[Outfit] text-[13px] text-[#9A9A9A] whitespace-nowrap">
          {tickets.length} {tickets.length === 1 ? 'ingresso' : 'ingressos'}
        </span>
        <Link
          to={`/ingressos/${reservation.id}`}
          className="font-[Outfit] text-[13px] text-[#4A4A4A] hover:text-[#111111] flex items-center gap-1 whitespace-nowrap"
        >
          Ver detalhes
          <IconChevronRight />
        </Link>
      </div>
      </div>
    </article>
  );
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      const data = await api.get('/tickets/me');
      setTickets(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reservations = useMemo(() => groupByReservation(tickets), [tickets]);

  return (
    <div className="bg-[#F7F7F7] flex-1">
      <div className="bg-white border-b border-[#E0E0E0] px-6 py-8">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-1">
          <h1 className="font-[DM_Serif_Display] text-[40px] text-[#111111] leading-tight">
            Meus Ingressos
          </h1>
          <p className="font-[Outfit] text-[14px] text-[#4A4A4A]">
            Todos os ingressos associados à sua conta
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-4">
        {status === 'loading' &&
          Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}

        {status === 'error' && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <ErrorState
              title="Não foi possível carregar seus ingressos"
              message={error}
              onRetry={load}
              retryLabel="Tentar de novo"
            />
          </div>
        )}

        {status === 'ready' && reservations.length === 0 && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <EmptyState
              title="Você ainda não tem ingressos"
              description="Assim que você comprar um ingresso, ele aparece aqui."
              action={
                <Link to="/">
                  <Button>Ver filmes em cartaz</Button>
                </Link>
              }
            />
          </div>
        )}

        {status === 'ready' &&
          reservations.map((reservation) => (
            <ReservationRow key={reservation.id} reservation={reservation} />
          ))}
      </div>
    </div>
  );
}
