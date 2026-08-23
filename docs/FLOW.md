### Contas

1. Usuário cria uma conta padrão e entra como cliente (`CUSTOMER`), ou marca **Sou organizador** e entra como organizador (`ORGANIZER`).
2. Para ter os dois acessos, cria duas contas com e-mails diferentes.

### Evento e ingresso

3. Organizador cria evento (filme do TMDb + data, local, capacidade, preço).
4. Ao criar o evento, o sistema gera uma única credencial temporária de portaria vinculada a ele.
5. Cliente encontra o evento, reserva a quantidade e paga (aprovado ou recusado).
6. Sistema gera o ingresso (código assinado → QR Code); o ingresso permanece vinculado ao cliente.
7. Cliente vê e compartilha o ingresso.
8. Antes ou no dia do evento, a portaria entra com a credencial do evento e valida o ingresso associado (válido / inválido / já utilizado).
9. Depois do fim do dia do evento, a credencial expira ou é excluída.

A portaria não escolhe o evento: o evento é identificado pela credencial usada no login. A credencial pode ser compartilhada por duas ou mais pessoas. Ao regenerar a senha, a senha anterior deixa de funcionar.