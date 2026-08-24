D1 - Pista por quantidade, não mapa de assentos.
O PDF deixa escolher um. A pista é mais simples de fazer e cobre a mesma regra importante (não vender além da capacidade).

D2 - TMDb, não Ticketmaster.
É mais fácil de usar e sempre traz resultado com imagem. O Ticketmaster tem pouca coisa no Brasil.

D3 - React, Node, Postgres e Prisma.
Mesma linguagem no front e no back. Evita troca de contexto.

D4 - Pagamento com dois botões: aprovar e recusar.
Assim dá pra testar os dois casos na hora.

D5 - JavaScript, não TypeScript.
Visto que o TS, exige mais tempo de configuração e aprendizado o que não seria compatível com o tempo disponível.

D6 - Nome do Projeto.
Como irei utilizar a api da TMDB, na qual o foco é filme, optei por escolher o nome para IngressoFilm

D7 - DESIGN.
Escolha de paleta, fontes e formatos de icones. possivel se visualizar de forma geral olhando o png "Sistema de design" na pasta design.

D8 - Tailwind com utilitários, sem arquivos de CSS separados.
O estilo fica na própria marcação, junto do componente. Assim eu não preciso ficar pulando entre o JSX e um arquivo .css pra entender de onde vem cada regra, e não corro o risco de deixar CSS morto pra trás quando mudo uma tela. As cores e fontes do Figma ficam registradas uma vez só no CSS principal, e o resto do projeto só reaproveita.

D9 - Autenticação no front com Context API e localStorage.
Guardo o token e o usuário num AuthContext e salvo no localStorage pra sessão sobreviver ao reload. 

D10 - Um cliente HTTP central em api/client.js.
Todas as telas chamam a API pelo mesmo lugar. Ele monta a URL a partir do VITE_API_URL, coloca o header Authorization quando existe token e, se a resposta não vier ok, joga um erro com a mensagem que o próprio back-end mandou. O ganho é que erro é tratado igual em todo lugar e a URL da API não fica espalhada pelo código, no deploy ela muda num arquivo só.

D11 - ProtectedRoute é experiência, não segurança.
As rotas do front conferem se tem usuário logado e se o papel bate (CUSTOMER, ORGANIZER ou GATE); se não bate, redireciona. Isso existe pra pessoa não cair numa tela que ela não pode usar. A autorização de verdade continua no back-end, nos middlewares de auth e de papel, porque qualquer um consegue mexer no navegador.

D12 - Atalhos de teste para cliente, organizador e portaria.
A tela de login manterá três atalhos para facilitar a avaliação. O terceiro usa um usuário `GATE` de demonstração criado no seed e vinculado ao evento de teste. Isso é uma exceção de teste; em eventos normais, o usuário `GATE` é criado automaticamente quando o organizador cria o evento.

D13 - Cadastro com opção de organizador.
O cadastro padrão cria `CUSTOMER`. A opção "Sou organizador" cria `ORGANIZER`. Uma pessoa pode ter os dois acessos, mas precisa usar e-mails diferentes, porque cada e-mail identifica uma única conta e um único papel.

D14 - Usuário GATE temporário e único por evento, criado na publicação.
A portaria é um `User` com papel `GATE`, sem cadastro público. A credencial nasce quando o evento é **publicado**, não quando é criado: um rascunho não tem ingresso para validar, então gerar credencial ali só produziria lixo para eventos que nunca saem do papel. Quem garante o "um por evento" é o banco, não o código — `gateEventId` é `@unique`, então duas publicações simultâneas não conseguem criar duas credenciais. O usuário funciona antes e durante o evento e expira depois. O seed tem uma exceção de demonstração: um `GATE` fixo vinculado ao evento de teste, que alimenta o terceiro atalho de login.

D15 - A senha do GATE é exibida uma vez; o usuário fica sempre visível.
Havia uma tensão aqui: "o organizador vê a credencial do evento" contra "a senha aparece uma vez só". Os wireframes (`visualizar credencial.png`) resolvem: o **usuário** fica sempre disponível na ação **Credencial** da lista de eventos, e a **senha** só aparece no instante em que é gerada ou regenerada. Não é limitação de tela, é consequência do banco: guardo `passwordHash`, não a senha. Para exibir a senha depois eu teria que guardá-la reversível, que é exatamente o que não se faz. Quem perdeu a senha gera outra — um clique, e a anterior morre na hora.

D16 - Regenerar a senha derruba também as sessões já abertas.
Invalidar só a senha resolvia metade do problema: quem já estava logado na portaria continuaria validando ingressos por até 7 dias com a credencial que o organizador acabou de revogar — inútil justamente no caso que motiva a regeneração (alguém da equipe saiu). O token do `GATE` carrega uma impressão digital derivada do hash da senha, e o middleware compara com a do banco a cada requisição. Senha regenerada, impressão muda, sessão antiga cai com 401. Só o `GATE` paga esse custo: é o único papel cuja credencial é revogável pelo organizador, e é o único que já consultava o banco a cada requisição por causa da validade.

D17 - Edição de evento fica sem tela nesta entrega.
`PATCH /events/:id` existe, valida dono e impede capacidade menor que o já vendido. Mas não desenhei tela de edição e ela não faz parte do escopo desta etapa, então o botão "Editar" fica desabilitado em vez de abrir uma tela improvisada. Prefiro um botão honestamente desligado a uma tela meia-boca — e o próprio plano lista "editar evento" como o primeiro corte aceitável depois de testes e deploy.
