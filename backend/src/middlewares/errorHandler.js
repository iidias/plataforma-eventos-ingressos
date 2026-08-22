// Middleware de tratamento de erros do Express.
// Precisa ter exatamente 4 parâmetros (err, req, res, next) para o Express
// reconhecer como error handler. Deve ser registrado por último no app.js.
export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({ error: message });
}
