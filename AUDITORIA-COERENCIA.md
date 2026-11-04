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

**Ajuste de QA:** apenas dano novo desperta a patrulha sem visão. HP reduzido carregado de save não reativa perseguição sem contato. Coberto por teste puro adicional.


## Plano ampliado de mundo persistente — especificado, não implementado (03/11/2026)

Foi criada a especificação **[PLANO-MUNDO-COERENTE.md](PLANO-MUNDO-COERENTE.md)**, baseada na inspeção de nove áreas, portas/condições, treze documentos, encontros e combo atual de 2,5 segundos. Prioridades: P0 transições com debounce/posicionamento e animação; P0 documentos coerentes e persistentes; P0 backtracking com novos encontros por evento sem reviver mortos; P0 combo de abates sem golpe por trecho com bônus único ao cruzar para a próxima área; P1 ambientação e mapa. O **[PROMPT-IMPLEMENTACAO-MUNDO.md](PROMPT-IMPLEMENTACAO-MUNDO.md)** contém a instrução integral para um agente implementar e testar o plano.

**Status:** somente documentação atualizada nesta revisão. Não declarar as funcionalidades novas implementadas nem as travessias certificadas sem código e testes reproduzidos.


## Escolta e backtracking — revisão

- **Antes:** a Dra. Lima seguia em linha reta e `resolve()` apenas empurrava para fora dos obstáculos. Ao sair do pátio, a missão apagava os flags de escolta e os encontros disparados, e a personagem retornava à cabine.
- **Depois:** A* sobre AABB/círculos; waypoints suavizados somente em linha livre; replanejamento limitado; animação vinculada aos metros realmente percorridos. O estado da NPC fica no save e no retorno ao pátio, sem repetições de ondas.
- **Consistência:** bloqueio temporário das portas enquanto Lima digita o código, e início do código apenas quando ela está de pé.
- **Validação:** teste automatizado de desvio de obstáculos já incluído. Testes completos no navegador para percurso real até o terminal continuam pendentes.

## Revisão parcial — portas, sequência limpa e arquivo (03/11/2026)

Base: commit 4a2cd4e. Revisão inicial publicada por solicitação do usuário, ainda sem certificação de jogabilidade em WebGL.

- **Antes:** chegar à borda de uma porta iniciava a transição automaticamente. **Depois:** borda bloqueia a passagem; E solicita a troca, verifica travas e ligação recíproca. O streaming de áreas vizinhas já existia. A animação dos portões continua ligada ao destravamento, não à ação de abrir e fechar; colisões e destinos ainda precisam de teste real.
- **Antes:** somente combo de cadência. **Depois:** contador separado de abates sem golpe, cancelado no início de um golpe processado, inclusive com colete; bônus 2=10, 3–4=25, 5–7=50, 8+=80 PE após entrada na área. Contador persistido no save v5; saves antigos começam vazios. Combo rápido permanece e seu temporizador pausa durante fade. Testes puros cobrem tabela, reset e serialização, não os ganchos reais de combate, morte e travessia.
- **Antes:** reler apenas voltando ao objeto. **Depois:** tecla J abre os documentos encontrados em sequência, usando seus textos e IDs originais; não é ainda uma aba com seleção individual. Acessibilidade dos 13 documentos não foi verificada.
- **Testes executados:** `node --check` nos módulos alterados e `node --test tests/*.test.mjs` (13 testes aprovados). Cobrem regras puras do combo, memória de inimigos e navegação de escolta; não são uma certificação do jogo integrado.
- **Navegador/Pages:** página publicada acessível, mas o navegador deste ambiente não conseguiu criar contexto WebGL (GL_RENDERER Disabled). Nenhuma travessia, animação, colisão, controle ou campanha completa pôde ser jogada. A publicação foi solicitada; a validação de jogabilidade permanece pendente.
- **Pendente P0:** testar todos os sentidos e distâncias de interação; validação do spawn e colisores; recuperação em falha de carregamento; animação/sons/estado real de abertura e fechamento; reposicionamento e suportes dos documentos; arquivo com seleção individual; emboscadas narrativas únicas com pistas; persistência e testes integrados de todos os estados e saves; prevenção de duplicação em cenários reais. Verificar controle por gamepad. P1 visual, FPS e percurso completo continuam pendentes.

