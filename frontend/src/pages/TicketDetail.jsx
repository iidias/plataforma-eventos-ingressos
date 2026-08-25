// Detalhe do ingresso.
// Wireframes: "meus ingressos VALIDO.png" e "meus ingressos UTILIZADO.png".
//
// A rota é /ingressos/:id, onde o id é o da reserva: o cliente clicou numa
// linha da lista, que é uma compra. Reserva de 2 ingressos rende 2 cards, cada
// um com o seu QR, código, selo e link (D21) — nunca um card só com a
// quantidade. Os cards ficam no mesmo grid responsivo da grade de filmes.
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import TicketBrandBar from '../components/TicketBrandBar.jsx';
import TicketCard from '../components/TicketCard.jsx';
import TicketEventInfo from '../components/TicketEventInfo.jsx';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | notFound | error
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      const data = await api.get('/tickets/me');
      const daReserva = (Array.isArray(data) ? data : []).filter(
        (ticket) => ticket.reservation.id === id,
      );

      setTickets(daReserva);
      setStatus(daReserva.length === 0 ? 'notFound' : 'ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const event = tickets[0]?.event;

  return (
    <div className="bg-[#F7F7F7] flex-1">
      <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-6">
        <Link
          to="/meus-ingressos"
          className="font-[Outfit] text-[14px] text-[#4A4A4A] hover:text-[#111111] w-fit"
        >
          ← Meus Ingressos
        </Link>

        {status === 'loading' && (
          <>
            <Skeleton className="h-[140px] w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Skeleton className="h-[420px]" />
              <Skeleton className="h-[420px]" />
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <ErrorState
              title="Não foi possível carregar o ingresso"
              message={error}
              onRetry={load}
              retryLabel="Tentar de novo"
            />
          </div>
        )}

        {status === 'notFound' && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <ErrorState
              title="Ingresso não encontrado"
              message="Este ingresso não existe ou não pertence à sua conta."
            />
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="bg-white border border-[#E0E0E0] rounded-[6px] overflow-hidden">
              <TicketBrandBar />
              <TicketEventInfo event={event}>
                <p className="font-[Outfit] text-[13px] text-[#9A9A9A] pt-1">
                  Comprador: <span className="text-[#111111] font-medium">{user?.name}</span> ·{' '}
                  {tickets.length} {tickets.length === 1 ? 'ingresso' : 'ingressos'}
                </p>
              </TicketEventInfo>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tickets.map((ticket, i) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  label={`Ingresso ${i + 1} de ${tickets.length}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
