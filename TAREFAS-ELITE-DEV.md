# DESAFIO ELITE DEV — TAREFAS

**Stack:** React + Vite · Node + Express (JavaScript) · PostgreSQL no Neon · Prisma · JWT · TMDb · Tailwind · Zod
**Escopo:** pista por quantidade (não mapa de assentos)

Marque as tarefas em ordem. Não soube como fazer alguma? Procure o número dela em **COMO FAZER**, mais abaixo.

## Regras de contas e acesso

Estas regras complementam as tarefas de autenticacao e sao a fonte de verdade do fluxo de usuarios:

- O cadastro padrao cria uma conta `CUSTOMER`.
- O cadastro tera a opcao **Sou organizador**. Marcando essa opcao, a conta sera criada como `ORGANIZER`.
- Uma pessoa pode ter uma conta de cliente e outra de organizador, mas precisa usar e-mails diferentes. Um e-mail identifica uma unica conta e um unico papel.
- Nao havera cadastro publico de portaria nem criacao manual de usuario `GATE`.
- Ao **publicar** um evento, o sistema gera automaticamente um unico usuario `GATE`, com e-mail e senha aleatorios, vinculado exclusivamente a esse evento. Rascunho nao tem portaria. As credenciais podem ser compartilhadas por duas ou mais pessoas da equipe.
- O usuario `GATE` fica vinculado a apenas um evento e permite somente validar ingressos desse evento; nao havera selecao manual de evento na portaria.
- O usuario `GATE` pode ser usado antes do evento e expira um dia depois do fim do dia do evento. Expirado, ele para de autenticar mas **nao e excluido**: o registro fica para o historico de validacoes.
- O organizador acessa a credencial pela acao **Credencial** na lista de eventos. O **usuario** fica sempre visivel; a **senha** so aparece no instante em que e gerada ou regenerada, porque o banco guarda apenas o hash. Ao regenerar, a senha anterior deixa de funcionar e as sessoes ja abertas com ela caem.
- O ingresso continua vinculado ao cliente. A credencial da portaria apenas autoriza a validacao do ingresso no evento associado.
- Excecao de demonstracao: o seed criara um evento de teste publicado e seu usuario `GATE` associado. A tela de login mantera o terceiro atalho para entrar com esse usuario e testar a portaria.

---

