# Auditoria de coerência — Crise no Vale (revisão inicial)

Data: 03/11/2026. Base: revisão inicial do repositório jogoiarexx-blip/Crisis-no-vale.

## Objetivo da revisão
Preservar o jogo e seus eventos existentes; alinhar escolha do jogador, roteiro, interface e progressão entre os dois atos.

## Correções implementadas
1. **Extração voluntária:** tocar a marca H não encerra mais o ato. O jogador pressiona E perto da marca para chamar o Garça-1. O portão do rio permanece uma alternativa intencional. O cronômetro de 14 s, ondas, animação e bloqueios continuam os mesmos depois do acionamento.
2. **Contagem de exploração:** o HUD mostra 0/9 registros até iniciar o Ato 2, depois passa para 13 no total. A tela de final do Ato 1 usa 6 áreas e 9 registros possíveis; o Ato 2 usa 9 áreas e 13 registros.
3. **Continuidade de Helena:** ela permanece na cabine do pátio enquanto guia Marina pelo rádio. O Garça-1 recolhe Marina e depois Helena, sem alegar que a doutora já está a bordo enquanto o modelo ainda está no pátio.
4. **Sequência dos acontecimentos:** Brandt não diz que reencontrou Marina no primeiro encontro; os destroços do helicóptero não seguem em chamas após três dias; a vantagem de atordoar o Colosso é descrita sem afirmar invulnerabilidade.
5. **Evidências e epílogo:** documentos específicos são citados como provas apenas quando ambos foram lidos.
6. **Diálogo de chegada:** não é mais exibido quando a personagem já atravessou para outra área.
7. **Instruções e documentação:** menu e README distinguem os 9 registros do Ato 1 dos 4 novos registros no rio, mencionam a ação no sinalizador e usam a URL atual do projeto.

## Inspeções estáticas reproduzíveis
- Revisar `js/director.js`: apenas `interact() -> startRescue()` inicia o evento de resgate; a rotina automática por proximidade foi removida.
- Confirmar contagem em `hudData()` / `endStats()` por ato.
- Revisar `js/story.js`: o diálogo do piloto e as cenas finais não colocam Helena antecipadamente dentro do helicóptero.
- Confirmar que a conclusão de 14 segundos continua em `updateEvent()`.

## Cenários de teste manual ainda pendentes (não certificados por navegador nesta revisão)
- Derrotar o Colosso; atravessar a marca H sem E; confirmar que o jogo não termina.
- Acionar E dentro da marca H e resistir ao evento de 14 segundos; confirmar final do Ato 1.
- Atravessar o portão leste depois do Colosso sem ativar a extração; chegar à margem e conferir HUD 13 registros.
- Retornar pelas portas enquanto há falas de entrada pendentes; conferir ausência de diálogos da área anterior.
- No Ato 2, prender Brandt, destruir ninho e testar final correspondente; testar também fuga/ovos preservados.
- Carregar save antigo e confirmar que progressão, lojas, armas e registros são mantidos.

## Pendências estruturais prioritárias
1. Certificar no navegador com gravações e estados reproduzíveis as nove áreas, save/load, revive da Dra. Lima e colisões das portas.
2. Tornar o deslocamento da Dra. Lima até o resgate visível na encenação, em vez de apenas narrado.
3. Auditar o temporizador de fuga do Brandt com pausa, saída/retorno e resgate no ninho.
4. Revisar QA de controles de gamepad e performance da animação GLB em máquinas fracas.

**Limitação:** os ajustes foram checados por consistência de código; sem execução de Chromium com WebGL disponível, ainda não constituem certificação de jogabilidade ponta a ponta.


## Seguimento: IA e persistência entre cenários (03/11/2026)

**Falha confirmada por inspeção:** `enterArea()` esvaziava `D.queue` e `clearEnemies()` descartava adversários ainda vivos; `D.enc` já marcava o encontro como iniciado, então ele não era refeito. Ameaças e aparições atrasadas podiam sumir ao voltar. **Correção:** snapshot de sobreviventes e fila por área com restauração; estado também entra no save. Ondas de eventos interrompidos são canceladas conscientemente.

**IA antes:** som equivalia a detecção exata do jogador; busca após perder linha de visão não tinha memória nem campo visual. **IA depois:** investigação de ruído, visão com oclusão, memória da última posição e retorno à patrulha; ataques diretos exigem visada. 

**Teste automatizado:** `node --test tests/coherence.test.mjs` valida funções puras de percepção e memória dos encontros. **Pendente:** teste humano/navegador do fluxo completo, paredes, raio de som, fuga e retorno a cada uma das nove áreas, save/load durante e após alertas.
