// Criar evento em dois passos.
// Passo 1: busca no catálogo (GET /catalog/search).
// Passo 2: formulário do evento (POST /events).
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Input from '../components/Input.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Skeleton from '../components/Skeleton.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import GateCredentialCard from '../components/GateCredentialCard.jsx';
import Toggle from '../components/Toggle.jsx';
import { IconChevronRight, IconFilm } from '../components/icons.jsx';

const STEPS = ['Buscar filme', 'Configurar evento'];

export default function NewEvent() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  // Passo 1 — catálogo
  const [query, setQuery] = useState('');
  const [catalogStatus, setCatalogStatus] = useState('idle'); // idle | loading | results | empty | error
  const [catalogError, setCatalogError] = useState(null); // { title, message }
  const [results, setResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Passo 2 — formulário
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [publishNow, setPublishNow] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdEvent, setCreatedEvent] = useState(null);

  async function searchCatalog() {
    const term = query.trim();
    if (!term) return;

    setCatalogStatus('loading');
    setCatalogError(null);
    setResults([]);

    try {
      const data = await api.get(`/catalog/search?q=${encodeURIComponent(term)}`);
      const movies = Array.isArray(data) ? data : [];

      setResults(movies);
      setCatalogStatus(movies.length === 0 ? 'empty' : 'results');
    } catch (err) {
      // 502 = o TMDb está fora do ar; é um caso previsto pelo backend.
      setCatalogError(
        err.status === 502
          ? {
              title: 'Catálogo indisponível',
              message:
                'O serviço de catálogo está temporariamente fora do ar. Tente novamente em instantes.',
            }
          : { title: 'Erro ao buscar filmes', message: err.message },
      );
      setCatalogStatus('error');
    }
  }

  function selectMovie(movie) {
    setSelectedMovie(movie);
    setApiError('');
    setFieldErrors({});
    setStep(1);
  }

  // Validação local só para o básico; o backend continua sendo a fonte da
  // verdade e suas mensagens são exibidas no Alert.
  function validate() {
    const errors = {};
    const capacityNumber = Number(capacity);
    const priceNumber = Number(String(price).replace(',', '.'));

    if (!eventDate) errors.eventDate = 'Informe a data e o horário';
    else if (new Date(eventDate) <= new Date()) errors.eventDate = 'A data deve ser no futuro';

    if (!venue.trim()) errors.venue = 'Informe o local do evento';

    if (!capacity || !Number.isInteger(capacityNumber) || capacityNumber < 1) {
      errors.capacity = 'Capacidade deve ser um número inteiro a partir de 1';
    }

    if (price === '' || Number.isNaN(priceNumber) || priceNumber < 0) {
      errors.price = 'Informe um preço válido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    setApiError('');

    if (!validate()) return;

    setSaving(true);

    try {
      const created = await api.post('/events', {
        externalId: selectedMovie.externalId,
        eventDate: new Date(eventDate).toISOString(),
        venue: venue.trim(),
        capacity: Number(capacity),
        priceCents: Math.round(Number(String(price).replace(',', '.')) * 100),
        status: publishNow ? 'PUBLISHED' : 'DRAFT',
      });

      setCreatedEvent(created);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Confirmação após criar
  if (createdEvent) {
    return (
      <div className="bg-[#F7F7F7] flex-1 flex flex-col items-center justify-center gap-6 px-6 py-12">
        <div className="bg-white border border-[#E0E0E0] rounded-[6px] p-10 max-w-sm w-full flex flex-col items-center gap-5 text-center">
          <span className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M6 17l8 8 14-14"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h2 className="font-[DM_Serif_Display] text-[24px] text-[#111111]">
              Evento {createdEvent.status === 'PUBLISHED' ? 'publicado' : 'salvo'}!
            </h2>
            <p className="font-[Outfit] text-[14px] text-[#4A4A4A] mt-1">
              {createdEvent.title}{' '}
              {createdEvent.status === 'PUBLISHED'
                ? 'já está visível na lista pública.'
                : 'foi salvo como rascunho e pode ser publicado depois.'}
            </p>
          </div>
          <Button className="w-full" onClick={() => navigate('/organizador')}>
            Voltar ao painel
          </Button>
        </div>

        {/* Publicando direto na criação, a credencial da portaria nasce junto.
            A senha aparece só aqui. */}
        {createdEvent.gate?.password && (
          <div className="max-w-sm w-full">
            <GateCredentialCard gate={createdEvent.gate} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] flex-1">
      <div className="max-w-[900px] mx-auto px-6 py-8 flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Link
            to="/organizador"
            className="text-[14px] font-[Outfit] text-[#4A4A4A] hover:text-[#111111] transition-colors"
          >
            ← Voltar
          </Link>
          <h1 className="font-[DM_Serif_Display] text-[32px] text-[#111111] leading-tight">
            Novo Evento
          </h1>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        {/* ── Passo 1: buscar filme ─────────────────────────────────────── */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E0E0E0] rounded-[6px] p-6 flex flex-col gap-4">
              <div>
                <h2 className="font-[Outfit] font-semibold text-[16px] text-[#111111]">
                  Buscar no catálogo
                </h2>
                <p className="font-[Outfit] text-[13px] text-[#4A4A4A] mt-0.5">
                  Pesquise pelo título do filme que será exibido no evento.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <SearchInput
                    placeholder="Ex: Duna, Matrix, Cidade de Deus..."
                    value={query}
                    onChange={setQuery}
                    onSearch={searchCatalog}
                    aria-label="Buscar filme no catálogo"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={searchCatalog}
                  loading={catalogStatus === 'loading'}
                  disabled={!query.trim()}
                >
                  Buscar
                </Button>
              </div>
            </div>

            {catalogStatus === 'loading' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="w-full rounded-[6px]" style={{ aspectRatio: '2/3' }} />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {catalogStatus === 'results' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((movie) => (
                  <button
                    key={movie.externalId}
                    type="button"
                    onClick={() => selectMovie(movie)}
                    className="flex flex-col gap-2 text-left group cursor-pointer"
                  >
                    <span
                      className="relative rounded-[6px] overflow-hidden border border-[#E0E0E0] group-hover:border-[#E5181B] transition-colors block bg-[#EFEFEF]"
                      style={{ aspectRatio: '2/3' }}
                    >
                      {movie.imageUrl ? (
                        <img
                          src={movie.imageUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-[#9A9A9A]">
                          <IconFilm />
                        </span>
                      )}
                      <span className="absolute inset-0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#E5181B] text-white text-[12px] font-[Outfit] font-medium px-3 py-1.5 rounded-[4px] flex items-center gap-1">
                          <IconChevronRight />
                          Selecionar
                        </span>
                      </span>
                    </span>
                    <span className="font-[Outfit] font-semibold text-[14px] text-[#111111] group-hover:text-[#E5181B] transition-colors leading-tight">
                      {movie.title}
                    </span>
                    {movie.year && (
                      <span className="text-[11px] font-[Outfit] text-[#9A9A9A]">{movie.year}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {catalogStatus === 'empty' && (
              <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
                <EmptyState
                  title="Nenhum resultado encontrado"
                  description={`Nenhum filme encontrado para "${query.trim()}". Tente outro título.`}
                />
              </div>
            )}

            {catalogStatus === 'error' && (
              <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
                <ErrorState
                  title={catalogError.title}
                  message={catalogError.message}
                  onRetry={searchCatalog}
                  retryLabel="Tentar de novo"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Passo 2: configurar evento ────────────────────────────────── */}
        {step === 1 && selectedMovie && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <div className="bg-white border border-[#E0E0E0] rounded-[6px] p-4 flex items-center gap-4">
              {selectedMovie.imageUrl ? (
                <img
                  src={selectedMovie.imageUrl}
                  alt={selectedMovie.title}
                  className="w-12 h-16 object-cover rounded-[4px] shrink-0"
                />
              ) : (
                <span className="w-12 h-16 rounded-[4px] shrink-0 bg-[#EFEFEF] flex items-center justify-center text-[#9A9A9A]">
                  <IconFilm size={24} />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-[Outfit] text-[#9A9A9A] uppercase tracking-wide">
                  Filme selecionado
                </p>
                <p className="font-[Outfit] font-semibold text-[16px] text-[#111111] truncate">
                  {selectedMovie.title}
                </p>
                {selectedMovie.year && <Badge color="gray">{selectedMovie.year}</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                Trocar
              </Button>
            </div>

            <div className="bg-white border border-[#E0E0E0] rounded-[6px] p-6 flex flex-col gap-6">
              <h2 className="font-[Outfit] font-semibold text-[16px] text-[#111111]">
                Detalhes do evento
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Data e horário"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  error={fieldErrors.eventDate}
                  disabled={saving}
                />
                <Input
                  label="Local"
                  placeholder="Ex: Cinemark Morumbi, São Paulo"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  error={fieldErrors.venue}
                  disabled={saving}
                />
                <Input
                  label="Capacidade"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ex: 150"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  error={fieldErrors.capacity}
                  disabled={saving}
                />
                <Input
                  label="Preço por ingresso (R$)"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 32.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  error={fieldErrors.price}
                  disabled={saving}
                />
              </div>

              <div className="h-px bg-[#E0E0E0]" />

              <div className="flex flex-col gap-2">
                <Toggle
                  label="Publicar evento agora"
                  checked={publishNow}
                  onChange={setPublishNow}
                />
                <p className="text-[12px] font-[Outfit] text-[#9A9A9A]">
                  {publishNow
                    ? 'O evento ficará visível imediatamente na lista pública.'
                    : 'O evento será salvo como rascunho e poderá ser publicado depois.'}
                </p>
              </div>

              {apiError && <Alert type="error" message={apiError} />}
            </div>

            <div className="flex items-center gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep(0)} disabled={saving}>
                ← Voltar
              </Button>
              <Button type="submit" loading={saving}>
                {publishNow ? 'Publicar evento' : 'Salvar rascunho'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