## Revisão seguinte — preparação segura das travessias (03/11/2026)

- **Antes:** a área de destino podia ser construída durante a tela preta; se a construção falhasse, a transição podia ficar interrompida e a área parcialmente construída ainda parecia pronta. **Depois:** a área é preparada antes do fade, falhas geram aviso e permitem tentativa posterior, e construções incompletas são descartadas. Ainda não há recuperação transacional de falhas inesperadas em etapas posteriores a essa preparação.
- **Antes:** chegada usava uma coordenada fixa sem conferir colisores. **Depois:** a busca testa posições próximas à porta contra caixas e círculos do cenário construído; se nenhuma estiver livre, a troca é recusada antes de sair. Não substitui validação visual do caminho de chegada.
- **Antes:** jogador, inimigos e projéteis continuavam atualizando durante o fade. **Depois:** atualizações desses sistemas ficam suspensas até a transição terminar, preservando também a cadência do combo.
- **Testes executados:** `node --check` nos arquivos JS alterados; `node --test tests/*.test.mjs`: 16 testes aprovados. Três novos testes verificam o grafo das nove áreas, coordenadas/direções nominais em área vazia e escolha/rejeição de pontos com obstáculos sintéticos. Não verificam a geometria construída de todas as áreas nem equivalem a um playtest.
- **Pendente:** teste em navegador com WebGL da geometria real, dos dois sentidos, de 30 trocas, eventos, teclado/gamepad, efeitos e saves; abertura/fechamento visual controlados por interação; localização e seleção de documentos; emboscadas narrativas. O ambiente de navegador anterior não conseguiu criar contexto WebGL.

## Revisão — emboscadas de retorno após a energia (03/11/2026)

- **Antes:** `lab-return` e `ruinas-return` já eram encontros únicos por ID e exigiam energia, mas não verificavam a origem. O aviso podia ocorrer durante o fade e parte dos inimigos surgia pelo lado da chegada.
- **Depois:** laboratório só dispara ao retornar do pântano; ruínas, ao voltar do laboratório. Cada um continua registrado em `enc` e limitado a uma vez por campanha. O aviso visual e sonoro entra na fila persistente e executa após o fade, pelo menos três segundos antes das primeiras aparições. A fila e o aviso pendentes são conservados; ao revisitar depois de um aviso já consumido, um novo aviso precede as aparições restantes. As entradas foram direcionadas ao lado oposto da chegada; o laboratório passa de cinco para três inimigos no encontro.
- **Testes executados:** `node --check` dos módulos alterados; `node --test tests/*.test.mjs`: 19 testes aprovados. Os novos testes cobrem condições de energia, origem e primeira visita, ID já registrado após serialização, alerta e fila preservados e as definições reais dos dois encontros. São testes de lógica; não comprovam a experiência visual ou sonora em jogo.
- **Pendente:** navegador com WebGL para verificar campo de visão, colisões e distância reais dos pontos de aparição, mixagem do aviso, saves e retornos em campanha. A escolha dos pontos ainda pode usar o fallback de borda existente, portanto não garante que todo inimigo apareça fora da câmera. Revisar também emboscadas dos demais atos e manter a continuidade dos sobreviventes no jogo real.

## Modelos da Dra. Lima, armas e Jill (03/11/2026)

