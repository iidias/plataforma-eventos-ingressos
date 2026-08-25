// Painel do organizador.
// Consome GET /organizer/events e permite publicar um rascunho via
// POST /events/:id/publish. A edição completa pertence a uma etapa futura.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import GateCredentialModal from '../components/GateCredentialModal.jsx';
import { IconCalendar, IconLocation, IconEdit, IconEye, IconKey, IconPlus, IconFilm } from '../components/icons.jsx';
import { formatDateTime } from '../lib/format.js';

function percentSold(event) {
  if (!event.capacity) return 0;
  return Math.round((event.soldCount / event.capacity) * 100);
}

function barColor(percent) {
  if (percent > 80) return 'bg-[#E5181B]';
  if (percent > 50) return 'bg-[#D97706]';
  return 'bg-[#16A34A]';
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [publishingId, setPublishingId] = useState(null);
  const [actionError, setActionError] = useState('');
  // Evento cuja credencial está aberta no modal — pela ação "Credencial" ou
  // logo depois de publicar.
  const [credentialEvent, setCredentialEvent] = useState(null);
  // Senha recém-nascida na publicação: só existe em memória, e faz o modal
  // abrir já revelado.
  const [newPassword, setNewPassword] = useState('');

  // Depois de gerar/regenerar, a lista precisa refletir o e-mail e a nova
  // validade. A senha não entra no estado da lista: ela vive só no modal.
  function handleGateGenerated(eventId, gate) {
    const { password: _password, ...summary } = gate;

    setEvents((current) =>
      current.map((e) => (e.id === eventId ? { ...e, gate: summary } : e)),
    );
    setCredentialEvent((current) =>
      current && current.id === eventId ? { ...current, gate: summary } : current,
    );
  }

  const loadEvents = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      const data = await api.get('/organizer/events');
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

  async function handlePublish(eventId) {
    setPublishingId(eventId);
    setActionError('');

    try {
      const updated = await api.post(`/events/${eventId}/publish`);
      setEvents((current) => current.map((e) => (e.id === eventId ? updated : e)));

      // A senha vem apenas nesta resposta, no momento em que a credencial
      // nasce. O wireframe mostra a credencial num modal, não numa faixa
      // acima da lista — então é o mesmo modal da ação "Credencial" que abre.
      if (updated.gate?.password) {
        setNewPassword(updated.gate.password);
        setCredentialEvent(updated);
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPublishingId(null);
    }
  }

  const totals = {
    all: events.length,
    published: events.filter((e) => e.status === 'PUBLISHED').length,
    drafts: events.filter((e) => e.status === 'DRAFT').length,
    sold: events.reduce((sum, e) => sum + (e.soldCount ?? 0), 0),
  };

  return (
    <div className="bg-[#F7F7F7] flex-1">
      {credentialEvent && (
        <GateCredentialModal
          event={credentialEvent}
          initialPassword={newPassword}
          onClose={() => {
            setCredentialEvent(null);
            setNewPassword('');
          }}
          onGenerated={handleGateGenerated}
        />
      )}

      <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-[DM_Serif_Display] text-[36px] text-[#111111] leading-tight">
              Meus Eventos
            </h1>
            <p className="font-[Outfit] text-[14px] text-[#4A4A4A] mt-1">
              Bem-vindo(a), {user?.name}
            </p>
          </div>
          <Button onClick={() => navigate('/organizador/novo')}>
            <IconPlus />
            Novo evento
          </Button>
        </div>

        {status === 'ready' && events.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total de eventos', value: totals.all },
              { label: 'Publicados', value: totals.published },
              { label: 'Rascunhos', value: totals.drafts },
              { label: 'Ingressos vendidos', value: totals.sold },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-[#E0E0E0] rounded-[6px] p-5">
                <p className="text-[11px] font-[Outfit] text-[#9A9A9A] uppercase tracking-wide">
                  {label}
                </p>
                <p className="font-[DM_Serif_Display] text-[32px] text-[#111111] mt-1">{value}</p>
              </div>
            ))}
          </div>
        )}

        {actionError && <Alert type="error" message={actionError} />}

        {status === 'loading' && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px] divide-y divide-[#E0E0E0]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-10 h-14 shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <ErrorState
              title="Não foi possível carregar seus eventos"
              message={error}
              onRetry={loadEvents}
              retryLabel="Tentar de novo"
            />
          </div>
        )}

        {status === 'ready' && events.length === 0 && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <EmptyState
              title="Você ainda não criou eventos"
              description="Comece buscando um filme no catálogo para montar sua primeira sessão."
            />
          </div>
        )}

        {status === 'ready' && events.length > 0 && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E0E0E0]">
              <h2 className="font-[Outfit] font-semibold text-[16px] text-[#111111]">
                Todos os eventos
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-[#E0E0E0]">
              {events.map((event) => {
                const percent = percentSold(event);
                const isDraft = event.status === 'DRAFT';

                return (
                  <div key={event.id} className="flex items-center gap-4 px-6 py-4 flex-wrap">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-10 h-14 object-cover rounded-[4px] shrink-0"
                      />
                    ) : (
                      <span className="w-10 h-14 rounded-[4px] shrink-0 bg-[#EFEFEF] flex items-center justify-center text-[#9A9A9A]">
                        <IconFilm size={20} />
                      </span>
                    )}

                    <div className="flex-1 min-w-[180px]">
                      <p className="font-[Outfit] font-semibold text-[15px] text-[#111111] truncate">
                        {event.title}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                        <span className="flex items-center gap-1 text-[12px] font-[Outfit] text-[#4A4A4A]">
                          <IconCalendar />
                          {formatDateTime(event.eventDate)}
                        </span>
                        <span className="flex items-center gap-1 text-[12px] font-[Outfit] text-[#4A4A4A]">
                          <IconLocation />
                          {event.venue}
                        </span>
                      </div>
                    </div>

                    {/* Vendidos / capacidade */}
                    <div className="flex flex-col items-center gap-1 shrink-0 w-24">
                      <span className="flex items-baseline gap-0.5">
                        <span className="font-[Outfit] font-semibold text-[18px] text-[#111111]">
                          {event.soldCount}
                        </span>
                        <span className="font-[Outfit] text-[13px] text-[#9A9A9A]">
                          /{event.capacity}
                        </span>
                      </span>
                      <span className="w-full h-1.5 bg-[#EFEFEF] rounded-full overflow-hidden block">
                        <span
                          className={`h-full rounded-full block ${barColor(percent)}`}
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                      <span className="text-[11px] font-[Outfit] text-[#9A9A9A]">
                        {percent}% vendido
                      </span>
                    </div>

                    <Badge color={isDraft ? 'gray' : 'green'}>
                      {isDraft ? 'Rascunho' : 'Publicado'}
                    </Badge>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* PATCH /events/:id já existe e funciona, mas a tela de
                          edição não foi desenhada.
                          Fica desabilitado em vez de abrir uma tela inventada. */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        title="A tela de edição de evento não faz parte desta entrega"
                      >
                        <IconEdit />
                        Editar
                      </Button>
                      {isDraft ? (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={publishingId === event.id}
                          onClick={() => handlePublish(event.id)}
                        >
                          <IconEye />
                          Publicar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCredentialEvent(event)}
                        >
                          <IconKey />
                          Credencial
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
