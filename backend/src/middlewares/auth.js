import jwt from 'jsonwebtoken';

// Lê o header Authorization: Bearer <token>, verifica com jwt.verify
// e coloca o resultado (payload assinado no login: { sub, role }) em req.user.
// Sem token ou token inválido/expirado -> 401.
export function auth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
