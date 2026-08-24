// Middleware de tratamento de erros do Express.
// Precisa ter exatamente 4 parâmetros (err, req, res, next) para o Express
// reconhecer como error handler. Deve ser registrado por último no app.js.

// Erros do Prisma não têm .status e cairiam em 500 com a mensagem interna
// exposta. O caso que importa aqui é o P2002 (violação de campo @unique),
// que acontece quando alguém tenta se cadastrar com um e-mail já usado.
function translatePrismaError(err) {
  if (err?.code !== 'P2002') return null;

  // O campo violado aparece em lugares diferentes conforme o driver: em
  // meta.target (formato clássico) ou dentro do erro do driver adapter.
  const constraint = err.meta?.driverAdapterError?.cause?.constraint;
  const target = [err.meta?.target, constraint?.fields, constraint?.index]
    .flat()
    .filter(Boolean)
    .join(',');

  if (/email/i.test(target)) {
    return { status: 409, message: 'Este e-mail já está em uso' };
  }

  return { status: 409, message: 'Registro já existente' };
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  const prismaError = translatePrismaError(err);

  if (prismaError) {
    return res.status(prismaError.status).json({ error: prismaError.message });
  }

  // Só erros que o próprio código marcou com .status têm mensagem segura
  // para devolver ao cliente. O resto vira 500 genérico — o detalhe fica
  // no console do servidor, não na resposta.
  if (err?.status) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: 'Erro interno do servidor' });
}
