// Credencial da portaria vista a partir do painel do organizador.
// Wireframes: "visualizar credencial" (estado inicial) e "visualizar credencial
// senha regerada" (depois de gerar).
//
// A tensão entre "o organizador vê a credencial do evento" e "a senha é
// exibida uma única vez" é resolvida exatamente como o wireframe manda: o
// USUÁRIO fica sempre disponível; a SENHA só aparece no instante em que é
// gerada ou regenerada. No banco existe apenas o hash — não há de onde ler a
// senha depois, e é por isso que a saída para quem perdeu a senha é gerar
// outra, não consultá-la.
import { useState } from 'react';
import { api } from '../api/client.js';
import Alert from './Alert.jsx';
import Button from './Button.jsx';
import { CredField } from './GateCredentialCard.jsx';
import { IconX } from './icons.jsx';

export default function GateCredentialModal({ event, onClose, onGenerated }) {
  const [password, setPassword] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Evento publicado antes da credencial existir: não há e-mail ainda, e o
  // mesmo endpoint cria a credencial na primeira geração.
  const gate = event.gate;
  const revealed = Boolean(password);

  async function generate() {
    setGenerating(true);
    setError('');

    try {
      const created = await api.post(`/events/${event.id}/gate/regenerate`);
      setPassword(created.password);
      onGenerated?.(event.id, created);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(17,17,17,0.45)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Credencial da portaria"
    >
      <div className="bg-white border border-[#E0E0E0] rounded-[6px] w-full max-w-[400px] flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#E0E0E0]">
          <div>
            <h2 className="font-[DM_Serif_Display] text-[20px] text-[#111111] leading-tight">
              Credencial da portaria
            </h2>
            <p className="font-[Outfit] text-[12px] text-[#9A9A9A] mt-0.5 leading-snug">
              {event.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#9A9A9A] hover:text-[#111111] transition-colors mt-0.5 cursor-pointer"
          >
            <IconX />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {gate ? (
            <CredField label="Usuário" value={gate.email} />
          ) : (
            <p className="font-[Outfit] text-[12px] text-[#4A4A4A] leading-relaxed">
              Este evento ainda não tem credencial de portaria. Gere uma para que a
              equipe consiga validar os ingressos na entrada.
            </p>
          )}

          {revealed ? (
            <>
              <CredField label="Senha" value={password} />
              <p className="font-[Outfit] text-[11px] text-[#9A9A9A] leading-relaxed">
                Anote agora — essa senha não será exibida novamente. Você pode regenerar a
                qualquer momento, mas a senha atual deixará de funcionar imediatamente.
              </p>
            </>
          ) : (
            <div className="bg-[#F7F7F7] border border-[#E0E0E0] rounded-[4px] px-4 py-3">
              <p className="font-[Outfit] text-[12px] text-[#4A4A4A] leading-relaxed">
                A senha só é exibida no momento em que é gerada ou regenerada, por segurança.
              </p>
            </div>
          )}

          {gate?.expired && !revealed && (
            <Alert
              type="warning"
              message="Esta credencial expirou. O evento já passou e a portaria não consegue mais entrar."
            />
          )}

          {error && <Alert type="error" message={error} />}
        </div>

        <div className="px-6 pb-6 flex flex-col gap-2">
          {!revealed && (
            <>
              <Button className="w-full" loading={generating} onClick={generate}>
                {generating ? 'Gerando...' : gate ? 'Regenerar senha' : 'Gerar credencial'}
              </Button>
              {gate && (
                <p className="font-[Outfit] text-[11px] text-[#9A9A9A] text-center">
                  A senha atual deixará de funcionar imediatamente.
                </p>
              )}
            </>
          )}
          <Button variant="outline" className="w-full" onClick={onClose}>
            {revealed ? 'Concluído' : 'Fechar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
