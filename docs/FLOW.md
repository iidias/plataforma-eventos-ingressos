### Contas

1. Usuário cria uma conta padrão e entra como cliente (`CUSTOMER`), ou marca **Sou organizador** e entra como organizador (`ORGANIZER`).
2. Para ter os dois acessos, cria duas contas com e-mails diferentes.

### Evento e ingresso

3. Organizador cria evento (filme do TMDb + data, local, capacidade, preço), como rascunho ou já publicado.
4. Ao **publicar** o evento, o sistema gera automaticamente um único usuário `GATE`, com e-mail e senha aleatórios, vinculado exclusivamente a ele. A senha é exibida ao organizador nesse momento.
5. Cliente encontra o evento, reserva a quantidade e paga (aprovado ou recusado).
6. Sistema gera o ingresso (código assinado → QR Code); o ingresso permanece vinculado ao cliente.
7. Cliente vê e compartilha o ingresso.
8. Antes ou no dia do evento, a portaria entra com o usuário `GATE` do evento e valida o ingresso associado (válido / inválido / já utilizado).
9. Um dia depois do fim do dia do evento, o usuário `GATE` expira e para de autenticar. O registro permanece no banco, para o histórico de validações não se perder.

A portaria não escolhe o evento: o evento é identificado pelo usuário `GATE` usado no login. As credenciais podem ser compartilhadas por duas ou mais pessoas. O organizador abre a credencial pela ação **Credencial** na lista de eventos: o usuário fica sempre visível, a senha só aparece quando é gerada ou regenerada. Ao regenerar, a senha anterior deixa de funcionar imediatamente e as sessões abertas com ela também caem.