// Checkout (tarefa 84). Wireframe: "checkout.png".
// Formulário de cartão à esquerda (visual, nada é enviado nem armazenado),
// resumo do pedido à direita e dois botões explícitos de simulação.
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Input from '../components/Input.jsx';
import Skeleton from '../components/Skeleton.jsx';
import PaymentResult from './PaymentResult.jsx';
import { IconCalendar, IconLocation, IconCreditCard, IconShield, IconFilm } from '../components/icons.jsx';
import { formatDate, formatTime, formatPrice } from '../lib/format.js';

// O cartão é de mentira, mas os campos validam: um checkout que aceita
// qualquer coisa não mostra o tratamento de erro que a tela precisa ter.
function validateCard({ number, name, expiry, cvv }) {
  const errors = {};

  if (number.replace(/\s/g, '').length < 16) errors.number = 'Número inválido';
  if (!name.trim()) errors.name = 'Nome obrigatório';
  if (expiry.length < 5) errors.expiry = 'Data inválida';
  if (cvv.length < 3) errors.cvv = 'CVV inválido';

  return errors;
}

const formatCardNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function Checkout() {
  const { reservationId } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [processing, setProcessing] = useState(null); // null | 'approve' | 'reject'
  const [paymentError, setPaymentError] = useState('');
  const [result, setResult] = useState(null); // { approved, reservation }

  const loadReservation = useCallback(async () => {
    setStatus('loading');
    setError('');
    setNotFound(false);

    try {
      const data = await api.get(`/reservations/${reservationId}`);

      // Reserva já processada (recarregou a página, voltou pelo histórico):
      // mostra o resultado que ela já tem, em vez de deixar pagar de novo.
      if (data.status !== 'PENDING') {
        setResult({ approved: data.status === 'PAID', reservation: data });
      }

      setReservation(data);
      setStatus('ready');
    } catch (err) {
      setNotFound(err.status === 404);
      setError(err.message);
      setStatus('error');
    }
  }, [reservationId]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  async function simulate(outcome) {
    const errors = validateCard(card);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setProcessing(outcome);
    setPaymentError('');

    try {
      const payment = await api.post(`/reservations/${reservationId}/payment`, { outcome });

      setResult({
        approved: payment.outcome === 'approved',
        reservation: { ...reservation, ...payment.reservation, event: reservation.event },
      });
    } catch (err) {
      if (err.status === 401) return navigate('/login');

      setPaymentError(err.message);
      setProcessing(null);
    }
  }

  if (status === 'loading') {
    return (
      <div className="bg-[#F7F7F7] flex-1">
        <div className="max-w-[1000px] mx-auto px-6 py-8 flex flex-col gap-8">
          <Skeleton className="h-10 w-56" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
            <Skeleton className="h-[420px] w-full rounded-[6px]" />
            <Skeleton className="h-[280px] w-full rounded-[6px]" />
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
              title={notFound ? 'Reserva não encontrada' : 'Não foi possível carregar a reserva'}
              message={
                notFound
                  ? 'Esta reserva não existe ou não pertence à sua conta.'
                  : error
              }
              onRetry={notFound ? undefined : loadReservation}
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

  if (result) {
    return <PaymentResult approved={result.approved} reservation={result.reservation} />;
  }

  const { event, quantity, totalCents } = reservation;
  const busy = processing !== null;
  const setField = (key) => (value) => setCard((c) => ({ ...c, [key]: value }));

  return (
    <div className="bg-[#F7F7F7] flex-1">
      <div className="max-w-[1000px] mx-auto px-6 py-8 flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Link
            to={`/eventos/${event.id}`}
            className="text-[14px] font-[Outfit] text-[#4A4A4A] hover:text-[#111111] transition-colors"
          >
            ← Voltar
          </Link>
          <h1 className="font-[DM_Serif_Display] text-[32px] text-[#111111] leading-tight">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* ── Dados do cartão ─────────────────────────────────────────── */}
          <div className="bg-white border border-[#E0E0E0] rounded-[6px] p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[#111111]">
              <IconCreditCard />
              <h2 className="font-[Outfit] font-semibold text-[16px]">Dados do cartão</h2>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="Número do cartão"
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                value={card.number}
                onChange={(e) => setField('number')(formatCardNumber(e.target.value))}
                error={fieldErrors.number}
                disabled={busy}
              />
              <Input
                label="Nome no cartão"
                placeholder="Como aparece no cartão"
                value={card.name}
                onChange={(e) => setField('name')(e.target.value.toUpperCase())}
                error={fieldErrors.name}
                disabled={busy}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Validade"
                  placeholder="MM/AA"
                  inputMode="numeric"
                  value={card.expiry}
                  onChange={(e) => setField('expiry')(formatExpiry(e.target.value))}
                  error={fieldErrors.expiry}
                  disabled={busy}
                />
                <Input
                  label="CVV"
                  placeholder="123"
                  inputMode="numeric"
                  value={card.cvv}
                  onChange={(e) => setField('cvv')(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  error={fieldErrors.cvv}
                  disabled={busy}
                />
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-[#9A9A9A]">
              <IconShield />
              <span className="font-[Outfit] text-[12px]">
                Pagamento simulado — os dados do cartão não saem desta tela
              </span>
            </span>

            <div className="h-px bg-[#E0E0E0]" />

            {/* ── Os dois botões explícitos (D19) ───────────────────────── */}
            <div className="flex flex-col gap-3">
              <p className="font-[Outfit] text-[12px] text-[#9A9A9A] uppercase tracking-wide">
                Simulação de pagamento
              </p>

              {paymentError && <Alert type="error" message={paymentError} />}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  loading={processing === 'approve'}
                  disabled={busy}
                  onClick={() => simulate('approve')}
                >
                  {processing === 'approve' ? 'Processando...' : '✓ Simular aprovação'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-[#E5181B] text-[#E5181B] hover:bg-[#FFF1F2]"
                  loading={processing === 'reject'}
                  disabled={busy}
                  onClick={() => simulate('reject')}
                >
                  {processing === 'reject' ? 'Processando...' : '✕ Simular recusa'}
                </Button>
              </div>

              <p className="font-[Outfit] text-[11px] text-[#9A9A9A]">
                Escolha explicitamente o resultado para testar os dois fluxos de forma determinística.
              </p>
            </div>
          </div>

          {/* ── Resumo do pedido ────────────────────────────────────────── */}
          <div className="bg-white border border-[#E0E0E0] rounded-[6px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0E0E0]">
              <h2 className="font-[Outfit] font-semibold text-[15px] text-[#111111]">
                Resumo do pedido
              </h2>
            </div>

            <div className="flex gap-4 p-5">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-16 h-24 object-cover rounded-[4px] shrink-0"
                />
              ) : (
                <span className="w-16 h-24 rounded-[4px] shrink-0 bg-[#EFEFEF] flex items-center justify-center text-[#9A9A9A]">
                  <IconFilm size={24} />
                </span>
              )}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <p className="font-[DM_Serif_Display] text-[18px] text-[#111111] leading-tight">
                  {event.title}
                </p>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-[12px] font-[Outfit] text-[#4A4A4A]">
                    <IconCalendar />
                    {formatDate(event.eventDate)} · {formatTime(event.eventDate)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] font-[Outfit] text-[#4A4A4A]">
                    <IconLocation />
                    {event.venue}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 flex flex-col gap-2">
              <div className="flex justify-between text-[13px] font-[Outfit] text-[#4A4A4A]">
                <span>Preço unitário</span>
                <span>{formatPrice(event.priceCents)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-[Outfit] text-[#4A4A4A]">
                <span>Quantidade</span>
                <span>
                  {quantity} {quantity === 1 ? 'ingresso' : 'ingressos'}
                </span>
              </div>
              <div className="h-px bg-[#E0E0E0] my-1" />
              <div className="flex justify-between items-baseline">
                <span className="font-[Outfit] font-semibold text-[15px] text-[#111111]">Total</span>
                <span className="font-[Outfit] font-semibold text-[22px] text-[#E5181B]">
                  {formatPrice(totalCents)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
