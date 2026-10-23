# claudeby-keyn

[English](README.md) · [Español](README.es.md) · **Português**

Skills e mods de produtividade e segurança para o [Claude Code](https://claude.com/claude-code). Cada um resolve um problema real de trabalhar com o Claude todos os dias: não saber o que seus agentes estão fazendo, gastar demais em trabalho simples ou perder o fio da sessão.

Tudo está em um único marketplace: você adiciona uma vez e instala só os plugins que quiser.

## Instalação

Em uma sessão de terminal do Claude Code, uma linha por plugin:

```
/plugin install agentes --marketplace KDomingos/claudeby-keyn
/plugin install subagents-by-difficulty --marketplace KDomingos/claudeby-keyn
```

Responda `y` para adicionar o marketplace na primeira vez e escolha um escopo (o escopo de usuário faz funcionar em todos os projetos).

Pelo shell:

```bash
claude plugin install agentes --marketplace KDomingos/claudeby-keyn
claude plugin install subagents-by-difficulty --marketplace KDomingos/claudeby-keyn
```

No app para desktop: clique em **+** ao lado da caixa de texto, depois em **Plugins**, **Add marketplace** com `KDomingos/claudeby-keyn` e então em **Add plugin**.

Os mods exigem uma versão recente do Claude Code.

## O que há aqui

| Plugin | Tipo | Em uma linha |
|---|---|---|
| [agentes](#agentes) | Mod | Um painel ao vivo com sua sessão, suas tarefas e cada subagente: tokens, custo e tempo |
| [subagents-by-difficulty](#subagents-by-difficulty) | Skill | Opus planeja e revisa, Sonnet constrói, Haiku faz o trabalho rápido e simples |

---

### agentes

Uma barra de progresso acima da caixa de texto e um painel **Agentes** ao vivo ao lado do chat.

![Painel Agentes](assets/agentes-panel.png)

![Barra de progresso acima da caixa de texto](assets/agentes-band.png)

**O que mostra**

- **Esta sessão:** modelo, esforço, ferramentas usadas, ocupação do contexto, tokens, custo e tempo de execução (só o tempo em que o Claude esteve de fato trabalhando).
- **Tarefas:** a lista de tarefas da sessão, ao vivo: concluídas, em andamento, pendentes.
- **Cada subagente:** em execução e finalizados, cada um com seu modelo, a última ferramenta que usou, seus próprios passos se ele os informa, tokens, contexto, custo e tempo. Cada tipo de agente tem seu próprio caranguejo de pixels: um pirata para o Explore, um detetive para o Plan e uma fantasia por modelo para os demais.
- **Totais:** custo da sessão inteira, tokens da sessão, tokens dos subagentes e tempo de execução.
- **Barra de progresso:** a tarefa atual e quantas já foram concluídas, com os subagentes em execução em verde e os inativos em cinza. O botão `×N` abre o painel; `✕` oculta a barra.

O painel abre sozinho na primeira vez que a sessão faz algo, uma vez por sessão. `/agentes` o mostra ou oculta.

**Por que importa.** Os subagentes trabalham fora da sua vista: você não vê qual modelo cada um usa, quanto demora nem quanto custa até a fatura chegar. O painel torna isso visível enquanto acontece, e assim você identifica um agente fora de controle, um modelo caro fazendo trabalho simples ou um contexto prestes a encher.

**O custo** é uma estimativa: os tokens informados pelo Claude Code, calculados pelos preços de tabela da API do Claude (outubro de 2026, em `PRICES` de `hooks/register.tsx`). Com uma assinatura, é o que o mesmo trabalho custaria na API, não o que você paga. O mod nunca chama o modelo, então não gera custo próprio.

**Idioma:** o painel segue a configuração `language` do Claude Code (espanhol, inglês, português ou russo), ou você pode defini-lo em `/config`.

Baseado no [savvy-progress](https://github.com/johnnyvizz/claude-kit) de johnnyvizz (MIT), reescrito para acompanhar a sessão atual e qualquer subagente sem precisar do savvy-flow.

---

### subagents-by-difficulty

Um método de trabalho em forma de skill: o modelo principal lidera e cada tarefa vai para o modelo mais barato que consiga fazê-la bem.

| Papel | Modelo | Faz |
|---|---|---|
| Líder | Opus | Analisa, planeja, escreve briefs curtos, revisa o que importa e verifica o resultado. Nunca escreve código |
| Construtor | Sonnet | Todo o código e os testes, até correções de uma linha; revisões simples |
| Executor | Haiku | Lê, busca, extrai e faz verificações mecânicas simples |

Inclui uma regra de três perguntas para escolher o modelo, um modelo de brief e as salvaguardas que mantêm seguros os subagentes em paralelo: um arquivo por subagente, sem git nos subagentes, e o líder roda ele mesmo as verificações finais. Antes de criar um subagente novo, reaproveita um que já trabalhou na mesma coisa, para não pagar o contexto duas vezes. A divisão só muda quando você pede de forma explícita, nomeando o modelo ("use só o Opus").

**Por que importa.** Rodar tudo no modelo mais forte é lento e caro; rodar tudo em um barato quebra coisas. Dividir por dificuldade mantém a qualidade onde importa, reduz o custo do trabalho de rotina e mantém limpo o contexto do líder, que assim revisa melhor. Combina bem com o **agentes**, que mostra quanto cada subagente custa.

Use pedindo ao Claude que "planeje e delegue" ou que "use subagents by difficulty", ou com `/subagents-by-difficulty`.

---

## Licença

[MIT](LICENSE).
