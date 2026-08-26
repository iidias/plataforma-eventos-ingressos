# Plataforma de Eventos e Ingressos

Projeto feito para o desafio técnico Elite Dev (Verzel).

Deploy: ainda não publicado.

> Um organizador cria eventos a partir de um catálogo de filmes, define data, local, capacidade e preço. O cliente navega pelos eventos, reserva, paga (de forma simulada) e recebe um ingresso com QR Code, que também pode compartilhar por link. Na entrada, a portaria valida esse ingresso.

## Funcionalidades

**Cliente**
- Lista de filmes em cartaz com busca por título ou local, mostrando data, local, preço e disponibilidade
- Detalhe do evento com seletor de quantidade e total calculado na hora
- Reserva com garantia de que o mesmo lugar não é vendido duas vezes
- Checkout simulado com dois botões explícitos: "Simular aprovação" e "Simular recusa"
- "Meus ingressos", com um QR e um código próprios por ingresso
- Link público de compartilhamento, que abre o ingresso sem login e sem expor quem comprou

**Organizador**
- Cadastro com a opção "Sou organizador"
- Criação de evento em dois passos: busca no catálogo do TMDb e depois o formulário
- Painel com vendidos/capacidade e status de cada evento
- Publicação do evento, que gera automaticamente a credencial da portaria
- Ação "Credencial" para consultar o usuário da portaria e regenerar a senha

**Portaria**
- Tela própria, com leitura do QR pela câmera e digitação do código como alternativa
- Quatro retornos distintos: válido, inválido, já utilizado e evento errado
- Histórico das validações da sessão
- Acesso limitado a um único evento e com validade que expira depois dele

## Stack e por quê

| Camada | Escolha |
|---|---|
| Front-end | React + Vite |
| Back-end | Node.js + Express |
| Banco de dados | PostgreSQL (Neon) |
| ORM | Prisma |
| Estilo | Tailwind CSS |
| Testes | Vitest |
| Catálogo externo | TMDb |

Escolhi essa combinação porque front e back ficam na mesma linguagem (JavaScript), o que facilita bastante já que estou construindo o projeto sozinho em pouco tempo. O raciocínio de cada escolha está em [docs/DECISIONS.md](docs/DECISIONS.md).

## Arquitetura (resumo)

O back-end separa rotas, services e middlewares. As rotas validam a entrada com Zod e não contêm regra de negócio; os services concentram as regras e são o que os testes exercitam; os middlewares cuidam de autenticação (`auth`) e de papel (`requireRole`).

São três papéis, todos na tabela `User`: `CUSTOMER`, `ORGANIZER` e `GATE`. A portaria não virou tabela própria, é um usuário com `role = GATE`, amarrado a um evento por `gateEventId` (`@unique`, o que garante uma credencial por evento) e com prazo em `gateExpiresAt`.

Duas regras dependem do banco, não do JavaScript: a disponibilidade de lugares e a marcação de ingresso usado. As duas colocam a condição dentro do `WHERE` do próprio `UPDATE`, porque um `if` no código não segura duas requisições simultâneas.

Os dados do filme são copiados do TMDb para o evento no momento da criação. Depois disso o evento não depende mais da API externa.

O front-end usa React Router, um cliente HTTP central em `src/api/client.js` e um `AuthContext` que guarda token e usuário no `localStorage`. As rotas protegidas por papel são conveniência de navegação; a autorização de verdade está no back-end.

## Como executar

### Pré-requisitos

Node.js 18 ou superior. São dois terminais: um para o back-end e outro para o front-end.

### 1. Banco de dados

Duas opções. O projeto roda igual nas duas: muda só a `DATABASE_URL` e se você precisa criar o banco na mão. A **opção A (Neon)** é a usada no desenvolvimento.

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

### 2. Back-end (sobe em http://localhost:3000)

```bash
cd backend
npm install
```

Copie o `.env.example` para `.env` e preencha:

| Variável | O que é |
|---|---|
| `DATABASE_URL` | a do passo 1 |
| `JWT_SECRET` | string aleatória, gere com o comando abaixo |
| `TMDB_API_KEY` | chave gratuita do TMDb |
| `PORT` | 3000 |
| `CORS_ORIGIN` | endereço do front-end |
| `APP_PUBLIC_URL` | endereço do front-end |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

A `TMDB_API_KEY` sai de https://www.themoviedb.org/settings/api (crie uma conta e peça uma chave de desenvolvedor).

`CORS_ORIGIN` e `APP_PUBLIC_URL` já vêm apontando para `http://localhost:5173` e só mudam no deploy. As duas guardam o endereço do **front-end**: a primeira diz quem pode chamar a API, e a segunda é a base dos links de compartilhamento de ingresso, que precisam abrir uma tela, não um JSON.

Crie as tabelas e popule com os dados de teste:

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

### 3. Front-end (sobe em http://localhost:5173)

