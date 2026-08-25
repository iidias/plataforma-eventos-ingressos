// QR do ingresso, com o código em texto logo abaixo.
// Usado tanto na tela do cliente quanto na pública, sempre com value={code}:
// é o código assinado que a portaria lê, nunca o shareToken.
//
// Quando o ingresso já foi utilizado o QR fica esmaecido e recebe o carimbo
// "UTILIZADO" por cima, para ninguém tentar apresentá-lo de novo na entrada.
import { QRCodeSVG } from 'qrcode.react';

export default function TicketQr({ code, used = false }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative bg-white border border-[#E0E0E0] rounded-[4px] p-3">
        <QRCodeSVG
          value={code}
          size={240}
          className={`w-full h-auto max-w-[240px] ${used ? 'opacity-25' : ''}`}
        />
        {used && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="border-2 border-[#9A9A9A] text-[#9A9A9A] rounded-[4px] px-4 py-1.5 -rotate-12 font-[Outfit] font-semibold text-[18px] tracking-[0.2em]">
              UTILIZADO
            </span>
          </span>
        )}
      </div>
      <p className="font-mono text-[11px] text-[#4A4A4A] text-center break-all leading-relaxed">
        {code}
      </p>
    </div>
  );
}