```
- [x] 1.  Criar um repositório PÚBLICO no GitHub, com README inicial
- [x] 2.  Clonar o repositório para o seu computador
- [x] 3.  Criar o arquivo .gitignore
- [x] 4.  Criar a pasta /docs com DECISIONS.md, FLOW.md, ERD.md e AI_USAGE.md
- [x] 5.  Registrar as 5 decisões iniciais no DECISIONS.md
- [x] 6.  Commit: docs: estrutura inicial e primeiras decisões do projeto
- [x] 7.  Escrever no README um parágrafo resumindo o sistema, com suas palavras
- [x] 8.  Escrever o fluxo dos 7 passos no docs/FLOW.md
- [x] 9.  Escrever o modelo de dados (5 tabelas) no docs/ERD.md
- [x] 10. Criar conta no TMDb e pegar a chave de API
- [x] 11. Commit: docs: adiciona fluxo do sistema e modelo de dados
- [x] 12. Definir paleta de cores, 2 fontes e escala de espaçamento
- [x] 13. Desenhar no Figma a tela de lista de eventos
- [x] 14. Desenhar no Figma o detalhe do evento com a reserva
- [x] 15. Desenhar no Figma o ingresso com QR
- [x] 16. Desenhar no Figma a portaria com os 3 estados (o 4º, “evento errado”, é variação do mesmo painel — ver tarefa 100)
- [x] 17. Exportar os prints para docs/design/
- [x] 18. Registrar a direção visual no DECISIONS.md
- [x] 19. Commit: docs: adiciona wireframes e direção visual
- [x] 20. Criar um banco PostgreSQL no Neon e copiar a connection string
- [x] 21. Criar a pasta backend e inicializar o projeto Node
- [x] 22. Instalar as dependências do backend
- [x] 23. Inicializar o Prisma
- [x] 24. Preencher o .env e criar o .env.example
- [x] 25. Escrever o prisma/schema.prisma com as 5 tabelas
- [x] 26. Rodar a primeira migration
- [x] 27. Conferir as tabelas no Prisma Studio
- [x] 28. Commit: feat: modela banco de dados com Prisma
- [x] 29. Criar src/lib/prisma.js
- [x] 30. Criar src/app.js com Express, cors e JSON
- [x] 31. Criar src/server.js
- [x] 32. Criar a rota GET /health
- [x] 33. Criar o middleware de tratamento de erros
- [x] 34. Adicionar o script "dev" no package.json
- [x] 35. Subir a API e testar /health
- [x] 36. Commit: feat: cria estrutura base da API com rota de health
- [x] 37. Criar o service de login (bcrypt + JWT)
- [x] 38. Criar a rota POST /auth/login
- [x] 39. Criar o middleware que valida o token
- [x] 40. Criar o middleware que checa o papel
- [x] 41. Criar a rota GET /auth/me
- [x] 42. Criar o seed com as contas de teste de cliente e organizador e um usuario `GATE` de demonstracao vinculado ao evento do seed
- [x] 43. Registrar e rodar o seed
- [x] 44. Testar login correto, login errado e rota sem token
- [x] 45. Commit: feat: implementa autenticação com JWT e papéis
- [x] 46. Criar o service do TMDb com busca e detalhe, normalizando a resposta
- [x] 47. Adicionar um cache simples de 10 minutos
- [x] 48. Tratar o erro de API externa indisponível (502)
- [x] 49. Criar as rotas de catálogo, protegidas para organizador
- [x] 50. Criar o service de eventos com snapshot dos dados do TMDb
- [x] 51. Criar a rota POST /events com validação
- [x] 52. Criar a rota GET /events (só publicados, com disponibilidade)
- [x] 53. Criar a rota GET /events/:id
- [x] 54. Criar a rota GET /organizer/events
- [x] 55. Criar as rotas de editar e publicar evento
- [x] 56. Adicionar 1 evento publicado no seed e vincular a ele o usuario `GATE` de demonstracao
- [x] 57. Testar todas as rotas no curl ou Postman
- [x] 58. Commit: feat: integra catálogo TMDb e implementa CRUD de eventos
- [x] 59. Criar o projeto frontend com Vite
- [x] 60. Instalar as dependências do frontend
- [x] 61. Configurar o Tailwind com suas cores e fontes
- [x] 62. Criar o .env do frontend
- [x] 63. Criar src/api/client.js
- [x] 64. Criar o AuthContext
- [x] 65. Criar o componente ProtectedRoute
- [x] 66. Registrar todas as rotas no App.jsx
- [x] 67. Criar os componentes base (Button, Card, Badge, Input, Spinner, EmptyState, ErrorState)
- [x] 68. Commit: chore: cria base do frontend com rotas e autenticação
- [x] 69. Criar a tela de login com atalhos de credenciais de teste
- [x] 70. Criar a tela de lista de eventos com busca
- [x] 71. Criar a tela de detalhe do evento com seletor de quantidade
- [x] 72. Criar o painel do organizador
- [x] 73. Criar a tela de criar evento (busca no TMDb + formulário)
- [x] 74. Criar o layout com header, papel do usuário e logout
- [x] 75. Commit: feat: implementa login, listagem e gestão de eventos
- [x] 76. Criar o service de reserva com a transação atômica
- [x] 77. Criar a rota POST /reservations
- [x] 78. Conectar o botão Reservar do frontend
- [x] 79. Tratar o erro de lugares insuficientes na tela
- [x] 80. Testar duas reservas simultâneas
- [x] 81. Commit: feat: implementa reserva com controle atômico de capacidade
- [x] 82. Criar o service de pagamento com os caminhos aprovado e recusado
- [x] 83. Criar a rota POST /reservations/:id/payment
- [x] 84. Criar a tela de checkout com os dois botões
- [x] 85. Criar a tela de resultado do pagamento
- [x] 86. Testar que a recusa não gera ingresso e devolve a capacidade
- [x] 87. Commit: feat: adiciona pagamento simulado com aprovação e recusa
- [x] 88. Criar o service que gera os ingressos com o código do QR e o shareToken
- [x] 89. Criar as rotas GET /tickets/me e GET /tickets/:id
- [x] 90. Criar a rota POST /tickets/:id/share
- [x] 91. Criar a rota pública GET /public/tickets/:shareToken
- [x] 92. Criar a tela Meus ingressos
- [x] 93. Criar a tela de detalhe do ingresso com o QR
- [x] 94. Criar a tela pública do ingresso compartilhado
- [x] 95. Testar o link de compartilhamento em janela anônima
- [x] 96. Commit: feat: gera ingressos com QR assinado e link de compartilhamento
- [x] 97.  Criar o service de validação com os 4 estados
- [x] 98.  Criar a rota POST /gate/validate, autenticada pelo usuário `GATE` do evento
- [x] 99.  Conferir que a validação usa o evento da credencial (o middleware `auth` já entrega `req.gateEventId`)
- [x] 100. Criar a tela da portaria com digitação manual e painel de resultado
- [x] 101. Adicionar o histórico de validações da sessão
- [x] 102. Adicionar a leitura por câmera
- [x] 103. Testar os 4 estados um por um
- [x] 104. Commit: feat: implementa validação de ingressos na portaria
- [x] 105. Instalar o Vitest
- [x] 106. Escrever os 4 testes das regras críticas
- [x] 107. Commit: test: cobre regras críticas de capacidade e validação
- [x] 108. Escrever o README completo
- [x] 109. Adicionar a tabela de usuários de teste
- [x] 110. Adicionar os roteiros de teste manual
- [x] 111. Escrever a seção de limitações conhecidas
- [x] 112. Finalizar o AI_USAGE.md
- [x] 113. Revisar o DECISIONS.md (mínimo 8 decisões)
- [x] 114. Commit: docs: completa README, decisões e uso de IA
- [x] 115. Publicar o backend no Render
- [x] 116. Publicar o frontend na Vercel
- [x] 117. Ajustar CORS_ORIGIN e APP_PUBLIC_URL
- [x] 118. Rodar o seed em produção
- [x] 119. Testar o fluxo inteiro na URL pública
- [x] 120. Testar a câmera pelo celular
- [x] 121. Adicionar o link do Vercel no projeto
- [x] 122. Clonar o próprio repositório numa pasta nova e seguir o README
- [x] 123. Rodar o fluxo completo com as contas do seed e o usuário `GATE` gerado para o evento
- [x] 124. Conferir que nenhum segredo vazou nos commits
- [x] 125. Remover console.log e código morto
- [x] 126. Conferir loading, vazio e erro em todas as telas
- [x] 127. Confirmar que o repositório está público
- [x] 128. Commit: chore: revisão final e limpeza de código
```

---
---

# COMO FAZER

---

**1. Criar o repositório**
github.com → botão verde **New** (ou o `+` no topo) → nome `plataforma-eventos-ingressos` → marque **Public** → marque "Add a README file" → **Create repository**.

