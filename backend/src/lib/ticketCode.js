import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Credencial de entrada do ingresso.
 *
 * O que a portaria recebe não é um identificador solto: é `IFM-<payload>-<tag>`,
 * onde a tag é um HMAC do payload feito com um segredo que só existe no
 * servidor. Alterar um caractere do payload quebra a assinatura, então ninguém
 * fabrica uma credencial válida sem o segredo — que é a diferença entre "esse
 * código existe na tabela" e "esse código foi emitido por mim".
 *
 * O banco guarda apenas o `payload`. A tag é recalculada quando a credencial
 * precisa ser montada ou conferida, e por isso um dump do banco não devolve
 * credenciais prontas para uso.
 */

// Mesmo alfabeto que o código curto já usava: 32 símbolos sem I, L, O e U,
// para ninguém confundir 1 com I nem 0 com O ao digitar na portaria.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const PREFIX = 'IFM';

// Versão da mensagem assinada. Nasce dentro do HMAC para que uma futura troca
// de segredo possa conviver com as credenciais já emitidas, em vez de invalidar
// todos os ingressos vendidos.
const VERSION = 'v1';

const PAYLOAD_CHARS = 12; // 12 x 5 bits = 60 bits de entropia
const TAG_CHARS = 6; //      6 x 5 bits = 30 bits de assinatura

const CREDENTIAL_PATTERN = new RegExp(
  `^${PREFIX}-([${ALPHABET}]{${PAYLOAD_CHARS}})-([${ALPHABET}]{${TAG_CHARS}})$`,
);

// Lê o buffer 5 bits por vez, do mais significativo para o menos. Fatiar em
// blocos de 5 bits é o que mantém cada caractere uniforme entre os 32 do
// alfabeto — diferente de um resto de divisão por byte, que só aproveitaria
// 5 dos 8 bits disponíveis.
function toBase32(buffer, chars) {
  let value = 0;
  let bits = 0;
  let out = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5 && out.length < chars) {
      bits -= 5;
      out += ALPHABET[(value >>> bits) & 31];
    }

    if (out.length === chars) break;

    value &= (1 << bits) - 1;
  }

  return out;
}

// Sem segredo não há assinatura: falha explícita, nunca um valor padrão. O
// mesmo desenho do JWT_SECRET em authService.
function requireTicketSecret() {
  const secret = process.env.TICKET_SECRET;

  if (!secret) {
    throw new Error('TICKET_SECRET não configurado');
  }

  return secret;
}

// 8 bytes sorteados dão 64 bits; os 60 primeiros viram os 12 caracteres.
export function generatePayload() {
  return toBase32(randomBytes(8), PAYLOAD_CHARS);
}

export function sign(payload) {
  const digest = createHmac('sha256', requireTicketSecret())
    .update(`${VERSION}|${payload}`)
    .digest();

  return toBase32(digest, TAG_CHARS);
}

export function toCredential(payload) {
  return `${PREFIX}-${payload}-${sign(payload)}`;
}

/**
 * Confere a credencial sem tocar no banco.
 *
 * Devolve `{ ok: true, payload }` quando a assinatura bate, e `{ ok: false }`
 * com o motivo quando não bate: `FORMAT` é lixo que nem chega a parecer uma
 * credencial, `SIGNATURE` é uma credencial bem formada cuja tag não confere —
 * o único dos dois que caracteriza tentativa de forjar.
 */
export function verify(credential) {
  const match = CREDENTIAL_PATTERN.exec(String(credential ?? '').trim().toUpperCase());

  if (!match) return { ok: false, reason: 'FORMAT' };

  const [, payload, tag] = match;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(tag);

  // O regex já garante o mesmo tamanho, mas timingSafeEqual lança se diferirem.
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: 'SIGNATURE' };
  }

  return { ok: true, payload };
}
