// Lista de eventos (tarefa 70).
// Consome GET /events (rota pública) e trata os três estados exigidos:
// carregando, vazio e erro.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import EventCard from '../components/EventCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Skeleton from '../components/Skeleton.jsx';

function EventCardSkeleton() {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[6px] overflow-hidden">
      <Skeleton className="w-full" style={{ aspectRatio: '2/3' }} />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-2/3" />
        <div className="pt-3 flex justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadEvents = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      const data = await api.get('/events', { auth: false });
      setEvents(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // A rota GET /events não recebe termo de busca, então o filtro é local.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return events;
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(term) ||
        event.venue?.toLowerCase().includes(term),
    );
  }, [events, search]);

  return (
    <div className="bg-[#F7F7F7] flex-1">
      <div className="bg-white border-b border-[#E0E0E0] px-6 py-8">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-4">
          <h1 className="font-[DM_Serif_Display] text-[40px] text-[#111111] leading-tight">
            Filmes em Cartaz
          </h1>
          <div className="max-w-xl">
            <SearchInput
              placeholder="Buscar filme ou local..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-6">
        {status === 'loading' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <ErrorState
              title="Não foi possível carregar os eventos"
              message={error}
              onRetry={loadEvents}
              retryLabel="Tentar de novo"
            />
          </div>
        )}

        {status === 'ready' && filtered.length === 0 && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <EmptyState
              title="Nenhum evento encontrado"
              description={
                search.trim()
                  ? `Nenhum resultado para "${search.trim()}". Tente outro termo.`
                  : 'Ainda não há eventos publicados por aqui.'
              }
            />
          </div>
        )}

        {status === 'ready' && filtered.length > 0 && (
          <>
            <p className="font-[Outfit] text-[13px] text-[#9A9A9A]">
              {filtered.length} {filtered.length === 1 ? 'evento' : 'eventos'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
