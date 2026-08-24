# plataforma-eventos-ingressos

Projeto feito para o desafio técnico Elite Dev (Verzel).

A ideia é simples: um organizador cria eventos a partir de um catálogo de filmes, define data, local, capacidade e preço. O cliente navega pelos eventos, reserva, paga (de forma simulada) e recebe um ingresso com QR Code, que também pode compartilhar por link. Na entrada, a portaria valida esse ingresso.

Status do projeto
Em construção.

O que já está pronto:

Back-end: banco modelado com Prisma, login com JWT e controle por papel, integração com o catálogo do TMDb e o CRUD de eventos (criar, listar, editar e publicar). Tem seed com usuários de teste e um evento publicado.

Front-end: base do projeto com Vite, Tailwind configurado com as cores e fontes do design, roteamento com React Router, cliente HTTP centralizado, contexto de autenticação e rotas protegidas por papel. As telas prontas são: login (com atalhos que preenchem as credenciais de teste), cadastro com a opção "Sou organizador", lista de eventos com busca, detalhe do evento com seletor de quantidade e total, painel do organizador com a credencial da portaria, criação de evento em dois passos (busca no catálogo e depois o formulário), além do layout com header e da página 404.

A edição de evento existe na API (`PATCH /events/:id`), mas ainda não tem tela — o botão "Editar" no painel aparece desabilitado de propósito.

O cadastro padrão cria uma conta de cliente, com a opção de marcar "Sou organizador" para criar uma conta de organizador — o papel é decidido no servidor a partir dessa opção, nunca por um campo enviado pelo navegador. A mesma pessoa pode ter os dois acessos usando e-mails diferentes. Cada evento publicado tem um único usuário `GATE`, criado automaticamente com e-mail e senha gerados pelo sistema e vinculado somente àquele evento. O organizador abre a credencial pela ação "Credencial" na lista de eventos: o usuário fica sempre visível e a senha aparece só no momento em que é gerada ou regenerada, porque o banco guarda apenas o hash. Regenerar invalida na hora a senha anterior e as sessões abertas com ela. O acesso funciona antes e durante o evento e expira um dia depois do fim do dia do evento — o usuário não é apagado, para o histórico de validações continuar existindo.

O que ainda falta: reserva, checkout com pagamento simulado, geração e compartilhamento dos ingressos e a tela da portaria.

Stack que vou usar
Front-end: React + Vite
Back-end: Node.js + Express
Banco de dados: PostgreSQL
ORM: Prisma
Estilo: Tailwind CSS
Escolhi essa combinação porque front e back ficam na mesma linguagem (JavaScript), o que facilita bastante já que estou construindo o projeto sozinho em pouco tempo.

Decisões do projeto
Estou registrando as decisões técnicas e o porquê de cada uma em docs/DECISIONS.md, conforme vou avançando. Começou com as decisões de produto e de stack (pista de ingressos ao invés de mapa de assentos, uso do TMDb, JavaScript ao invés de TypeScript, como o pagamento simulado vai funcionar) e agora também tem as decisões do front-end (estilização, autenticação, comunicação com a API e proteção de rotas).

Uso de IA
Estou usando IA (Claude) para me ajudar a planejar e organizar o projeto, já que é a primeira vez que faço um desafio desse tipo. Vou detalhar isso melhor em docs/AI_USAGE.md conforme o projeto avança.

Como rodar o projeto
Precisa de Node.js e de um PostgreSQL rodando. São dois terminais: um para o back-end e outro para o front-end.

Back-end (sobe em http://localhost:3000):

```bash
cd backend
npm install
```

Copie o `.env.example` para `.env` e preencha `DATABASE_URL`, `JWT_SECRET`, `TICKET_SECRET` e `TMDB_API_KEY` (a chave do TMDb é gratuita e sai do site deles). Depois crie as tabelas e popule o banco:

```bash
npx prisma migrate dev
```

```bash
npx prisma db seed
```

E então:

```bash
npm run dev
```

Front-end (sobe em http://localhost:5173):

```bash
cd frontend
npm install
```

Copie o `.env.example` para `.env` — ele já vem com `VITE_API_URL=http://localhost:3000`, que é o endereço do back-end. Depois:

```bash
npm run dev
```

Abra http://localhost:5173. Durante a fase de teste, a tela de login terá três atalhos: cliente, organizador e um usuário `GATE` de demonstração vinculado ao evento do seed. Em eventos normais, o usuário `GATE` será criado automaticamente quando o evento for criado.

Para gerar a build de produção do front-end:

```bash
npm run build
```
