import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { isGateExpired, gatePasswordFingerprint } from '../lib/gateCredential.js';

// Lê o header Authorization: Bearer <token>, verifica com jwt.verify
// e coloca o resultado (payload assinado no login: { sub, role }) em req.user.
// Sem token ou token inválido/expirado -> 401.
//
// Para o papel GATE há um passo a mais: assinatura válida não basta, porque a
// credencial de portaria expira junto com o evento. Só nesse caso consultamos o
// banco — CUSTOMER e ORGANIZER seguem exatamente o fluxo anterior, sem query.
export async function auth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  if (payload.role === 'GATE') {
    try {
      const gate = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { role: true, gateEventId: true, gateExpiresAt: true, passwordHash: true },
      });

      if (!gate || gate.role !== 'GATE' || !gate.gateEventId || isGateExpired(gate.gateExpiresAt)) {
        return res.status(401).json({ error: 'Credencial de portaria expirada' });
      }

      // Senha regenerada depois deste token ter sido emitido: a sessão antiga
      // cai aqui, em vez de sobreviver até o token expirar sozinho.
      if (payload.pv !== gatePasswordFingerprint(gate.passwordHash)) {
        return res.status(401).json({ error: 'Credencial da portaria foi alterada. Entre novamente.' });
      }

      // O evento vem da credencial, não da requisição: a portaria não escolhe
      // qual evento vai validar.
      req.gateEventId = gate.gateEventId;
    } catch (error) {
      return next(error);
    }
  }

  req.user = payload;
  next();
}
