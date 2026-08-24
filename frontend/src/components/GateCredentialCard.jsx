// Credencial de portaria recém-gerada (wireframe "evento publicado").
// A senha só existe nesta resposta da API: depois daqui não há como recuperá-la,
// por isso o aviso. Os campos e o botão de copiar são reaproveitados pelo
// GateCredentialModal, que mostra a mesma credencial a partir do painel.
import { useState } from 'react';
import { IconCopy, IconCheckSmall } from './icons.jsx';

export function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sem permissão de clipboard (ou fora de HTTPS) o valor continua
      // visível na tela para ser copiado à mão.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copiado' : 'Copiar'}
      aria-label={copied ? 'Copiado' : `Copiar ${label}`}
      className="shrink-0 flex items-center justify-center w-7 h-7 rounded-[4px] border border-[#E0E0E0] text-[#9A9A9A] hover:text-[#111111] hover:border-[#9A9A9A] transition-colors cursor-pointer"
    >
      {copied ? <IconCheckSmall /> : <IconCopy />}
    </button>
  );
}

export function CredField({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-[Outfit] text-[11px] text-[#9A9A9A] uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 font-mono text-[13px] text-[#111111] bg-[#F7F7F7] border border-[#E0E0E0] rounded-[4px] px-3 py-1.5 truncate">
          {value}
        </code>
        <CopyButton value={value} label={label} />
      </div>
    </div>
  );
}

export default function GateCredentialCard({ gate }) {
  if (!gate?.password) return null;

  return (
    <div className="w-full text-left border border-[#E0E0E0] rounded-[6px] p-4 flex flex-col gap-3">
      <p className="font-[Outfit] font-semibold text-[13px] text-[#111111]">Credencial da portaria</p>
      <CredField label="Usuário" value={gate.email} />
      <CredField label="Senha" value={gate.password} />
      <p className="font-[Outfit] text-[11px] text-[#9A9A9A] leading-relaxed">
        Anote agora — essa senha não será exibida novamente. Você pode gerar uma nova a
        qualquer momento na lista de eventos.
      </p>
    </div>
  );
}
