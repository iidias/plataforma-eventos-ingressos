import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../lib/password.js';
import { isGateExpired, gatePasswordFingerprint } from '../lib/gateCredential.js';

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
  }
}

// O token do GATE nunca pode durar mais que a própria credencial: se o
// evento acabou, o token também acaba. Para os outros papéis nada muda.
function tokenTtlFor(user) {
  if (user.role !== 'GATE' || !user.gateExpiresAt) return TOKEN_TTL_SECONDS;

  const remaining = Math.floor((new Date(user.gateExpiresAt).getTime() - Date.now()) / 1000);

  return Math.max(1, Math.min(TOKEN_TTL_SECONDS, remaining));
}

function signToken(user) {
  requireJwtSecret();

  const payload = { sub: user.id, role: user.role };

  // Só o GATE carrega a impressão da senha: é o único papel cuja credencial
  // o organizador pode revogar a qualquer momento, e o middleware auth já
  // consulta o banco nesse caso.
  if (user.role === 'GATE') {
    payload.pv = gatePasswordFingerprint(user.passwordHash);
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: tokenTtlFor(user),
  });
}

export async function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  const passwordMatches = user
    ? await comparePassword(password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    const error = new Error('Email ou senha inválidos');
    error.status = 401;
    throw error;
  }

  // Credencial de portaria só entra se ainda estiver vinculada a um evento
  // e dentro da validade. O usuário continua no banco (auditoria), só não opera.
  if (user.role === 'GATE' && (!user.gateEventId || isGateExpired(user.gateExpiresAt))) {
    const error = new Error('Credencial de portaria expirada');
    error.status = 401;
    throw error;
  }

  return {
    token: signToken(user),
    user: publicUser(user),
  };
}

// Cadastro público. O papel é decidido aqui, a partir de um booleano —
// nunca a partir de um campo "role" enviado pelo cliente. GATE não é
// alcançável por este caminho.
export async function registerUser({ name, email, password, isOrganizer }) {
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await hashPassword(password),
      role: isOrganizer ? 'ORGANIZER' : 'CUSTOMER',
    },
  });

  // Cadastro já autentica: devolve o mesmo contrato do login.
  return {
    token: signToken(user),
    user: publicUser(user),
  };
}

// Usado pela rota GET /auth/me (tarefa 41): devolve o usuário logado,
// identificado pelo "sub" que o middleware auth (tarefa 39) colocou em req.user.
export async function getById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { gateEvent: { select: { id: true, title: true, eventDate: true, venue: true } } },
  });

  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const me = publicUser(user);

  // A portaria precisa saber de qual evento ela é; os demais papéis
  // continuam recebendo exatamente os mesmos campos de antes.
  if (user.role === 'GATE') {
    me.gate = {
      event: user.gateEvent,
      expiresAt: user.gateExpiresAt,
      expired: isGateExpired(user.gateExpiresAt),
    };
  }

  return me;
}