**2. Clonar**
Na página do repo: botão verde **Code** → copie a URL HTTPS. No terminal, na pasta onde você guarda projetos:
```bash
git clone <cole-a-url-aqui>
cd plataforma-eventos-ingressos
```
`git clone` já deixa a conexão com o GitHub configurada — mais simples do que criar local e conectar depois.

**3. `.gitignore`**
Crie na raiz e cole:
```gitignore
node_modules/
dist/
build/
.env
.env.*
!.env.example
*.log
.DS_Store
```
Diz ao Git o que nunca subir. O `.env` vai guardar sua chave do TMDb — chave de API em repositório público é problema sério.

**4. Pasta de docs**
```bash
mkdir -p docs/design
touch docs/DECISIONS.md docs/FLOW.md docs/ERD.md docs/AI_USAGE.md
```

**5. Decisões iniciais**
Escreva com **suas palavras**, no formato *Decisão / Por quê / O que descartei*:
- **D1 — Pista por quantidade, não mapa de assentos.** O PDF permite escolher um; a regra difícil (não vender além da capacidade) é a mesma, sem o custo de interface do mapa.
- **D2 — TMDb, não Ticketmaster.** Chave única, docs boas, retorna pôsteres. O Ticketmaster tem cobertura fraca no Brasil e a demo pode vir vazia.
- **D3 — React+Vite / Node+Express / Postgres / Prisma.** Mesma linguagem nas duas pontas, fácil de explicar.
- **D4 — JavaScript, não TypeScript.** Em 6 dias, erro de tipagem em build e deploy custa horas.
- **D5 — Pagamento com botões explícitos de aprovar e recusar.** Assim o avaliador testa os dois caminhos de propósito.

**6, 11, 19, 28… (todos os commits)**
```bash
git status          # confira que .env NÃO aparece
git add .
git commit -m "<a mensagem indicada na tarefa>"
git push origin main
```
`git status` mostra o que mudou · `git add .` prepara · `git commit` grava · `git push` envia.

**7. Resumo no README**
Releia o PDF e escreva **sem olhar** um parágrafo: *"Um organizador cria eventos a partir de um catálogo de filmes, definindo data, local, capacidade e preço; um cliente reserva, paga de forma simulada e recebe um ingresso com QR que pode compartilhar; a portaria valida na entrada."* Se você consegue escrever isso sem consultar, entendeu o desafio.

**8. Fluxo no FLOW.md**
```
1. Organizador cria evento (filme do TMDb + data, local, capacidade, preço)
2. Cliente encontra o evento
3. Cliente reserva (escolhe a quantidade)
4. Cliente paga (aprovado ou recusado)
5. Sistema gera o ingresso (código curto e sorteado → QR)
6. Cliente vê e compartilha o ingresso
7. Portaria entra com o usuário `GATE` do evento e valida (válido / inválido / já utilizado / evento errado)
```
Cada passo depende do anterior — é por isso que a ordem de construção é essa.

**9. Modelo no ERD.md**
Cinco tabelas, anotando o motivo de cada uma:
- **User** — cliente, organizador ou portaria. Campo `role` com CUSTOMER, ORGANIZER ou GATE. A credencial de portaria **não virou tabela própria**: é um `User` com `role = GATE`, mais `gateEventId` (`@unique`, o que garante uma credencial por evento) e `gateExpiresAt`. Reaproveita o login, o hash de senha e o middleware que já existiam.
- **Event** — o evento. `capacity` é o limite, `soldCount` o já vendido; a diferença é o disponível.
- **Reservation** — a intenção de compra, antes do pagamento. Tem `quantity` e `status`.
- **Payment** — resultado do pagamento simulado. Um por reserva.
- **Ticket** — o ingresso. Tem `code` (vai no QR), `status` (VALID/USED) e `shareToken` (link público).

Relações: um organizador tem vários eventos · um evento tem várias reservas · uma reserva tem um pagamento e gera N ingressos · um ingresso pertence a um evento e a um cliente.

**10. Chave do TMDb**
themoviedb.org → criar conta → **Settings → API** → solicitar chave para uso pessoal (aprovação imediata) → copie a **API Key (v3 auth)**. Guarde num bloco de notas. Não commite.

**12. Paleta, fontes e espaçamento**
Decida antes de abrir o Figma — é isso que vira "a sua mão no resultado" que o PDF pede:
- **Cores:** uma cor de destaque só + escala de cinzas + três cores para a portaria (verde = válido, vermelho = inválido, âmbar = já utilizado)
- **Fontes:** duas — uma com personalidade para títulos, uma neutra para texto
- **Espaçamento:** múltiplos de 4 (4, 8, 12, 16, 24, 32, 48). Consistência aqui é 80% da sensação de "bem feito"
- **Um detalhe memorável:** escolha **um**. Sugestão: o ingresso com recorte serrilhado de bilhete de verdade

**13 a 16. As 4 telas do Figma**
Média fidelidade, não precisa ser perfeito. **Não desenhe** login, checkout, painel nem criar-evento — essas você monta reaproveitando os componentes.
Para fugir da cara de "gerado por IA": evite o combo padrão de toda ferramenta — roxo + gradiente + cantos muito arredondados + tudo centralizado + card com sombra flutuante. Escolha um tom e seja consistente. Consistência lê como intenção.
**Limite: 2 horas no total.** Bateu 2h, pare onde estiver e siga.

**20. Banco no Neon**
neon.tech → **Sign up** com o GitHub → **New Project** → copie a **connection string** (começa com `postgresql://`).
Já na nuvem no dia 1 porque o mesmo banco serve para desenvolvimento e para o deploy — no dia 6 você não migra nada.

