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

D12 - Atalhos das contas de cliente e organizador na tela de login.
Os atalhos preenchem as credenciais das contas de teste do seed para facilitar a avaliação. A portaria não terá atalho fixo: sua credencial será gerada por evento.

D13 - Cadastro com opção de organizador.
O cadastro padrão cria `CUSTOMER`. A opção "Sou organizador" cria `ORGANIZER`. Uma pessoa pode ter os dois acessos, mas precisa usar e-mails diferentes, porque cada e-mail identifica uma única conta e um único papel.

D14 - Credencial temporária única por evento para a portaria.
A portaria não será um usuário fixo do seed. Cada evento terá uma única credencial compartilhável, gerada automaticamente e vinculada diretamente ao evento. Ela poderá ser usada antes e durante o evento, expirará ou será excluída depois do fim do dia e permitirá somente validar ingressos daquele evento.

D15 - Regeneração da credencial da portaria.
O organizador verá usuário e senha nas informações do evento e poderá regenerar a senha. A senha anterior será invalidada imediatamente. Como a senha precisa ser exibida ao organizador, essa credencial terá tratamento próprio, diferente da senha de usuário armazenada somente como hash.
