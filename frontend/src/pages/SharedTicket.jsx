// Ingresso compartilhado, em /i/:shareToken.
// Wireframe: "ingresso compartilhado.png".
//
// Não exige login: consome GET /public/tickets/:shareToken, que devolve só o
// evento, o código do QR e o status — nada sobre quem comprou. Token
// inexistente responde 404 e cai na tela de erro daqui.
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import TicketBrandBar from '../components/TicketBrandBar.jsx';
import TicketEventInfo from '../components/TicketEventInfo.jsx';
import TicketQr from '../components/TicketQr.jsx';
import TicketStatusBanner from '../components/TicketStatusBanner.jsx';

export default function SharedTicket() {
  const { shareToken } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notFound | error
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      setTicket(await api.get(`/public/tickets/${shareToken}`, { auth: false }));
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus(err.status === 404 ? 'notFound' : 'error');
    }
  }, [shareToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-[#F7F7F7] flex-1">
      <div className="max-w-[560px] mx-auto px-6 py-8 flex flex-col gap-6">
        {status === 'loading' && <Skeleton className="h-[620px] w-full" />}

        {status === 'notFound' && (
          <div className="bg-white border border-[#E0E0E0] rounded-[6px]">
            <ErrorState
              title="Ingresso não encontrado"
              message="Este link não corresponde a nenhum ingresso. Confira se ele foi copiado por inteiro."
            />
          </div>
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

        {status === 'ready' && (
          <>
            <Alert
              type="info"
              message="Visualização somente leitura. Este link foi compartilhado com você: o QR Code pertence ao titular original e vale apenas para apresentação na portaria."
            />

            <div className="bg-white border border-[#E0E0E0] rounded-[6px] overflow-hidden">
              <TicketBrandBar />
              <TicketEventInfo event={ticket.event} />

              <div className="border-t border-dashed border-[#E0E0E0] px-6 py-6 flex flex-col gap-4">
                <TicketQr code={ticket.code} used={ticket.status === 'USED'} />
                <TicketStatusBanner
                  status={ticket.status}
                  usedAt={ticket.usedAt}
                  label={ticket.status === 'USED' ? 'Ingresso utilizado' : 'Ingresso válido'}
                />
              </div>
            </div>

            <p className="font-[Outfit] text-[12px] text-[#9A9A9A] text-center">
              Emitido por <span className="text-[#111111] font-medium">ingressoFilm</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