**21. Inicializar o backend**
Na raiz do projeto:
```bash
mkdir backend && cd backend
npm init -y
npm pkg set type=module
```

**22. Dependências**
```bash
npm i express cors dotenv bcryptjs jsonwebtoken zod @prisma/client
npm i -D prisma nodemon
```
**express** servidor · **cors** libera o front · **dotenv** lê o .env · **bcryptjs** criptografa senhas · **jsonwebtoken** cria os tokens de login · **zod** valida entrada · **prisma** conversa com o banco · **nodemon** reinicia sozinho ao salvar.

**23. Prisma**
```bash
npx prisma init
```

**24. `.env` e `.env.example`**
```env
DATABASE_URL="postgresql://...a do Neon..."
JWT_SECRET="uma-string-bem-longa-e-aleatoria"
TMDB_API_KEY="sua-chave"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
APP_PUBLIC_URL="http://localhost:5173"
```
Depois crie o `.env.example` com **as mesmas chaves e valores vazios** — esse vai para o GitHub e é o que o avaliador usa.

> Esta lista tinha também um `TICKET_SECRET`, usado para assinar o código do ingresso. Ele saiu na auditoria de 25/08, junto com o JWT do ingresso: sem assinatura para conferir, não há segredo a guardar. Uma variável a menos para configurar errado no Render.

**25. `schema.prisma`**
Cinco `enum` (Role, EventStatus, ReservationStatus, PaymentStatus, TicketStatus) e cinco `model`. Campos que não podem faltar:
- **User:** id, name, email `@unique`, passwordHash, role, createdAt
- **Event:** id, organizerId, externalId, title, synopsis, imageUrl, eventDate, venue, **capacity**, **soldCount** (default 0), **priceCents**, status, createdAt
- **Reservation:** id, eventId, customerId, quantity, totalCents, status, createdAt
- **Payment:** id, reservationId `@unique`, status, reason, createdAt
- **Ticket:** id, reservationId, eventId, customerId, **code** `@unique` (curto, é o que vai no QR), status, usedAt, validatedById, **shareToken** `@unique`, createdAt

Duas decisões para anotar: preço em **centavos como inteiro** (float erra centavo) e **`soldCount` como coluna** em vez de contar toda vez — é o que permite a trava da tarefa 76.

**26. Migration**
```bash
npx prisma migrate dev --name init
```
Migration é um arquivo que registra a mudança no banco. Dá histórico e permite recriar o banco do zero em outra máquina — inclusive na do avaliador.

**27. Conferir**
```bash
npx prisma studio     # abre em localhost:5555 — 5 tabelas vazias
```

**29. `src/lib/prisma.js`**
Cria **uma única** instância do Prisma Client e exporta. Se cada arquivo criar a sua, você abre conexões demais.

**30. `src/app.js`**
Monta o Express: `express.json()` para ler o corpo das requisições, `cors({ origin: process.env.CORS_ORIGIN })` para o front poder chamar, e aqui vão as rotas conforme você criar.

**31. `src/server.js`**
Só importa o app e chama `app.listen(process.env.PORT)`. Separar de `app.js` facilita escrever testes depois (você importa o app sem subir o servidor).

**32. `GET /health`**
Responde `{ status: "ok" }`. Confirma que está tudo de pé, e o Render usa no deploy.

**33. errorHandler**
Middleware de erro do Express (a função com 4 parâmetros: `err, req, res, next`). Captura qualquer erro e devolve `{ error: "mensagem" }` com o status certo, em vez de vazar o stack trace. Registre por **último** no `app.js`.

**34. Script dev**
```bash
npm pkg set scripts.dev="nodemon src/server.js"
```

**35. Testar**
```bash
npm run dev
# em outro terminal:
curl http://localhost:3000/health     # → {"status":"ok"}
```

**37. Service de login**
`login(email, password)`: busca por e-mail, compara com `bcrypt.compare`, e se bater assina:
```js
jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
```
No token vão só id e papel — o conteúdo de um JWT é legível por qualquer um. O que ninguém consegue é **forjar**, porque a assinatura usa o segredo do servidor.

**38. `POST /auth/login`**
Recebe `{ email, password }`, valida com Zod, chama o service, devolve `{ token, user }`. Senha errada → `401`.

**39. Middleware `auth`**
Lê o header `Authorization: Bearer <token>`, verifica com `jwt.verify`, coloca o resultado em `req.user`. Sem token ou inválido → `401`.

**40. Middleware `requireRole`**
```js
export const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : res.status(403).json({ error: 'Acesso negado' });
```
Diferença que cai em entrevista: **autenticação** é "quem é você"; **autorização** é "você pode fazer isso?".

**41. `GET /auth/me`**
Devolve o usuário logado. O front usa ao recarregar a página para saber quem está logado.

**42. Seed das contas de teste**
Em `prisma/seed.js`, crie as contas de cliente e organizador exigidas pelo PDF, com senha por bcrypt, além do usuário `GATE` de demonstração vinculado ao evento do seed. Em eventos normais, o usuário `GATE` será gerado ao criar o evento.

| Papel | E-mail | Senha |
|---|---|---|
| Organizador | organizador@teste.com | senha123 |
| Cliente 1 | cliente1@teste.com | senha123 |
| Cliente 2 | cliente2@teste.com | senha123 |
Use `upsert` em vez de `create` — assim dá para rodar o seed várias vezes sem erro de e-mail duplicado.

