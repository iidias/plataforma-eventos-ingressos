# plataforma-eventos-ingressos

Projeto feito para o desafio técnico Elite Dev (Verzel).

A ideia é simples: um organizador cria eventos a partir de um catálogo de filmes, define data, local, capacidade e preço. O cliente navega pelos eventos, reserva, paga (de forma simulada) e recebe um ingresso com QR Code, que também pode compartilhar por link. Na entrada, a portaria valida esse ingresso.

## Status do projeto

Em construção.

### O que já está pronto

Back-end: banco modelado com Prisma, login com JWT e controle por papel, integração com o catálogo do TMDb e o CRUD de eventos (criar, listar, editar e publicar). Tem seed com usuários de teste e um evento publicado.

Front-end: base do projeto com Vite, Tailwind configurado com as cores e fontes do design, roteamento com React Router, cliente HTTP centralizado, contexto de autenticação e rotas protegidas por papel. As telas prontas são: login (com atalhos que preenchem as credenciais de teste), cadastro com a opção "Sou organizador", lista de eventos com busca, detalhe do evento com seletor de quantidade e total, painel do organizador com a credencial da portaria, criação de evento em dois passos (busca no catálogo e depois o formulário), além do layout com header e da página 404.

A edição de evento existe na API (`PATCH /events/:id`), mas ainda não tem tela, o botão "Editar" no painel aparece desabilitado de propósito.

O cadastro padrão cria uma conta de cliente, com a opção de marcar "Sou organizador" para criar uma conta de organizador, o papel é decidido no servidor a partir dessa opção, nunca por um campo enviado pelo navegador. A mesma pessoa pode ter os dois acessos usando e-mails diferentes. Cada evento publicado tem um único usuário `GATE`, criado automaticamente com e-mail e senha gerados pelo sistema e vinculado somente àquele evento. O organizador abre a credencial pela ação "Credencial" na lista de eventos: o usuário fica sempre visível e a senha aparece só no momento em que é gerada ou regenerada, porque o banco guarda apenas o hash. Regenerar invalida na hora a senha anterior e as sessões abertas com ela. O acesso funciona antes e durante o evento e expira um dia depois do fim do dia do evento, o usuário não é apagado, para o histórico de validações continuar existindo.

A reserva e o pagamento simulado já funcionam de ponta a ponta: o cliente escolhe a quantidade no detalhe do evento e a vaga é garantida no banco, dentro de uma transação, de forma que duas pessoas nunca levem o mesmo lugar. No checkout há dois botões explícitos, "Simular aprovação" e "Simular recusa", em vez de sorteio, para o avaliador conseguir percorrer os dois caminhos de propósito. Aprovado, a reserva vira paga e os ingressos são gerados com um código curto e sorteado. Recusado, a reserva é cancelada, nenhum ingresso nasce e os lugares voltam para a venda.

As telas de ingresso também estão prontas: "Meus ingressos", o detalhe com um QR por ingresso e a tela pública do link compartilhado. E a portaria valida na entrada, por câmera ou digitação do código, com os quatro retornos que o desafio pede: válido, inválido, já utilizado e evento errado.

### O que ainda falta

Testes automatizados, as seções de roteiro de teste e limitações conhecidas deste README, o `docs/AI_USAGE.md` e o deploy.

## Stack que vou usar

Front-end: React + Vite
Back-end: Node.js + Express
Banco de dados: PostgreSQL
ORM: Prisma
Estilo: Tailwind CSS

Escolhi essa combinação porque front e back ficam na mesma linguagem (JavaScript), o que facilita bastante já que estou construindo o projeto sozinho em pouco tempo.

## Decisões do projeto

Estou registrando as decisões técnicas e o porquê de cada uma em docs/DECISIONS.md, conforme vou avançando. Começou com as decisões de produto e de stack (pista de ingressos ao invés de mapa de assentos, uso do TMDb, JavaScript ao invés de TypeScript, como o pagamento simulado vai funcionar) e agora também tem as decisões do front-end (estilização, autenticação, comunicação com a API e proteção de rotas).

## Uso de IA

Estou usando IA (Claude) para me ajudar a planejar e organizar o projeto, já que é a primeira vez que faço um desafio desse tipo. Vou detalhar isso melhor em docs/AI_USAGE.md conforme o projeto avança.

## Como rodar o projeto

Precisa de Node.js (18 ou superior). São dois terminais: um para o back-end e outro para o front-end.

O banco tem duas opções. O projeto roda igual nas duas, o que muda é só a `DATABASE_URL` e se você precisa criar o banco na mão. A **opção A (Neon)** é a que usamos no desenvolvimento e a mesma que o deploy usa.

### Back-end (sobe em http://localhost:3000)

```bash
cd backend
npm install
```

Copie o `.env.example` para `.env` e preencha conforme a opção escolhida.

**Opção A - Neon (PostgreSQL na nuvem, sem instalar nada)**

Crie uma conta gratuita em https://neon.tech, clique em **New Project** e copie a **connection string** que aparece. Ela já vem com o banco `neondb` criado e tem este formato:

```
DATABASE_URL="postgresql://USUARIO:SENHA@ep-xxxx-pooler.REGIAO.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

Cole exatamente como o Neon entregou, **sem tirar o `?sslmode=require&channel_binding=require`** - sem isso a conexão é recusada.

**Opção B - PostgreSQL local**

Baixe em https://www.postgresql.org/download e anote a senha que definir para o usuário `postgres` durante a instalação. Depois crie o banco:

```bash
psql -U postgres -c "CREATE DATABASE eventos;"
```

Se o `psql` não for reconhecido no Windows, use o caminho completo `"C:\Program Files\PostgreSQL\17\bin\psql.exe"` no lugar de `psql`. A `DATABASE_URL` fica assim (troque `SUA_SENHA`):

```
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/eventos"
```

**As demais variáveis (valem para as duas opções)**

Para `JWT_SECRET`, gere uma string aleatória:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

A `TMDB_API_KEY` é gratuita e sai de https://www.themoviedb.org/settings/api (crie uma conta e peça uma chave de desenvolvedor).

`CORS_ORIGIN` e `APP_PUBLIC_URL` já vêm apontando para `http://localhost:5173` e só mudam no deploy. As duas guardam o endereço do **front-end**: a primeira diz quem pode chamar a API, e a segunda é a base dos links de compartilhamento de ingresso, que precisam abrir uma tela, não um JSON.

**Criar as tabelas e popular com dados de teste**

```bash
npx prisma migrate dev
npx prisma db seed
```

O seed pode ser rodado quantas vezes quiser: ele usa `upsert` e não apaga nada que já exista.

E então:

```bash
npm run dev
```

Se você escolheu o Neon, a primeira requisição depois de um tempo parado pode demorar de 15 a 30 segundos: o plano gratuito suspende o banco quando ele fica ocioso, e ele precisa acordar. Não é erro - da segunda em diante responde normal.

### Front-end (sobe em http://localhost:5173)

```bash
cd frontend
npm install
```

Copie o `.env.example` para `.env` - ele já vem com `VITE_API_URL=http://localhost:3000`, que é o endereço do back-end. Depois:

```bash
npm run dev
```

Abra http://localhost:5173. Durante a fase de teste, a tela de login terá três atalhos: cliente, organizador e um usuário `GATE` de demonstração vinculado ao evento do seed. Em eventos normais, o usuário `GATE` será criado automaticamente quando o evento for publicado.

Para gerar a build de produção do front-end:

```bash
npm run build
```