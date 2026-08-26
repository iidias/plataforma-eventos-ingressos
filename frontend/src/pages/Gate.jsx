// Tela da portaria: leitura por câmera ou digitação do código, com o painel
// dos 4 estados de validação. Fundo escuro e fora do layout global de
// propósito: quem opera aqui olha de relance, no escuro, com fila atrás.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import { IconCamera, IconCheck, IconClock, IconWarning, IconX } from '../components/icons.jsx';

const RESULTS = {
  VALID: { label: 'INGRESSO VÁLIDO', color: 'bg-[#16A34A]', Icon: IconCheck },
  INVALID: { label: 'INGRESSO INVÁLIDO', color: 'bg-[#E5181B]', Icon: IconX },
  ALREADY_USED: { label: 'INGRESSO JÁ UTILIZADO', color: 'bg-[#D97706]', Icon: IconClock },
  WRONG_EVENT: { label: 'EVENTO ERRADO', color: 'bg-[#D97706]', Icon: IconWarning },
};

// "Duna: Parte Dois — 30/08 · 20h00"
function eventLine(event) {
  if (!event) return '—';

  const date = new Date(event.eventDate);
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return `${event.title} — ${day} · ${time.replace(':', 'h')}`;
}

function ResultPanel({ data, onReset }) {
  const { label, color, Icon } = RESULTS[data.result] ?? RESULTS.INVALID;

  return (
    <div className={`${color} rounded-[6px] px-6 py-10 text-center text-white`}>
      <span className="inline-flex [&>svg]:w-12 [&>svg]:h-12">
        <Icon />
      </span>

      <h2 className="font-[Outfit] font-bold text-[28px] tracking-tight mt-3">{label}</h2>

      {data.result === 'VALID' && (
        <>
          <p className="font-[Outfit] text-[16px] opacity-90 mt-2">{data.customerName}</p>
          <p className="font-[Outfit] text-[15px] font-medium mt-2">{eventLine(data.event)}</p>
        </>
      )}

      {data.result === 'INVALID' && (
        <p className="font-[Outfit] text-[15px] opacity-90 mt-2">Código não reconhecido</p>
      )}

      {data.result === 'ALREADY_USED' && data.usedAt && (
        <p className="font-[Outfit] text-[15px] opacity-90 mt-2">
          Validado em {new Date(data.usedAt).toLocaleString('pt-BR')}
        </p>
      )}

      {data.result === 'WRONG_EVENT' && (
        <>
          <p className="font-[Outfit] text-[15px] opacity-90 mt-2">
            Ingresso de: {eventLine(data.event)}
          </p>
          <p className="font-[Outfit] text-[13px] opacity-70 mt-1">{data.event?.venue}</p>
        </>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-6 font-[Outfit] text-[14px] bg-white/20 hover:bg-white/30 rounded-[4px] px-5 h-10 transition-colors"
      >
        Nova Validação
      </button>
    </div>
  );
}

export default function Gate() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const scannerRef = useRef(null);

  const [event, setEvent] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  // O evento vem da credencial: /auth/me devolve gate.event para o papel GATE.
  useEffect(() => {
    api
      .get('/auth/me', { token })
      .then((me) => setEvent(me.gate?.event ?? null))
      .catch(() => setError('Não foi possível carregar o evento da credencial.'));
  }, [token]);

  useEffect(() => () => scannerRef.current?.stop().catch(() => {}), []);

  async function stopCamera() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);

    if (scanner) await scanner.stop().catch(() => {});
  }

  async function startCamera() {
    setError('');
    setScanning(true);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 240 }, (text) => {
        stopCamera();
        validate(text);
      });
    } catch {
      scannerRef.current = null;
      setScanning(false);
      setError('Não foi possível acessar a câmera. Use a digitação do código.');
    }
  }

  async function validate(rawCode) {
    const value = rawCode.trim().toUpperCase();
    if (!value) return;

    setLoading(true);
    setError('');

    try {
      const data = await api.post('/gate/validate', { code: value }, { token });

      setResult(data);
      setHistory((prev) => [{ code: value, result: data.result, at: new Date() }, ...prev].slice(0, 8));
      setCode('');
    } catch (apiError) {
      setError(
        apiError.status === 401 || apiError.status === 403
          ? 'Sessão da portaria encerrada. Entre novamente.'
          : apiError.message,
      );
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await stopCamera();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] px-6 py-10 pb-24">
      <div className="max-w-[672px] mx-auto">
        <p className="font-[Outfit] text-[11px] uppercase tracking-widest text-[#9A9A9A]">
          ingressoFilm
        </p>
        <h1 className="font-[DM_Serif_Display] text-[32px] text-white leading-tight mt-1">
          Controle de Portaria
        </h1>

        <p className="font-[Outfit] text-[11px] uppercase tracking-widest text-[#9A9A9A] mt-6">
          Evento em validação
        </p>
        <div className="bg-[#2A2A2A] border-l-2 border-[#E5181B] rounded-[4px] px-4 h-12 flex items-center mt-2">
          <span className="font-[Outfit] text-[15px] text-white">{eventLine(event)}</span>
        </div>

        <button
          type="button"
          onClick={scanning ? stopCamera : startCamera}
          className="w-full h-12 mt-5 rounded-[4px] bg-[#E5181B] hover:bg-[#CC1518] text-white font-[Outfit] font-medium text-[15px] inline-flex items-center justify-center gap-2 transition-colors"
        >
          <IconCamera />
          {scanning ? 'Parar Leitura' : 'Iniciar Leitura de QR Code'}
        </button>

        <div id="qr-reader" className={`mt-4 rounded-[4px] overflow-hidden ${scanning ? '' : 'hidden'}`} />

        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-[#3A3A3A]" />
          <span className="font-[Outfit] text-[12px] text-[#9A9A9A]">ou informe o código</span>
          <span className="flex-1 h-px bg-[#3A3A3A]" />
        </div>

        <form
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault();
            validate(code);
          }}
        >
          <input
            value={code}
            onChange={(inputEvent) => setCode(inputEvent.target.value.toUpperCase())}
            placeholder="Ex: IFM-2026-5TH7X0KM"
            className="w-full h-12 rounded-[4px] bg-[#2A2A2A] border border-[#3A3A3A] px-4 font-mono text-[15px] tracking-[0.1em] text-white placeholder:text-[#6A6A6A] focus:outline-none focus:border-[#E5181B]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-3 rounded-[4px] bg-[#3A3A3A] hover:bg-[#484848] disabled:opacity-60 text-white font-[Outfit] font-medium text-[15px] inline-flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Spinner size={16} /> : 'Validar Ingresso'}
          </button>
        </form>

        {error && (
          <p className="font-[Outfit] text-[14px] text-[#FF8A8C] mt-4 text-center">{error}</p>
        )}

        {result && (
          <div className="mt-6">
            <ResultPanel data={result} onReset={() => setResult(null)} />
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8">
            <p className="font-[Outfit] text-[11px] uppercase tracking-widest text-[#9A9A9A]">
              Validações desta sessão
            </p>
            <ul className="mt-2 divide-y divide-[#2A2A2A]">
              {history.map((item, index) => (
                <li
                  key={`${item.code}-${index}`}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="font-mono text-[13px] text-[#CFCFCF]">{item.code}</span>
                  <span className="font-[Outfit] text-[12px] text-[#9A9A9A]">
                    {RESULTS[item.result]?.label ?? item.result} ·{' '}
                    {item.at.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="fixed bottom-5 left-5 h-9 px-4 rounded-[4px] bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#CFCFCF] font-[Outfit] text-[13px] transition-colors"
      >
        ← Sair da Portaria
      </button>
    </div>
  );
}