- **Antes:** Dra. Lima e armas usavam malhas procedurais; não havia seleção de Jill. Os modelos enviados estavam na raiz de `assets` e não eram utilizados.
- **Depois:** modelos ativos em `assets/personagens` e `assets/armas`; originais em `assets/originais`. A Dra. Lima carrega ao ser necessária, com caminhada animada e reserva procedural. As armas são carregadas sob demanda e mantêm a reserva se o download ou a leitura falharem. Jill é opção visual no menu ao concluir qualquer final; progresso anterior com melhor pontuação também habilita a opção. A história conserva o nome Marina. A escolha é lembrada localmente; arma e inventário seguem as regras da campanha. A troca é feita no menu.
- **Otimização medida:** texturas 2048→1024 preservando os dados geométricos, rig e animações. Jill 16.063.592→3.942.424 bytes; Lima 16.070.688→10.779.896; MP5 22.415.772→14.719.304; escopeta 1.365.572→823.316; Glock 23.629.060→21.386.832. As duas armas maiores são lidas em partes por limitação de transferência do repositório; o carregador reúne os bytes antes do parse. O carregamento sob demanda evita baixar todos os modelos no início.
- **Limitação de desempenho:** redução apenas de texturas, sem simplificar a malha: Glock continua com 521.935 vértices e MP5 com 258.714. Ainda é necessário simplificar geometria e medir FPS; a primeira aparição pode demorar e a malha procedural permanece durante o carregamento.
- **Testes executados:** verificação sintática e `node --test tests/*.test.mjs`: 24 testes passaram, incluindo cabeçalho, limites de buffers, rig, nomes de animações e montagem das partes dos GLBs. Não são testes de renderização nem de jogabilidade.
- **Pendente:** conferir no navegador com WebGL escala e orientação das armas, encaixe na mão, posição do efeito de tiro, pose parada/caída da médica, retargeting das animações da Jill, seleção/desbloqueio em campanha e desempenho. O navegador anteriormente disponível não criou contexto WebGL.

## Cenas curtas entre áreas e ritmo de exploração (03/11/2026)

- **Antes:** trocas usavam apenas fade e o nome da área. Temporizadores de diálogos e eventos podiam continuar durante a tela preta; o jogador podia pressionar ações mesmo com a simulação parada.
- **Depois:** oito cenas curtas de primeira chegada ligam as nove áreas principais, usando o cenário existente, barras, texto de contexto, dica de exploração e enquadramento discreto. Duram até 5,5 s, podem ser puladas com E, Espaço, Enter, botão A do controle ou botão na tela e não repetem em revisitas. Movimento reduzido desliga o ajuste de câmera.
- As cenas não criam modelos ou luzes. Jogador, inimigos e projéteis seguem congelados; cronômetro de jogo, falas e fila de encontros aguardam a conclusão. Ações e giro de câmera por mouse/controle são bloqueados na travessia, com pausa disponível. O registro de cena usa o estado de história existente e saves antigos continuam válidos. Fechar ou pular não concede bônus adicional.
- **Testes executados:** sintaxe dos módulos alterados e `node --test tests/*.test.mjs`: 27 testes passaram. Os novos testes verificam que as oito cenas usam portas reais, primeira visita/revisita, persistência serializada e duração/pulo. Não testam a interface integrada ou desempenho no navegador.
- **Pendente:** playtest WebGL de cada cena e da transição para diálogos, encontros, controle, pausa, pulo e save/load; avaliação visual do enquadramento e medidas de FPS. O navegador utilizado nas revisões anteriores não conseguiu criar um contexto WebGL.

## Arquivo navegável e acesso aos registros (03/11/2026)

- **Antes:** J percorria todos os documentos já encontrados em sequência; interações usavam distância e podiam alcançar a gravação de Brandt por trás da parede.
- **Depois:** J abre uma lista com título, autor e área somente dos registros encontrados. Teclado, mouse e controle permitem escolher, reler e voltar ao arquivo. O jogo pausa durante o arquivo e a leitura, sem conceder novamente pontos ou PE. No controle, direcional para cima abre o arquivo, direcional navega e A seleciona.
- Para registros no cenário, a seleção próxima agora exige linha de visão e a gravação `log5` exige energia e ausência de bloqueio da diretoria. IDs e textos originais, bem como seu estado no save e nos finais, foram mantidos.
- **Verificações executadas:** `node --check` nos arquivos JS alterados; `node --test tests/*.test.mjs`: 31 testes passaram. Foram verificados 13 IDs únicos nas áreas declaradas, seleção sem registros não encontrados, serialização de IDs, barreira de visão simulada e condições da diretoria. Esses testes não certificam a acessibilidade física das posições.
- **Pendente:** revisar os suportes e percursos de todos os 13 registros no navegador com WebGL. A ordem de manutenção `log4`, por exemplo, ainda está a cerca de 5,7 unidades do painel do gerador e seu reposicionamento depende de validação da geometria. Testar também navegação por controle, foco e tela de leitura no jogo real. O navegador disponível anteriormente não criou contexto WebGL.

