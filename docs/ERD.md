
## User — quem consegue entrar no sistema

Toda pessoa que faz login é um `User`. Guarda nome, e-mail, senha (criptografada, nunca "crua") e um campo `role` que diz o que a pessoa pode fazer: `ORGANIZER` (organiza eventos), `CUSTOMER` (compra ingresso) ou `GATE` (valida ingressos de um evento). O e-mail é único; para ter os papéis de cliente e organizador, a pessoa precisa de duas contas com e-mails diferentes. Usuários `GATE` não são criados pelo cadastro público.

É esse campo que decide o que cada um vê e pode fazer no sistema. Se o `role` for `CUSTOMER`, a pessoa nem consegue acessar a tela de criar evento.

## Credencial de portaria — acesso temporário do evento

A portaria é um `User` com papel `GATE`, criado automaticamente quando o evento é **publicado** — rascunho não tem portaria, porque ainda não há ingresso para validar. Cada evento tem exatamente um usuário `GATE`, com e-mail e senha gerados pelo sistema, compartilhável entre as pessoas responsáveis pela entrada. Quem garante o "exatamente um" é o banco: a coluna `gateEventId` é `@unique`, então nem duas publicações simultâneas conseguem criar duas credenciais.

O organizador abre a credencial pela ação **Credencial** na lista de eventos. Ele vê sempre o **usuário**; a **senha** aparece só no instante em que é gerada ou regenerada, porque na tabela existe apenas o `passwordHash` — não há de onde ler a senha depois. Perdeu, gera outra. A regeneração invalida a senha anterior e também as sessões que já estavam abertas com ela.

O usuário `GATE` funciona antes e durante o evento e expira um dia depois do fim do dia do evento (`gateExpiresAt`). Expirado, ele para de autenticar, mas **não é excluído**: apagar o usuário levaria junto o registro de quem validou cada ingresso (`Ticket.validatedById`), que é justamente o histórico que interessa guardar. Ao autenticar, a portaria só enxerga o evento associado — o evento vem do banco, nunca da requisição.

## Event — o evento em si

Guarda o filme (puxado do TMDb), data, local, e dois números que são a base de uma das regras mais importantes do desafio: `capacity` (o total de lugares) e `soldCount` (quantos já foram vendidos).

Quantos lugares ainda sobram é sempre `capacity - soldCount`. É essa conta que garante que ninguém consiga vender mais ingresso do que existe lugar.

## Reservation — a intenção de compra, antes do pagamento

Quando alguém escolhe a quantidade e clica em reservar, nasce uma `Reservation`. Ainda não é um ingresso — é só a intenção. Tem `quantity` (quantos ingressos) e um `status` que muda ao longo do processo: começa `PENDING`, depois vira `PAID` ou `REJECTED`.

Separei isso do ingresso porque nem toda reserva vira ingresso. Se o pagamento for recusado, a reserva morre ali e os lugares voltam a ficar disponíveis.

## Payment — o resultado do pagamento simulado

Guarda só se aquela reserva foi aprovada ou recusada. Como o pagamento é simulado, não tem nada de dinheiro de verdade aqui — só o registro do resultado. Cada reserva tem um pagamento vinculado a ela.

## Ticket — o ingresso que a pessoa recebe de verdade

Só nasce depois que o pagamento é aprovado. Se a reserva foi de 2 ingressos, nascem 2 `Ticket`, cada um com seu próprio código.

Cada ingresso tem: um `code` (o que vira o QR — precisa ser difícil de forjar), um `status` que começa `VALID` e vira `USED` quando é validado na portaria (é isso que impede usar o mesmo ingresso duas vezes), e um `shareToken` (o código usado só no link de compartilhamento — diferente do `code`, porque um é pra portaria ler e o outro é pra mandar pra alguém).

## Como as tabelas se conectam

User (organizador)
cria → Event
User (cliente)
reserva → Reservation (status PENDING)
paga → Payment (aprovado ou recusado)
gera → Ticket(s) (um por ingresso, cada um com seu QR)

Um evento pode ter várias reservas, de clientes diferentes. Uma reserva gera um ou mais ingressos, dependendo da quantidade. E cada ingresso guarda de qual evento e de qual cliente ele é — é assim que a portaria confere se aquele ingresso é do evento certo.