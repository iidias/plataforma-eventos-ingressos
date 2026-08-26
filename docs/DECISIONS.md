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
Escolha de paleta, fontes e formatos de icones com auxílio do Figma (https://www.figma.com/design/ZdscwtZjQOrIys6ignaHsa/ingressoFilm?node-id=0-1&t=xDX7AnN7G3cA6TPm-1). Possivel se visualizar de forma geral olhando o png "Sistema de design" na pasta design.

D8 - Tailwind com utilitários, sem arquivos de CSS separados.
O estilo fica na própria marcação, junto do componente. Assim eu não preciso ficar pulando entre o JSX e um arquivo .css pra entender de onde vem cada regra, e não corro o risco de deixar CSS morto pra trás quando mudo uma tela. As cores e fontes do Figma ficam registradas uma vez só no CSS principal, e o resto do projeto só reaproveita.

D9 - Autenticação no front com Context API e localStorage.
Guardo o token e o usuário num AuthContext e salvo no localStorage pra sessão sobreviver ao reload. O preço disso aparece quando dois papéis são usados ao mesmo tempo: o localStorage é um só por navegador, então entrar como cliente numa aba encerra a sessão da portaria na outra. Descobri isso testando a portaria com o QR aberto em outra aba, e a validação passou a responder "acesso negado". A tela da portaria hoje envia o token do próprio contexto, e não o do localStorage, o que a protege enquanto a aba fica aberta. A cura completa seria separar o armazenamento por papel, e não vale o custo aqui: para percorrer dois papéis ao mesmo tempo, usa-se uma janela anônima. Está registrado nas limitações do README.

D10 - Um cliente HTTP central em api/client.js.
Todas as telas chamam a API pelo mesmo lugar. Ele monta a URL a partir do VITE_API_URL, coloca o header Authorization quando existe token e, se a resposta não vier ok, joga um erro com a mensagem que o próprio back-end mandou. O ganho é que erro é tratado igual em todo lugar e a URL da API não fica espalhada pelo código, no deploy ela muda num arquivo só.

D11 - ProtectedRoute é experiência, não segurança.
As rotas do front conferem se tem usuário logado e se o papel bate (CUSTOMER, ORGANIZER ou GATE); se não bate, redireciona. Isso existe pra pessoa não cair numa tela que ela não pode usar. A autorização de verdade continua no back-end, nos middlewares de auth e de papel, porque qualquer um consegue mexer no navegador.

D12 - Atalhos de teste para cliente, organizador e portaria.
A tela de login manterá três atalhos para facilitar a avaliação. O terceiro usa um usuário `GATE` de demonstração criado no seed e vinculado ao evento de teste. Isso é uma exceção de teste; em eventos normais, o usuário `GATE` é criado automaticamente quando o organizador **publica** o evento (ver D14).

D13 - Cadastro com opção de organizador.
O cadastro padrão cria `CUSTOMER`. A opção "Sou organizador" cria `ORGANIZER`. Uma pessoa pode ter os dois acessos, mas precisa usar e-mails diferentes, porque cada e-mail identifica uma única conta e um único papel.

D14 - Usuário GATE temporário e único por evento, criado na publicação.
A portaria é um `User` com papel `GATE`, sem cadastro público. A credencial nasce quando o evento é **publicado**, não quando é criado: um rascunho não tem ingresso para validar, então gerar credencial ali só produziria lixo para eventos que nunca saem do papel. Quem garante o "um por evento" é o banco, não o código, `gateEventId` é `@unique`, então duas publicações simultâneas não conseguem criar duas credenciais. O usuário funciona antes e durante o evento e expira depois. O seed tem uma exceção de demonstração: um `GATE` fixo vinculado ao evento de teste, que alimenta o terceiro atalho de login.

D15 - A senha do GATE é exibida uma vez; o usuário fica sempre visível.
Havia uma tensão aqui: "o organizador vê a credencial do evento" contra "a senha aparece uma vez só". Os wireframes (`visualizar credencial.png`) resolvem: o **usuário** fica sempre disponível na ação **Credencial** da lista de eventos, e a **senha** só aparece no instante em que é gerada ou regenerada. Não é limitação de tela, é consequência do banco: guardo `passwordHash`, não a senha. Para exibir a senha depois eu teria que guardá-la reversível, que é exatamente o que não se faz. Quem perdeu a senha gera outra — um clique, e a anterior morre na hora.

D16 - Regenerar a senha derruba também as sessões já abertas.
Invalidar só a senha resolvia metade do problema: quem já estava logado na portaria continuaria validando ingressos por até 7 dias com a credencial que o organizador acabou de revogar, inútil justamente no caso que motiva a regeneração (alguém da equipe saiu). O token do `GATE` carrega uma impressão digital derivada do hash da senha, e o middleware compara com a do banco a cada requisição. Senha regenerada, impressão muda, sessão antiga cai com 401. Só o `GATE` paga esse custo: é o único papel cuja credencial é revogável pelo organizador, e é o único que já consultava o banco a cada requisição por causa da validade.

A edição de evento cobre só capacidade e preço

São os dois campos que o organizador precisa mexer depois que o evento está no ar: abrir mais lugares ou corrigir o preço. Data, local e filme ficam de fora de propósito, quem já comprou escolheu com base neles, e mudar depois faria o ingresso valer para um evento diferente do que foi vendido.
A capacidade tem uma trava: não pode ficar abaixo dos ingressos já vendidos, senão existiriam mais ingressos que lugares. A regra mora no backend, no `updateEvent`; o modal repete a mesma checagem só para o erro aparecer no campo sem ida ao servidor. Se as duas discordarem, quem vale é a do banco.
O que descartei: edição livre de todos os campos, que é o que o `PATCH /events/:id` aceitaria. A rota continua aceitando data e local, mas a tela não oferece.
Esta decisão substitui a versão anterior, que dizia que a edição ficaria sem tela nesta entrega. A tela entrou depois, com escopo reduzido 

D18 - A disponibilidade é verificada dentro do UPDATE, não em JavaScript.
Esta é a regra mais difícil do desafio: o mesmo lugar não pode ser vendido duas vezes. "Ler o soldCount, ver se cabe, depois gravar" não resolve, porque entre a leitura e a escrita cabe outra requisição — as duas passam pelo `if` antes de qualquer uma gravar. Então a condição não fica no meu código: ela vai para dentro do `WHERE` do próprio `UPDATE` (`soldCount <= capacity - quantity`), e quem decide é o Postgres. O `updateMany` devolve quantas linhas casaram; se duas requisições chegam juntas, uma recebe `count === 0` e vira 409. Tudo dentro de `$transaction`, então uma falha ao criar a reserva desfaz o incremento junto — nunca sobra lugar vendido sem reserva. Prendo também `capacity` e `status` no mesmo `WHERE`: o Prisma não compara duas colunas, então o limite precisa usar o `capacity` que foi lido, e travá-lo garante que ele ainda vale na hora da escrita.

D19 - Checkout com dois botões explícitos, sem sorteio aleatório.
O D4 já dizia "dois botões"; aqui fica registrado o porquê, agora que a tela existe. O PDF exige que o pagamento contemple a confirmação **e** a recusa. Checkout tem "Simular aprovação" e "Simular recusa" lado a lado, e a rota aceita um `outcome` explícito (`approve` ou `reject`). O resultado é determinístico: quem testa escolhe qual caminho quer ver. O `outcome` é opcional e cai em `approve` quando ausente, para a rota continuar utilizável sem corpo.

D20 - O caminho recusado devolve a capacidade; o aprovado não.
A reserva já incrementa `soldCount` no instante em que nasce (D18), então o pagamento não precisa reservar nada de novo, precisa decidir se aquele lugar continua vendido. Aprovado: `soldCount` fica como está e nascem os ingressos. Recusado: `decrement` devolve os lugares para a venda. Os dois caminhos rodam dentro de uma `$transaction`, e a troca de status usa `updateMany` com `status: 'PENDING'` no where, dois cliques simultâneos em "Simular recusa" devolveriam a capacidade duas vezes se o guard fosse um `if`.

D21 - Um QR por Ticket, não por Reservation.
A portaria valida pessoa por pessoa, não a compra inteira: se a reserva foi de 2 ingressos, são 2 entradas, cada uma com seu próprio QR. Isso já estava implícito no modelo, cada `Ticket` tem `code` e `shareToken` próprios (ver ERD.md), mas a primeira versão da tela "Meus Ingressos → Válido" mostrava um card único com um QR e um campo "quantidade", o que não faz sentido: com um QR só, a portaria não sabe quantas das pessoas do grupo já entraram, e compartilhar o link vazaria o acesso de todo mundo, não só de quem recebeu. A tela foi refeita como um grid com um card por `Ticket`, cada um com seu QR, código, selo de status e link de compartilhamento próprios, no mesmo padrão de grid responsivo já usado na grade de filmes da tela principal.

D22 - Código de ingresso curto, no lugar do JWT assinado
A portaria consulta o banco de qualquer forma ("já utilizado" e "evento errado" são estados), sendo a consulta inevitável, a assinatura não acrescenta garantia, o que barra a fraude é o código não exitir na tabela.
Como fica seguro: 8 caracteres sorteados entre 32 = 40 bits, validados no servidor.
O que descartei: manter o JWT com um id curto ao lado, dois códigos para a mesma coisa.

D23 - A portaria tem 4 estados, e "evento errado" não se funde com "inválido"
O desafio enumera os quatro. E são situações diferentes na porta: inválido é fraude, evento errado é gente que pagou e está na sala errada. 
O que o painel mostra no evento errado: título, horário e cinema do evento correto, dados já públicos em GET /events, mas nunca o nome do comprador, que só aparece no painel verde.

D24 - Snapshot do TMDb no evento
`createEvent` copia título, sinopse e imagem para o banco (`eventService.js`). O evento salvo deixa de depender da API externa: se o TMDb cair amanhã, a listagem continua completa.
O que descartei: guardar só o externalId e buscar no TMDb a cada exibição.

D25 - A chave do TMDb só existe no servidor
Por quê: se o front chamasse o TMDb direto, a chave apareceria no navegador de qualquer visitante. Por isso as rotas /catalog são do backend e ainda exigem papel de organizador.

D26 - Preço em centavos, como inteiro
Float erra centavo. O backend guarda priceCents e a formatação em reais é só apresentação.

D27 - A reserva pendente expira em 2 minutos e devolve os lugares
A D18 incrementa o soldCount no instante em que a reserva nasce, e é isso que impede a venda dupla. Faltava a contrapartida: quem abandonava o checkout segurava o ingresso para sempre. Descobri testando o site publicado no celular: entrei na tela de pagamento, saí sem aprovar nem recusar, e a disponibilidade do evento tinha caído e não voltava. Reserva PENDING parada há mais de 2 minutos vira EXPIRED e os lugares voltam para a venda.
Por que 2 minutos: é curto de propósito, para quem estiver avaliando conseguir ver a expiração acontecer sem esperar. Num sistema de verdade seriam 10 ou 15, que é o que ingresso.com e Eventim dão.
O que descartei: liberar quando o cliente sai da tela. Fechar a aba, perder conexão ou o celular matar o app em segundo plano nunca dispararia a liberação, e é justamente aí que o abandono acontece.