## Escopeta e caminhada da protagonista (04/11/2026)

- **Antes:** o GLB da escopeta era normalizado para 0,92 e depois multiplicado por 0,55 na mão, resultando em cerca de 0,51 m; o clarão usava a mesma ponta genérica das outras armas. A caminhada da personagem original usava seu próprio `Walking_Woman`.
- **Depois:** o comprimento configurado da escopeta passou a 1,58 unidade no rig, cerca de 0,87 m após a escala de 0,55. O clarão acompanha a extremidade do GLB; enquanto o modelo simples de reserva está em uso, mantém sua ponta anterior. Não altera dano, alcance ou munição.
- A caminhada feminina da Jill é carregada em segundo plano e suas rotações locais compatíveis são adaptadas às poses de repouso da protagonista. A translação e a escala do rig original são preservadas; corrida e animações de combate continuam do modelo original. Se o carregamento falhar ou faltarem ossos essenciais, a caminhada original é mantida.
- **Validação reproduzida:** `node --check` e `node --test tests/*.test.mjs`: 36 testes aprovados. Os GLBs reais foram examinados com GLTFLoader e AnimationMixer da versão r160 do Three.js em Node: 40 canais de rotação compartilhados; clipe adaptado avaliado em 41 tempos, com rotações finitas e normalizadas. Foi um teste de esqueleto, sem malhas, GPU ou renderização.
- **Pendente:** verificar visualmente encaixe da escopeta, direção e posição do clarão, pés, braços, mira, corrida e transição de animações durante o jogo. O navegador disponível anteriormente não criou contexto WebGL; as medidas são calculadas e não constituem certificação visual.

## Efeitos, grama e encaixe da escopeta (04/11/2026)

- **Escopeta antes:** a centralização da malha deixava a referência estimada da empunhadura afastada do soquete e o clarão usava uma altura genérica. **Depois:** a posição usa uma referência próxima à coronha/gatilho do GLB e o clarão acompanha a altura e a ponta do cano. Para um personagem sem soquete dedicado, é criado um ponto na mão direita. O comportamento da arma e os atributos de combate não foram alterados.
- **Efeitos antes:** até 320 partículas eram malhas individuais na cena; impactos da escopeta eram criados por chumbo. **Depois:** até sete lotes instanciados por material, com rejeição de partículas fora da câmera; impactos visuais de múltiplos chumbos são limitados, preservando todos os cálculos de dano e o primeiro impacto por inimigo. Fumaça passa a respeitar a qualidade. Também evita reaproveitar névoa de impacto anterior.
- **Grama antes:** cones de 12 triângulos por instância, densidade fixa. **Depois:** tufos com três folhas triangulares e gradiente de cor, sem transparência ou sombras, com densidade 55%/80%/100% conforme qualidade. As posições são geradas com a mesma sequência aleatória anterior; a área continua em um lote de instâncias. Redução geométrica por tufo: 12→3 triângulos, antes de considerar diferenças de material e visibilidade.
- **Testes executados:** `node --check` nos módulos alterados e `node --test tests/*.test.mjs`: 40 aprovados. Com Three.js r160 em Node, um teste de esqueleto avaliou 41 tempos do ciclo e distância máxima aproximada de 0,001 m entre o ponto de empunhadura escolhido e o soquete; outro testou 320 partículas, sete lotes, descarte fora da câmera e limpeza; integração simulou impacto e explosão. Esses testes não renderizaram a cena nem mediram chamadas de GPU ou FPS em jogo.
- **Pendente:** verificar visualmente a mão e os dedos nas duas personagens, animações de mira/recarga, aparência e densidade dos tufos, efeitos transparentes e desempenho em dispositivos reais. Os modelos Glock e MP5 ainda têm geometria pesada; nenhum FPS ou ganho percentual de desempenho foi certificado. O navegador disponível não criou contexto WebGL nas tentativas anteriores.