**43. Rodar o seed**
```bash
npm pkg set prisma.seed="node prisma/seed.js"
npx prisma db seed
```
Confira no Prisma Studio que as contas de cliente e organizador apareceram. A credencial da portaria deverá ser conferida na visão do organizador depois que a geração por evento for implementada.

**44. Testar a autenticação**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizador@teste.com","password":"senha123"}'
```
Deve vir um token. Teste também: senha errada → `401` · `/auth/me` sem token → `401`.

**46. Service do TMDb**
`searchMovies(q)` e `getMovie(id)` com o `fetch` nativo do Node. O ponto importante: **normalize** antes de devolver → `{ externalId, title, synopsis, imageUrl, year }`.
O JSON do TMDb é enorme e cheio de campo inútil. Traduzindo para o seu formato, o resto do sistema não fica preso ao formato deles.

**47. Cache**
Um `Map` na memória guardando a busca por 10 minutos. Duas linhas, economiza chamadas.

**48. API fora do ar**
try/catch nas chamadas, devolvendo `502` com mensagem amigável ("catálogo indisponível no momento"). O app não pode quebrar porque o TMDb caiu.

**49. Rotas de catálogo**
`GET /catalog/search?q=` e `GET /catalog/:externalId`, com `auth` + `requireRole('ORGANIZER')`.
A chave do TMDb fica **só no servidor**. Se o front chamasse direto, a chave apareceria no navegador de qualquer visitante. Anote no DECISIONS.md.

**50. `createEvent()` com snapshot**
Recebe `{ externalId, eventDate, venue, capacity, priceCents, status }`, busca o filme no TMDb e **copia** título, sinopse e imagem para o banco.
Isso é um *snapshot*: o evento salvo não depende mais do TMDb. Se a API cair amanhã, a listagem continua completa. Anote no DECISIONS.md.

**51. `POST /events`**
Só organizador. Zod: `capacity >= 1`, `priceCents >= 0`, `eventDate` no futuro.

**52. `GET /events`**
Público, só `status = PUBLISHED`, calculando `available = capacity - soldCount`. O front só exibe; quem calcula é sempre o backend.

**54. `GET /organizer/events`**
Só organizador, os eventos dele com `soldCount`/`capacity`.

**55. Editar e publicar**
`PATCH /events/:id` e `POST /events/:id/publish`. Duas checagens: só o **dono** edita (compare `event.organizerId` com `req.user.sub`, senão `403`), e não permita `capacity` menor que `soldCount` — senão você teria mais ingressos vendidos que lugares.

**56. Evento no seed**
Adicione **1 evento publicado com ingressos disponíveis** (o PDF exige). Use dados fixos de um filme, para o seed não depender do TMDb estar no ar.

**57. Testar as rotas**
Teste tudo no curl ou Postman **antes** de ir para o front. Achar bug aqui é muito mais rápido do que achar depois com a interface no meio.

**59. Criar o frontend**
Na raiz do repositório (fora de `backend`):
```bash
npm create vite@latest frontend -- --template react
cd frontend && npm install
```

**60. Dependências do front**
```bash
npm i react-router-dom qrcode.react
npm i tailwindcss @tailwindcss/vite
```
`react-router-dom` navegação · `qrcode.react` desenha o QR · `tailwindcss` estilo.

**61. Tailwind**
Adicione o plugin no `vite.config.js` e importe o Tailwind no CSS principal. Registre ali suas cores e fontes do Figma, para usar as mesmas em todo lugar.

**62. `.env` do frontend**
```env
VITE_API_URL=http://localhost:3000
```
Nunca escreva a URL da API direto no código — no deploy ela muda.

**63. `api/client.js`**
Uma função que envolve o `fetch`: monta a URL com `VITE_API_URL`, coloca o header `Authorization` se houver token, e se a resposta não for ok joga um erro com a mensagem do backend. Assim todas as telas tratam erro do mesmo jeito.

**64. AuthContext**
Guarda token e usuário no `localStorage` e expõe `login()` e `logout()`. O Context serve para qualquer componente saber quem está logado sem passar prop por 5 níveis.

**65. ProtectedRoute**
Verifica se há usuário logado e se o papel bate; se não, redireciona para o login. É a mesma ideia do `requireRole`, mas aqui só para a experiência — **a segurança de verdade está no backend**, porque qualquer um mexe no navegador.

**66. Rotas no App.jsx**
Registre **todas** agora, mesmo apontando para páginas vazias:
```
/login · / (eventos) · /eventos/:id · /checkout/:reservationId
/meus-ingressos · /ingressos/:id · /i/:shareToken
/organizador · /organizador/novo · /portaria
```
Ter o esqueleto de navegação pronto evita retrabalho.

**67. Componentes base**
Os que você desenhou: `Button`, `Card`, `Badge`, `Input`, `Spinner`, `EmptyState`, `ErrorState`. Os três últimos parecem detalhe bobo, mas são a diferença entre uma tela que "carrega do nada" e uma que parece cuidada — e o PDF cita tratamento de erros como diferencial.

**69. Tela de login**
E-mail, senha, botão. Depois de logar, redirecione conforme o papel: cliente → eventos, organizador → painel, portaria → validação.
**Coloque 3 atalhos de login:** cliente, organizador e o usuario `GATE` de demonstracao associado ao evento do seed. Esse terceiro atalho existe somente para facilitar a avaliacao; em eventos normais, o usuario `GATE` nasce quando o organizador cria o evento.

**70. Lista de eventos**
Grid de cards com pôster, **título, data, local e preço** (os quatro são exigidos pelo PDF) e selo de disponibilidade, mais o campo de busca. Trate os três estados: **loading**, **vazio** ("nenhum evento encontrado") e **erro** (mensagem + "tentar de novo").

**71. Detalhe do evento**
Pôster, sinopse, data, local, preço, lugares disponíveis, seletor de quantidade de 1 a 5 e o total calculado na hora. Botão "Reservar" — que hoje ainda não faz nada, porque a rota nasce amanhã. Esgotado → botão desabilitado com o motivo visível.

**72. Painel do organizador**
Eventos dele com **vendidos/capacidade** e status (rascunho ou publicado), botão "Novo evento" e ações de editar e publicar.

**73. Criar evento**
Em dois passos. Passo 1: busca que chama `/catalog/search` e mostra os filmes em cards com pôster. Passo 2: depois de escolher, o formulário com data, local, capacidade, preço e a opção de já publicar. Trate: buscando · nenhum resultado · catálogo indisponível (o `502`) · erros de validação.

**74. Layout**
Header com nome do usuário, papel e botão sair. Mais uma página 404 simples.

**76. Reserva — a regra mais importante do desafio**
O problema: "leia o `soldCount`, veja se cabe, depois salve" não funciona. Duas pessoas podem ler ao mesmo tempo, as duas verem que cabe, e as duas salvarem. Um `if` em JavaScript não segura isso, porque entre a leitura e a escrita cabe outra requisição.

A solução: a condição vai **dentro do próprio UPDATE**, e o banco decide:
```js
await prisma.$transaction(async (tx) => {
  const event = await tx.event.findUnique({ where: { id: eventId } });
  // ...validações normais (existe? está publicado?)

  const updated = await tx.event.updateMany({
    where: { id: eventId, soldCount: { lte: event.capacity - quantity } },
    data:  { soldCount: { increment: quantity } }
  });

  if (updated.count === 0) throw new ConflictError('Lugares insuficientes');

  return tx.reservation.create({
    data: { eventId, customerId, quantity,
            totalCents: event.priceCents * quantity, status: 'PENDING' }
  });
});
```
O `where` e o `increment` acontecem na **mesma operação do banco**. Se dois pedidos chegarem juntos, um recebe `count === 0` e falha corretamente. A `$transaction` garante que ou tudo acontece, ou nada acontece.

**77. `POST /reservations`**
Só cliente. Zod: `quantity` entre 1 e 5. Lotação estourada → `409` com mensagem clara.

**79. Tratar o 409 na tela**
Mostre "não há lugares suficientes" e atualize a disponibilidade exibida.

**80. Testar concorrência**
Crie um evento com capacidade 1 e dispare dois pedidos ao mesmo tempo:
```bash
curl -X POST http://localhost:3000/reservations -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" -d '{"eventId":"<id>","quantity":1}' &
curl -X POST http://localhost:3000/reservations -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" -d '{"eventId":"<id>","quantity":1}' &
```
Esperado: exatamente **um sucesso e um 409**. Esse teste é ouro para a entrevista.

**82. Service de pagamento**
**Aprovado**, tudo numa transação: cria `Payment(APPROVED)` · reserva vira `PAID` · gera os ingressos.
**Recusado**, também numa transação: cria `Payment(REJECTED)` com motivo · reserva vira `REJECTED` · **devolve a capacidade**:
```js
await tx.event.update({
  where: { id: reservation.eventId },
  data: { soldCount: { decrement: reservation.quantity } }
});
```
Essa devolução é fácil de esquecer e é exatamente o que um avaliador atento vai testar.

**83. Rota de pagamento**
Só o dono da reserva. Só funciona se estiver `PENDING` — se já foi processada, `409`. Aceite um `outcome` opcional no corpo (`"approve"` ou `"reject"`).

**84. Checkout**
Resumo da reserva, formulário de cartão de mentira, e **dois botões explícitos**: "Simular aprovação" e "Simular recusa".
Por que não sorteio aleatório: o PDF exige confirmação **e** recusa. Se for aleatório, o avaliador pode nunca ver a recusa. Anote no DECISIONS.md.

**86. Testar a recusa**
Anote os lugares disponíveis · reserve · recuse · confirme que **nenhum** ingresso foi criado e que a disponibilidade voltou ao valor anotado.

**88. Gerar os ingressos**
Para cada unidade da reserva (`quantity = 2` → dois ingressos), dois códigos:
```js
// Alfabeto sem I, L, O e U: ninguém confunde 1 com I nem 0 com O ao digitar.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const chars = Array.from(randomBytes(8), (byte) => ALPHABET[byte % 32]);
const code = `IFM-${new Date().getFullYear()}-${chars.join('')}`;
const shareToken = randomBytes(24).toString('hex');
```
**Por que o `code` é curto:** ele precisa caber na digitação manual da portaria, que o PDF pede como alternativa à câmera. São 17 caracteres — dá para ditar por telefone.

**Por que ele não pode ser forjado, mesmo sem assinatura:** são 8 caracteres sorteados entre 32, ou 40 bits — cerca de 1 trilhão de combinações, e só as que existem na tabela `Ticket` valem. A portaria vai ao banco de qualquer jeito, porque "já utilizado" e "evento errado" são estado, e estado não cabe dentro do código. Se a consulta é inevitável, conferir uma assinatura antes não acrescenta garantia nenhuma: o que barra a fraude é o código **não existir**. JWT compensaria se o validador estivesse offline — o nosso está online.

**Colisão de código:** não trate. O `@unique` no schema já impede dois ingressos com o mesmo código, e a chance nessa escala é irrelevante. Um retry aqui seria código que nunca roda.

**Por que o `shareToken` é separado:** o link é público, então não pode conter o código de validação nem ser adivinhável.

**90. Rota de compartilhamento**
`POST /tickets/:id/share` devolve `{ shareUrl }` = `APP_PUBLIC_URL` + `/i/` + shareToken.

**91. Rota pública do ingresso**
`GET /public/tickets/:shareToken`, sem login. **Não devolva e-mail nem id do dono, nem o `code`** — só evento, data, local e o status do ingresso. O link é público e circula por WhatsApp: se ele carregasse o código, quem recebesse o link teria junto a credencial de entrada e poderia passar na portaria no lugar do titular. O código fica só na rota autenticada do dono. Token inexistente → `404`.

**92. Meus ingressos**
Lista com evento, data, local e status (válido ou utilizado). Trate loading, vazio ("você ainda não tem ingressos") e erro.

**93. Detalhe do ingresso**
Se a reserva tem mais de um `Ticket`, a tela mostra um card por `Ticket` — nunca um card único com quantidade agregada (ver D21). Cada card tem seu próprio QR grande no centro:
```jsx
import { QRCodeSVG } from 'qrcode.react';
<QRCodeSVG value={ticket.code} size={240} />
```
Abaixo dele, **o código em texto**, em uma linha só e com `tracking` largo (`IFM-2026-5TH7X0KM`) — é o que a portaria digita quando a câmera não funciona. Mais o botão "Copiar link de compartilhamento" e um selo bem visível ("VÁLIDO" ou "UTILIZADO", conforme o status) — tudo isso por `Ticket`, cada um com seu próprio `code`, `shareToken` e `status`. Os cards se organizam em grid responsivo, no mesmo padrão da grade de filmes da tela principal.

**95. Testar o link**
Copie e abra numa janela anônima — deve funcionar sem login. Invente um token na URL → 404.

**97. Validação na portaria**
Árvore de decisão, **nesta ordem exata**:
```
1. Nenhum ingresso com esse code                → INVALID
2. ticket.eventId diferente de req.gateEventId  → WRONG_EVENT
3. ticket.status já é 'USED'                    → ALREADY_USED
4. Caso contrário → marca como usado            → VALID
```
A busca é um `findUnique({ where: { code } })` direto — não existe mais verificação de assinatura antes (ver a auditoria de 25/08).

A ordem importa: só se fala em "evento errado" depois de confirmar que o ingresso é legítimo. A credencial já identifica o evento, então o passo 2 compara com `req.gateEventId`, nunca com algo escolhido em tela.

O passo 4 usa o **mesmo truque da tarefa 76** para impedir dupla validação:
```js
const used = await prisma.ticket.updateMany({
  where: { code, status: 'VALID' },
  data:  { status: 'USED', usedAt: new Date(), validatedById: req.user.sub }
});
return used.count === 1 ? 'VALID' : 'ALREADY_USED';
```
Se duas pessoas escanearem o mesmo ingresso no mesmo instante, só uma recebe `count === 1`.

**98. Rota de validação**
`POST /gate/validate`, autenticada pelo usuário `GATE` do evento. Recebe `{ code }`, identifica o evento pelo usuário autenticado e devolve `{ result, ticket }`.

**99. Sessão da portaria**
Já resolvido no backend: o middleware `auth` reconhece o papel `GATE`, confere a validade da credencial e coloca `req.gateEventId` na requisição. A tarefa aqui é só **não** criar rota nem tela de escolher evento — a portaria valida o evento da credencial e nenhum outro.

**100. Tela da portaria**
Campo de texto para o código, botão validar, e um **painel de resultado grande e colorido**:
- ✅ **VÁLIDO** — verde, com o nome do titular e do evento
- ❌ **INVÁLIDO** — vermelho
- ⚠️ **JÁ UTILIZADO** — âmbar, com data e hora do primeiro uso
- ⚠️ **EVENTO ERRADO** — âmbar, nomeando o evento correto em duas linhas:

```
⚠️  EVENTO ERRADO
    Ingresso de: Cidade de Deus — 04/09 · 17h30
    Cinemark Morumbi, São Paulo/SP
