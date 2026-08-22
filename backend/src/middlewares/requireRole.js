// Middleware de autorização: exige que req.user (definido pelo middleware
// auth, tarefa 39) tenha o papel informado. Autenticação != autorização:
// aqui só decidimos se quem já está autenticado pode fazer isso.
export const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : res.status(403).json({ error: 'Acesso negado' });