## Sombras de contato em WebP — revisão de desempenho

**Antes:** o renderizador mantinha um mapa de sombras dinâmico para a luz direcional, com resolução configurada entre 512 e 2048 pixels por lado e custo adicional para desenhar a cena na passagem de sombra. Árvores, construções e personagens participavam dessa passagem conforme nível de detalhe.

**Depois:** o mapa de sombras do renderizador foi desativado. Uma textura WebP de 128 × 128 com transparência (cerca de 2,4 KB) gera manchas suaves de contato no chão. Árvores, pedras, caixas e sólidos próximos ao chão são reunidos em um `InstancedMesh` por área; Marina/Jill, Dra. Lima e dinossauros usam a mesma textura e geometria vinculadas às suas raízes. As sombras de atores são ocultadas durante a animação de morte para não girar para fora do chão. O carregamento da textura tem fallback procedural; os recursos compartilhados sobrevivem ao descarte das áreas. A iluminação e as colisões não foram alteradas.

**Limites:** são aproximações elípticas, não silhuetas fiéis: não projetam sombra em paredes, andares elevados ou superfícies inclinadas; nem todos os objetos específicos têm manchas. As manchas estáticas não acompanham individualmente a ocultação por LOD. O custo exato e o impacto visual dependem da GPU; não foi medido FPS e a redução não foi quantificada. O teste de renderização e percurso no navegador com WebGL fica pendente.

**Verificação:** 43 testes Node passaram localmente, inclusive lote estático, limites de dimensões, compartilhamento/fallback e formato WebP. Em teste de CPU com Three.js r160 real, 500 instâncias ocuparam um lote, com matriz, bounding sphere e acompanhamento da raiz do personagem corretos. Verificação em WebGL necessária para aparência e desempenho reais.

## Portões, travessia e arma curta — revisão de apresentação

**Antes:** um portão destrancado baixava automaticamente e deixava só a moldura, como na captura do cais. Ao apertar E o destino era construído antes do fade; não havia uma cena de travessia visível. A Glock era tratada como se o cano apontasse no eixo positivo do GLB, quando aponta no eixo negativo. Abertura/fechamento e recarga usavam sons sintéticos genéricos.

**Depois:** os vãos de transição recebem folha metálica reforçada, permanecendo fechada mesmo quando destrancada (a luz indica se pode ser usada). E inicia uma cena com câmera fixa, folha subindo, personagem caminhando através do vão, folha descendo e fade curto antes da chegada; travas e interação existentes continuam em vigor. O próximo cenário começa a ser preparado após o início da cena e o pré-carregamento por proximidade permanece ativo. Se a chegada segura falhar, a personagem e o portão voltam ao estado anterior. PE de sequência limpa continua sendo pago uma só vez após a chegada. Na Glock, o eixo do cano, a empunhadura e o clarão foram ajustados conforme o GLB existente (o jogo não possui um modelo de revólver). Sons de abertura, batida da porta, disparo e recarga foram refinados com o sintetizador WebAudio e reutilizam seus buffers e limitador de vozes, sem novos arquivos sonoros.

**Limites:** a construção de uma área ainda é síncrona na thread principal. A cena começa antes dela e o pré-carregamento pode ocultar parte do custo, mas uma construção muito pesada ainda pode congelar brevemente a animação. O avanço mostrado é uma animação controlada, não uma simulação de colisão da personagem durante a cena. Falta testar enquadramento, áudio percebido, arma na mão e transição completa em um navegador com WebGL e saída de áudio. FPS não foi medido.

**Verificação:** 47 testes automatizados locais, incluindo cronologia, quatro direções, bloqueio sem destino pronto, falha de chegada, restauração, uma troca e um pagamento de bônus. Com Three.js r160 e os GLBs reais (sem texturas), a empunhadura estimada da Glock ficou a até 0,12 mm do soquete ao longo de 41 amostras do ciclo de caminhada; isso não substitui a inspeção visual dos dedos e da pose.
