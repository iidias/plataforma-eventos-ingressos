# Uso de IA neste projeto

## Ferramentas

- **Claude (Claude Code)** — planejamento, discussão de decisões de arquitetura, auxílio em parte do back-end e do front-end, testes automatizados e revisão dos documentos.
- **Figma Make** — ajuda na criação dos protótipos das telas, que serviram como base para o front-end.

## Onde usei

| Parte | O que a IA fez | O que eu decidi ou revisei |
|---|---|---|
| Planejamento | Transformou o PDF do desafio nas minhas decisões em um plano, com a lista de tarefas e um "como fazer" para cada uma | Escolhi pista por quantidade em vez de mapa de assentos, TMDb em vez de Ticketmaster, a stack e as regras de negócio antes do plano existir |
| Identidade visual e telas | O Figma Make gerou os protótipos a partir da direção que defini | Escolhi paleta, fontes, o nome do produto e como cada tela deveria se comportar; os protótipos são a referência que o código segue |
| Front-end | O protótipo das telas pelo Figma também gera um código, que ajudou muito na implementação da parte visual | Usei como base o que tinha no código do Figma e adaptei o necessário pensando no contexto do desafio |
| Back-end | Ajuda na implementação da validação da portaria e a troca do código do ingresso | Notei o código QR longo demais, pensei na solução, implementei com auxílio do Claude e revisei o resultado |
| Testes automatizados | Escreveu boa parte dos quatro testes e explicou o raciocínio por trás de cada um | É a parte em que mais dependi da IA: estou começando a estudar testes agora, e vou ver o assunto no sexto período (meu período atual), em Engenharia de Software II |
| Documentação | Auditou README, plano e decisões contra o código, apontando o que tinha ficado desatualizado | Escrevi as decisões e revisei todo o texto |

## O que fiz sem IA

- Modelagem do banco e escolha dos campos
- Identidade visual: paleta, tipografia e o nome do produto
- As regras de negócio: como funciona a credencial de portaria, o que aparece em cada tela, o que fica de fora do escopo
- Os testes manuais durante o desenvolvimento, que foi como encontrei dois defeitos: a validade de cartão que aceitava mês inexistente e data passada, e a sessão da portaria caindo quando eu entrava como cliente em outra aba

## O que aprendi

Aprendi que a IA é boa em me dar caminho e velocidade, mas quem precisa saber o que está sendo construído sou eu. As decisões que mais valeram neste projeto vieram de eu questionar o que ela tinha proposto: o QR gerado com JWT parecia certo até eu perceber que o código ficava impossível de digitar, e foi essa dúvida que levou à solução mais simples.

Também aprendi na prática por que existem testes automatizados. Antes eu achava que serviam para provar que o código funciona; entendi que servem para avisar quando ele parar de funcionar.