```

O quarto estado **não pode** ser fundido com INVÁLIDO. O PDF lista os quatro retornos separadamente, e na prática são situações diferentes: um é fraude, o outro é a pessoa na sala errada. Sem esse estado, alguém que pagou é barrado com "ingresso inválido".

O placeholder do campo deve mostrar o formato real (`Ex: IFM-2026-5TH7X0KM`). No wireframe ele aparece com 6 caracteres; o código gerado tem 8.

**102. Câmera**
```bash
npm i html5-qrcode
```
Botão "Ativar câmera" que abre o leitor e, ao ler, preenche o campo e valida. **Se a permissão for negada, mostre uma mensagem clara e deixe o campo manual funcionando.**
A câmera vem depois do manual porque exige HTTPS e permissão do navegador — é a parte mais frágil. A digitação manual é sua rede de segurança; o PDF, aliás, a chama de "alternativa".

**103. Testar os 4 estados**
Um ingresso novo · o mesmo de novo · um código inventado · um ingresso de outro evento.

**105. Vitest**
```bash
cd backend && npm i -D vitest && npm pkg set scripts.test="vitest run"
```

**106. Os 4 testes**
Só as regras que importam:
1. Reservar mais do que a capacidade → erro de conflito
2. Pagamento recusado → nenhum ingresso e capacidade devolvida
3. Código inexistente ou com um caractere alterado → INVALID
4. Mesmo ingresso duas vezes → VALID e depois ALREADY_USED

Testes são **opcionais** no PDF. Quatro testes nas regras críticas valem mais que quarenta triviais — mostram que você sabe **onde** vale testar. Apertou o tempo? Pule e mantenha só os roteiros manuais.

**108. README**
```markdown
# Plataforma de Eventos e Ingressos
[link do deploy, quando houver]
> Um parágrafo explicando o sistema (o da tarefa 7).