```bash
cd frontend
npm install
```

Copie o `.env.example` para `.env` - ele já vem com `VITE_API_URL=http://localhost:3000`, que é o endereço do back-end. Depois:

```bash
npm run dev
```

Abra http://localhost:5173. Para gerar a build de produção, `npm run build`.

## Usuários de teste

Todos criados pelo `npx prisma db seed`. A tela de login tem três atalhos que preenchem essas credenciais.

| Papel | E-mail | Senha |
|---|---|---|
| Organizador | organizador@teste.com | senha123 |
| Cliente 1 | cliente1@teste.com | senha123 |
| Cliente 2 | cliente2@teste.com | senha123 |
| Portaria do evento "A Origem" | portaria@teste.com | senha123 |

O seed também cria o evento publicado **A Origem**, com ingressos disponíveis.

A credencial de portaria fixa é uma exceção de demonstração. Em eventos normais ela nasce com e-mail e senha aleatórios no momento em que o organizador publica o evento, e a senha é exibida uma única vez.

## Como testar (roteiros)

**TESTE 1 - Fluxo completo**

1. Entre como organizador, clique em "Novo evento", busque um filme, preencha data, local, capacidade e preço, e publique. **Anote o usuário e a senha da portaria que aparecem ao publicar**, a senha só é mostrada nesse momento.
2. Saia e entre como cliente 1. Abra o evento recém-criado, escolha 2 ingressos e reserve.
3. No checkout, clique em "Simular aprovação".
4. Vá em "Meus ingressos": devem aparecer 2 ingressos, cada um com seu QR e seu código.
5. Copie o link de um deles e abra numa janela anônima. O ingresso aparece sem pedir login.
6. Saia e entre com a credencial de portaria anotada no passo 1. Digite o código de um dos ingressos: **VÁLIDO**.

**TESTE 2 - Pagamento recusado**

1. Anote os lugares disponíveis do evento na tela de detalhe.
2. Entre como cliente 2, reserve 1 ingresso e clique em "Simular recusa".
3. Confira: nenhum ingresso foi criado em "Meus ingressos" e a disponibilidade voltou ao valor anotado.

**TESTE 3 - Os quatro estados da portaria**

Entre com `portaria@teste.com`, que é a credencial do evento **A Origem** do seed. Antes, compre um ingresso de A Origem como cliente para ter um código válido em mãos.

| Passo | Resultado esperado |
|---|---|
| Código novo de A Origem | VÁLIDO |
| O mesmo código de novo | JÁ UTILIZADO |
| Digitar `abc123` | INVÁLIDO |
| Código de um ingresso de outro evento | EVENTO ERRADO |

Para o último caso, use um dos ingressos gerados no TESTE 1, que são de outro evento.

## Testes automatizados

```bash
cd backend
npm test
```

Quatro testes de integração cobrindo as regras que, se quebrarem, quebram o produto: reservar além da capacidade, pagamento recusado devolvendo a capacidade sem gerar ingresso, código inexistente recusado na portaria e o mesmo ingresso não sendo validado duas vezes.

São testes de integração de propósito. As duas primeiras regras acontecem dentro do `UPDATE` do Postgres, então com o banco dublado eu estaria testando o dublê, não a regra.

## Decisões importantes

Estão em [docs/DECISIONS.md](docs/DECISIONS.md), no formato decisão / por quê / o que descartei. O fluxo do sistema está em [docs/FLOW.md](docs/FLOW.md) e o modelo de dados em [docs/ERD.md](docs/ERD.md).

## Limitações e problemas conhecidos

- **A leitura do QR pela câmera exige contexto seguro.** Funciona em `localhost` e em HTTPS. Em rede local por IP (`http://192.168...`) o navegador bloqueia a câmera. A digitação do código cobre o requisito em qualquer cenário.
- **Os três papéis dividem o mesmo `localStorage`.** Entrar com um papel encerra a sessão do outro na mesma janela do navegador. Para percorrer dois papéis ao mesmo tempo, use uma janela anônima para o segundo. A tela da portaria foi endurecida contra isso enquanto a aba fica aberta, mas um F5 depois de trocar de conta cai na mesma limitação.
- **A edição de evento não tem tela.** `PATCH /events/:id` existe, valida dono e impede capacidade menor que o já vendido, mas o botão "Editar" no painel está desabilitado de propósito.
- **Os testes automatizados usam o mesmo banco do desenvolvimento.** Eles criam e apagam os próprios registros e não tocam no seed, mas o correto seria um banco separado só para testes.
- **Não há cancelamento de ingresso nem devolução ao estoque depois do pagamento aprovado.** A capacidade só volta no caminho da recusa.
- **O deploy não foi publicado.** As instruções locais acima são o caminho para avaliar o projeto.

## Uso de IA

Está em [docs/AI_USAGE.md](docs/AI_USAGE.md): quais ferramentas usei, em que partes, e o que fiz sem elas.