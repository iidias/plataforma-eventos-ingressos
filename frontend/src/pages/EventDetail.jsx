// Detalhe do evento (tarefa 71).
// Consome GET /events/:id, calcula o total em tempo real e limita a quantidade
// a 5 ingressos (e nunca acima dos lugares disponíveis).
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { IconCalendar, IconLocation, IconFilm } from '../components/icons.jsx';
import { availabilityOf, formatDate, formatTime, formatPrice } from '../lib/format.js';

const MAX_TICKETS = 5;

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const loadEvent = useCallback(async () => {
    setStatus('loading');
    setError('');
    setNotFound(false);

    try {
      const data = await api.get(`/events/${id}`, { auth: false });
      setEvent(data);
      setQuantity(1);
      setStatus('ready');
    } catch (err) {
      setNotFound(err.status === 404);
      setError(err.message);
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  if (status === 'loading') {
    return (
      <div className="bg-white flex-1">
        <div className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10">
          <Skeleton className="w-full rounded-[6px]" style={{ aspectRatio: '2/3' }} />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-[#F7F7F7] flex-1">
        <div className="max-w-[640px] mx-auto px-6 py-16">
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <ErrorState
              title={notFound ? 'Evento não encontrado' : 'Não foi possível carregar o evento'}
              message={
                notFound ? 'Este evento não existe ou ainda não foi publicado.' : error
              }
              onRetry={notFound ? undefined : loadEvent}
              retryLabel="Tentar de novo"
            />
            {notFound && (
              <div className="flex justify-center pb-8">
                <Link to="/">
                  <Button variant="outline">Voltar para a lista</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const availability = availabilityOf(event);
  const isSoldOut = availability.key === 'sold-out';
  const maxQuantity = Math.min(MAX_TICKETS, Math.max(event.available, 1));
  const total = quantity * event.priceCents;

  return (
    <div className="bg-white flex-1">
      <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-[14px] font-[Outfit] text-[#4A4A4A] hover:text-[#111111] transition-colors w-fit"
        >
          ← Voltar para a lista
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 items-start">
          <div className="rounded-[6px] overflow-hidden border border-[#E0E0E0] bg-[#EFEFEF]">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full object-cover"
                style={{ aspectRatio: '2/3' }}
              />
            ) : (
              <div
                className="w-full flex items-center justify-center text-[#9A9A9A]"
                style={{ aspectRatio: '2/3' }}
              >
                <IconFilm size={64} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1 className="font-[DM_Serif_Display] text-[32px] text-[#111111] leading-tight">
                {event.title}
              </h1>
              {event.synopsis && (
                <p className="font-[Outfit] text-[16px] text-[#4A4A4A] leading-relaxed">
                  {event.synopsis}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-[14px] font-[Outfit] text-[#4A4A4A]">
                <IconCalendar />
                {formatDate(event.eventDate)} às {formatTime(event.eventDate)}
              </span>
              <span className="flex items-center gap-1.5 text-[14px] font-[Outfit] text-[#4A4A4A]">
                <IconLocation />
                {event.venue}
              </span>
              <span className="font-[Outfit] font-semibold text-[16px] text-[#E5181B]">
                {formatPrice(event.priceCents)} / ingresso
              </span>
            </div>

            <div className="h-px bg-[#E0E0E0]" />

            {isSoldOut ? (
              <div className="flex flex-col gap-3">
                <p className="font-[Outfit] text-[14px] text-[#E5181B] font-semibold">
                  Evento esgotado — 0 de {event.capacity} lugares disponíveis.
                </p>
                <Button variant="secondary" size="lg" disabled className="w-full">
                  Esgotado
                </Button>
                <p className="text-[12px] font-[Outfit] text-[#9A9A9A]">
                  Não há mais lugares disponíveis para este evento.
                </p>
              </div>
            ) : (
              <>
                <p
                  className={`font-[Outfit] text-[14px] ${
                    availability.key === 'few'
                      ? 'text-[#D97706] font-semibold'
                      : 'text-[#4A4A4A]'
                  }`}
                >
                  {availability.key === 'few'
                    ? `Apenas ${event.available} lugares disponíveis de ${event.capacity}`
                    : `Lugares disponíveis: ${event.available} de ${event.capacity}`}
                </p>

                <div className="flex flex-col gap-3">
                  <span className="text-[13px] font-[Outfit] font-medium text-[#111111]">
                    Quantidade de ingressos
                  </span>
                  <div className="flex items-center w-fit border border-[#E0E0E0] rounded-[4px] overflow-hidden">
                    <button
                      type="button"
                      aria-label="Diminuir quantidade"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center font-[Outfit] text-[18px] text-[#111111] hover:bg-[#F7F7F7] transition-colors border-r border-[#E0E0E0] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      –
                    </button>
                    <span
                      aria-live="polite"
                      className="w-12 h-10 flex items-center justify-center font-[Outfit] font-semibold text-[16px] text-[#111111]"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar quantidade"
                      onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                      disabled={quantity >= maxQuantity}
                      className="w-10 h-10 flex items-center justify-center font-[Outfit] text-[18px] text-[#111111] hover:bg-[#F7F7F7] transition-colors border-l border-[#E0E0E0] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[11px] font-[Outfit] text-[#9A9A9A]">
                    {event.available < MAX_TICKETS
                      ? `Restam apenas ${event.available} ${event.available === 1 ? 'lugar' : 'lugares'}`
                      : `Máximo de ${MAX_TICKETS} ingressos por compra`}
                  </p>
                </div>

                <div className="flex items-center justify-between bg-[#F7F7F7] rounded-[4px] px-4 py-3">
                  <span className="font-[Outfit] text-[14px] text-[#4A4A4A]">Total</span>
                  <span className="font-[Outfit] font-semibold text-[20px] text-[#111111]">
                    {formatPrice(total)}
                  </span>
                </div>

                <Button size="lg" className="w-full">
                  Reservar — {formatPrice(total)}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