## Funcionalidades
## Stack e por quê
## Arquitetura (resumo)
## Como executar
   ### Pré-requisitos
   ### 1. Banco de dados
   ### 2. Backend — variáveis de ambiente, migrations, seed
   ### 3. Frontend
## Usuários de teste
## Como testar (roteiros)
## Decisões importantes → link para docs/DECISIONS.md
## Limitações e problemas conhecidos
## Uso de IA → link para docs/AI_USAGE.md
```
**O que NÃO colocar:** tutorial de instalação do Node, explicação do que é React ou JWT, lista de dependências, documentação de cada endpoint, badges decorativos. README bom é o que faz o avaliador rodar o projeto em 5 minutos.

**110. Roteiros de teste manual**
```
TESTE 1 — Fluxo completo
1. Login como organizador → criar evento → publicar
2. Login como cliente 1 → abrir evento → 2 ingressos → reservar
3. Checkout → "Simular aprovação"
4. Meus ingressos → 2 ingressos com QR
5. Copiar o link e abrir em janela anônima
6. Entrar como portaria usando o usuário `GATE` do evento → digitar o código → VÁLIDO

TESTE 2 — Pagamento recusado
1. Anotar os lugares disponíveis
2. Login como cliente 2 → reservar 1 → "Simular recusa"
3. Conferir: nenhum ingresso criado e disponibilidade de volta ao normal

