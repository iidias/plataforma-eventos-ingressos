# plataforma-eventos-ingressos

Projeto feito para o desafio técnico Elite Dev (Verzel).

A ideia é simples: um organizador cria eventos a partir de um catálogo de filmes, define data, local, capacidade e preço. O cliente navega pelos eventos, reserva, paga (de forma simulada) e recebe um ingresso com QR Code, que também pode compartilhar por link. Na entrada, a portaria valida esse ingresso.

Status do projeto
Em construção.

O que já está pronto:

Back-end: banco modelado com Prisma, login com JWT e controle por papel, integração com o catálogo do TMDb e o CRUD de eventos (criar, listar, editar e publicar). Tem seed com usuários de teste e um evento publicado.

Front-end: base do projeto com Vite, Tailwind configurado com as cores e fontes do design, roteamento com React Router, cliente HTTP centralizado, contexto de autenticação e rotas protegidas por papel. As telas prontas são: login (com atalhos que preenchem as credenciais de teste), lista de eventos com busca, detalhe do evento com seletor de quantidade e total, painel do organizador, criação de evento em dois passos (busca no catálogo e depois o formulário), além do layout com header e da página 404.

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

Abra http://localhost:5173. Na tela de login tem três atalhos que preenchem as credenciais do seed e já entram, um para cada papel (cliente, organizador e portaria), então dá para testar tudo sem precisar decorar e-mail e senha.

Para gerar a build de produção do front-end:

```bash
npm run build
```
