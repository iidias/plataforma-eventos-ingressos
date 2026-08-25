// Card de um ingresso: um QR por Ticket, com código, status e link próprios
// (D21). O link só é montado quando o cliente clica, porque é o backend que
// sabe qual é a URL pública da aplicação.
import { useState } from 'react';
import { api } from '../api/client.js';
import Button from './Button.jsx';
import TicketQr from './TicketQr.jsx';
import TicketStatusBanner from './TicketStatusBanner.jsx';
import { IconLink, IconCheckSmall } from './icons.jsx';

export default function TicketCard({ ticket, label }) {
  const [copy, setCopy] = useState('idle'); // idle | loading | done | error
  // Guardado para o caso de a área de transferência ser negada pelo navegador:
  // aí o link aparece na tela para o cliente copiar à mão, em vez de sumir.
  const [shareUrl, setShareUrl] = useState('');

  const copyShareLink = async () => {
    setCopy('loading');

    try {
      const { shareUrl: url } = await api.post(`/tickets/${ticket.id}/share`);
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setCopy('done');
      setTimeout(() => setCopy('idle'), 2000);
    } catch {
      setCopy('error');
    }
  };

  return (
    <article className="bg-white border border-[#E0E0E0] rounded-[6px] flex flex-col">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-dashed border-[#E0E0E0]">
        <span className="font-[Outfit] text-[11px] uppercase tracking-widest text-[#9A9A9A]">
          {label}
        </span>
        <span className="w-2 h-2 rounded-full bg-[#E5181B]" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-4 p-5">
        <TicketQr code={ticket.code} used={ticket.status === 'USED'} />

        <TicketStatusBanner status={ticket.status} usedAt={ticket.usedAt} />

        <Button variant="outline" onClick={copyShareLink} loading={copy === 'loading'}>
          {copy === 'done' ? <IconCheckSmall /> : <IconLink />}
          {copy === 'done' ? 'Link copiado' : 'Copiar link'}
        </Button>

        {copy === 'error' && (
          <p className="font-mono text-[11px] text-[#4A4A4A] break-all text-center">
            {shareUrl || 'Não foi possível gerar o link. Tente de novo.'}
          </p>
        )}
      </div>
    </article>
  );
}