TESTE 3 — Os 4 estados da portaria
a) Código novo → VÁLIDO
b) O mesmo de novo → JÁ UTILIZADO
c) Digitar "abc123" → INVÁLIDO
d) Código de um ingresso de outro evento → EVENTO ERRADO
```

**111. Limitações — seja honesto**
O PDF diz que o que não estiver funcionando **deve** ser mencionado. Escrever "a leitura por câmera só funciona em HTTPS; localmente, use a digitação manual" **soma** ponto. Esconder é o que tira.

**112. AI_USAGE.md**
```markdown
# Uso de IA neste projeto

## Ferramentas
- Claude — planejamento, decisões de arquitetura, revisão de código

## Onde usei
| Parte | O que a IA fez | O que eu decidi/revisei |
|-------|----------------|--------------------------|
| Planejamento | Estruturou o plano | Escolhi pista, TMDb e a stack |

## O que fiz sem IA
- Modelagem do banco e escolha dos campos
- Identidade visual e wireframes
- [complete honestamente]

## O que aprendi
- [2 ou 3 linhas]
```

**115. Backend no Render**
render.com → **New → Web Service** → conecte o repositório.
- Root Directory: `backend`
- Build Command: `npm install && npx prisma generate`
- Start Command: `node src/server.js`
- Environment: `DATABASE_URL`, `JWT_SECRET`, `TMDB_API_KEY`, `CORS_ORIGIN`, `APP_PUBLIC_URL`

Migrations em produção: `npx prisma migrate deploy` — ou aponte para o mesmo banco Neon que você já usa, mais simples ainda.

**116. Frontend na Vercel**
vercel.com → **Import** do repositório → Root Directory: `frontend` → variável `VITE_API_URL` com a URL do Render → Deploy.

O `frontend/vercel.json` precisa estar commitado: ele manda a Vercel devolver o `index.html` em qualquer rota. Sem isso, quem abre um link compartilhado (`/i/<token>`) direto na barra de endereço recebe 404 da própria Vercel, porque esse caminho não é um arquivo — quem o inventa é o React, depois que a página carrega. No Vite local o problema não aparece, e é justamente o link de compartilhamento que sempre chega por acesso direto, nunca por clique a partir da home.

`VITE_API_URL` é lida no build e escrita dentro do bundle: cadastrar a variável depois do deploy não muda nada, tem que buildar de novo.

**117. Ajustar as variáveis**
No Render, coloque em `CORS_ORIGIN` e `APP_PUBLIC_URL` o domínio da Vercel. Sem isso, o front é bloqueado por CORS e os links de compartilhamento apontam para `localhost`.

**118. Seed em produção**
Senão o avaliador abre o link e não tem nem usuário nem evento.

**120. Câmera no celular**
Agora que tem HTTPS, ela deve funcionar de verdade.

**123. O teste mais importante do dia**
Clone seu próprio repositório numa pasta nova e siga o README **ao pé da letra**, sem usar nada já configurado na sua máquina. É exatamente o que o avaliador vai fazer. Toda vez que você travar, é uma linha faltando no README.

**125. Conferir segredos**
```bash
git log -p | grep -i "api_key\|secret\|password"
```
Se sua chave do TMDb aparecer em algum commit antigo, gere uma nova no TMDb (grátis e imediato).

**126. Limpeza**
Remova `console.log` de depuração, código comentado e arquivos não usados. Organização do código é citada como diferencial no PDF.

---

## Git — referência rápida

```bash
git status
git add .
git commit -m "feat: descrição do que passou a funcionar"
git push origin main
```
`feat:` funcionalidade · `fix:` correção · `docs:` documentação · `chore:` configuração · `refactor:` melhoria sem mudar comportamento · `test:` testes.
Direto na `main`, sem branches. De 3 a 6 commits por dia, sempre que algo **passar a funcionar**. Evite `update`, `changes`, `final`, `final2`.