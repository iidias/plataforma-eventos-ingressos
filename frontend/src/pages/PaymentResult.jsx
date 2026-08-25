// Resultado do pagamento.
// Wireframes: "checkout aprovado.png" e "checkout REPROVADO.png".
// Não é uma rota própria: o checkout troca para esta tela depois da resposta
// do backend, e também a mostra quando a reserva já foi processada antes
// (recarregar o checkout de uma reserva paga cai aqui, não num erro).
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { IconCheckCircleLg, IconXCircleLg, IconShield } from '../components/icons.jsx';

function Moldura({ children }) {
  return (
    <div className="bg-[#F7F7F7] flex-1 flex items-center justify-center px-6 py-12">
      <div className="bg-white border border-[#E0E0E0] rounded-[6px] max-w-md w-full p-10 flex flex-col items-center gap-6 text-center">
        {children}
      </div>
    </div>
  );
}

export default function PaymentResult({ approved, reservation }) {
  const eventId = reservation?.event?.id;

  if (approved) {
    const quantidade = reservation?.quantity ?? 0;

    return (
      <Moldura>
        <span className="text-[#16A34A]">
          <IconCheckCircleLg />
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="font-[DM_Serif_Display] text-[32px] text-[#111111] leading-tight">
            Pagamento aprovado!
          </h1>
          <p className="font-[Outfit] text-[15px] text-[#4A4A4A] leading-relaxed">
            Sua reserva foi confirmada. {quantidade === 1 ? 'Seu ingresso já está' : `Seus ${quantidade} ingressos já estão`}{' '}
            {quantidade === 1 ? 'disponível' : 'disponíveis'} em <strong>Meus Ingressos</strong>.
          </p>
        </div>

        {/* O número do pedido é o id da reserva: é por ele que o cliente
            consegue ser encontrado no suporte. */}
        <div className="w-full bg-[#F7F7F7] border border-[#E0E0E0] rounded-[4px] px-4 py-3 flex flex-col gap-0.5">
          <span className="font-[Outfit] text-[11px] text-[#9A9A9A] uppercase tracking-wide">
            Número do pedido
          </span>
          <span className="font-mono text-[13px] text-[#111111] break-all">{reservation?.id}</span>
        </div>

        <div className="w-full flex flex-col gap-3 mt-2">
          <Link to="/meus-ingressos" className="w-full">
            <Button size="lg" className="w-full">
              Ver meus ingressos
            </Button>
          </Link>
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full">
              Voltar ao início
            </Button>
          </Link>
        </div>

        <span className="flex items-center gap-1.5 text-[#9A9A9A]">
          <IconShield />
          <span className="font-[Outfit] text-[12px]">Pagamento simulado — nenhuma cobrança real foi feita</span>
        </span>
      </Moldura>
    );
  }

  return (
    <Moldura>
      <span className="text-[#E5181B]">
        <IconXCircleLg />
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="font-[DM_Serif_Display] text-[32px] text-[#111111] leading-tight">
          Pagamento recusado
        </h1>
        <p className="font-[Outfit] text-[15px] text-[#4A4A4A] leading-relaxed">
          Não foi possível processar o pagamento. A reserva foi cancelada e os lugares
          voltaram para a venda.
        </p>
      </div>

      <div className="w-full bg-[#FFF1F2] border border-[#FECDD3] rounded-[4px] px-4 py-3 text-left flex flex-col gap-1">
        <p className="font-[Outfit] font-semibold text-[13px] text-[#E5181B]">Possíveis causas</p>
        <ul className="font-[Outfit] text-[12px] text-[#4A4A4A] list-disc list-inside flex flex-col gap-0.5">
          <li>Saldo insuficiente</li>
          <li>Dados do cartão incorretos</li>
          <li>Cartão bloqueado ou expirado</li>
        </ul>
      </div>

      <div className="w-full flex flex-col gap-3 mt-2">
        {/* "Tentar novamente" volta para o evento, não para este checkout: a
            reserva anterior foi cancelada e a capacidade devolvida, então uma
            nova tentativa precisa nascer de uma reserva nova. */}
        {eventId && (
          <Link to={`/eventos/${eventId}`} className="w-full">
            <Button size="lg" className="w-full">
              Tentar novamente
            </Button>
          </Link>
        )}
        <Link to="/" className="w-full">
          <Button variant="outline" className="w-full">
            Voltar ao início
          </Button>
        </Link>
      </div>
    </Moldura>
  );
}
