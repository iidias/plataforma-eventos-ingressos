import { randomBytes, createHash } from 'node:crypto';

// Domínio da marca. O validador de e-mail do projeto (zod) exige um TLD,
// por isso "@ingressofilm.com" e não "@ingressofilm".
const GATE_EMAIL_DOMAIN = 'ingressofilm.com';

function randomString(bytes) {
  return randomBytes(bytes).toString('base64url').replace(/[-_]/g, '').toLowerCase();
}

// E-mail curto e aleatório. A coluna email é @unique, então uma colisão
// (improvável) falharia na escrita em vez de sobrescrever alguém.
export function generateGateEmail() {
  return `portaria-${randomString(6).slice(0, 8)}@${GATE_EMAIL_DOMAIN}`;
}

// Senha mostrada uma única vez ao organizador; no banco fica só o hash.
export function generateGatePassword() {
  return randomString(9).slice(0, 12);
}

/**
 * Validade da credencial: fim do dia do evento + 1 dia.
 *
 * eventDate é um DateTime; o cálculo é feito em UTC — o mesmo referencial em
 * que o Prisma grava a data — para não depender do fuso da máquina que roda o
 * servidor. Resultado: 00:00 UTC de (dia UTC do evento + 2), ou seja, a
 * credencial atravessa o dia do evento e mais um dia inteiro.
 *
 * Comportamento observado, com o sistema todo em UTC e leitura em BRT (UTC-3):
 *
 *   evento 22/09 12:00 BRT  ->  expira 24/09 00:00 UTC  =  23/09 21:00 BRT
 *   evento 22/09 20:00 BRT  ->  expira 24/09 00:00 UTC  =  23/09 21:00 BRT
 *   evento 22/09 22:43 BRT  ->  expira 25/09 00:00 UTC  =  24/09 21:00 BRT
 *
 * Os dois primeiros dão o dia do evento + ~1 dia, que é a regra. O terceiro
 * ganha um dia extra porque, em UTC, um evento noturno já caiu no dia
 * seguinte. O desvio é sempre para MAIS tempo: a credencial nunca expira
 * antes do fim do evento, que é o único erro que causaria problema real
 * (portaria perdendo acesso com fila na porta). Corrigir os 3h de folga
 * exigiria introduzir fuso horário no sistema, que hoje é UTC de ponta a
 * ponta — desproporcional para o ganho.
 */
export function gateExpiresAtFor(eventDate) {
  const date = new Date(eventDate);

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 2, 0, 0, 0, 0),
  );
}

/**
 * Impressão digital da senha atual da credencial, gravada no token do GATE.
 *
 * Sem isso, regenerar a senha derruba só quem tenta entrar de novo: uma aba já
 * aberta continuaria validando ingressos por até 7 dias com a credencial que
 * o organizador acabou de revogar. Como o hash bcrypt muda a cada regeneração,
 * comparar a impressão do token com a do banco invalida as sessões antigas no
 * mesmo instante — que é o que "a senha anterior deixa de funcionar" quer
 * dizer na prática.
 *
 * É derivado do hash, nunca da senha, e truncado: serve para detectar
 * mudança, não para reconstruir nada.
 */
export function gatePasswordFingerprint(passwordHash) {
  return createHash('sha256').update(passwordHash).digest('base64url').slice(0, 16);
}

export function isGateExpired(gateExpiresAt) {
  if (!gateExpiresAt) return true;

  return new Date(gateExpiresAt).getTime() <= Date.now();
}

// Resumo exibível da credencial. Nunca inclui passwordHash nem a senha:
// a senha original só existe no instante em que é gerada.
export function gateSummary(gateUser) {
  if (!gateUser) return null;

  return {
    id: gateUser.id,
    email: gateUser.email,
    expiresAt: gateUser.gateExpiresAt,
    expired: isGateExpired(gateUser.gateExpiresAt),
  };
}
