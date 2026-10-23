# claudeby-keyn

[English](README.md) · **Español** · [Português](README.pt.md)

Skills y mods de productividad y seguridad para [Claude Code](https://claude.com/claude-code). Cada uno resuelve un problema real de trabajar con Claude a diario: no saber qué hacen tus agentes, gastar demasiado en trabajo sencillo o perder el hilo de la sesión.

Todo está en un solo marketplace: lo añades una vez y luego instalas solo los plugins que quieras.

## Instalación

En una sesión de terminal de Claude Code, una línea por plugin:

```
/plugin install agentes --marketplace KDomingos/claudeby-keyn
/plugin install subagents-by-difficulty --marketplace KDomingos/claudeby-keyn
```

Responde `y` para añadir el marketplace la primera vez y elige un ámbito (el ámbito de usuario hace que funcione en todos los proyectos).

Desde una shell:

```bash
claude plugin install agentes --marketplace KDomingos/claudeby-keyn
claude plugin install subagents-by-difficulty --marketplace KDomingos/claudeby-keyn
```

En la app de escritorio: pulsa **+** junto al cuadro de texto, luego **Plugins**, **Add marketplace** con `KDomingos/claudeby-keyn` y después **Add plugin**.

Los mods necesitan una versión reciente de Claude Code.

## Qué incluye

| Plugin | Tipo | En una línea |
|---|---|---|
| [agentes](#agentes) | Mod | Un panel en vivo con tu sesión, sus tareas y cada subagente: tokens, coste y tiempo |
| [subagents-by-difficulty](#subagents-by-difficulty) | Skill | Opus planifica y revisa, Sonnet construye, Haiku hace el trabajo rápido y sencillo |

---

### agentes

Una barra de progreso sobre el cuadro de texto y un panel **Agentes** en vivo junto al chat.

![Panel Agentes](assets/agentes-panel.png)

![Barra de progreso sobre el cuadro de texto](assets/agentes-band.png)

**Qué muestra**

- **Esta sesión:** modelo, esfuerzo, herramientas usadas, ocupación del contexto, tokens, coste y tiempo de ejecución (solo el tiempo en que Claude estuvo trabajando).
- **Tareas:** la lista de tareas de la sesión, en vivo: hechas, en curso, pendientes.
- **Cada subagente:** en marcha y terminados, cada uno con su modelo, la última herramienta que usó, sus propios pasos si los comunica, tokens, contexto, coste y tiempo. Cada tipo de agente tiene su propio cangrejo de píxeles: un pirata para Explore, un detective para Plan y un disfraz por modelo para el resto.
- **Totales:** coste de toda la sesión, tokens de la sesión, tokens de los subagentes y tiempo de ejecución.
- **Barra de progreso:** la tarea actual y cuántas van hechas, con los subagentes en marcha en verde y los inactivos en gris. El botón `×N` abre el panel; `✕` oculta la barra.

El panel se abre solo la primera vez que la sesión hace algo, una vez por sesión. `/agentes` lo muestra o lo oculta.

**Por qué importa.** Los subagentes trabajan fuera de tu vista: no ves qué modelo usa cada uno, cuánto tarda ni cuánto cuesta hasta que llega la factura. El panel lo hace visible mientras ocurre, así puedes detectar un agente descontrolado, un modelo caro haciendo trabajo sencillo o un contexto a punto de llenarse.

**El coste** es una estimación: los tokens que informa Claude Code, valorados a precios de lista de la API de Claude (octubre de 2026, en `PRICES` de `hooks/register.tsx`). Con una suscripción es lo que costaría el mismo trabajo en la API, no lo que pagas. El mod nunca llama al modelo, así que no añade coste propio.

**Idioma:** el panel sigue el ajuste `language` de Claude Code (español, inglés, portugués o ruso), o puedes definirlo en `/config`.

Basado en [savvy-progress](https://github.com/johnnyvizz/claude-kit) de johnnyvizz (MIT), reescrito para seguir la sesión actual y cualquier subagente sin necesitar savvy-flow.

---

### subagents-by-difficulty

Un método de trabajo en forma de skill: el modelo principal dirige y cada tarea va al modelo más barato que pueda hacerla bien.

| Rol | Modelo | Hace |
|---|---|---|
| Líder | Opus | Analiza, planifica, escribe encargos cortos, revisa lo que importa y verifica el resultado. Nunca escribe código |
| Constructor | Sonnet | Todo el código y los tests, incluso las correcciones de una línea; revisiones sencillas |
| Ejecutor | Haiku | Lee, busca, extrae y hace comprobaciones mecánicas sencillas |

Incluye una regla de tres preguntas para elegir el modelo, una plantilla de encargo y las salvaguardas que mantienen seguros los subagentes en paralelo: un archivo por subagente, sin git desde los subagentes, y el líder ejecuta él mismo las comprobaciones finales. Antes de lanzar un subagente nuevo reutiliza uno que ya haya trabajado en lo mismo, para no pagar dos veces el contexto. El reparto solo cambia cuando lo dices de forma explícita, nombrando el modelo ("usa solo Opus").

**Por qué importa.** Ejecutarlo todo con el modelo más potente es lento y caro; ejecutarlo todo con uno barato rompe cosas. Repartir por dificultad mantiene la calidad donde importa, reduce el coste del trabajo rutinario y mantiene limpio el contexto del líder, que así revisa mejor. Combina bien con **agentes**, que muestra lo que cuesta cada subagente.

Úsalo pidiéndole a Claude que "planifique y delegue" o que "use subagents by difficulty", o con `/subagents-by-difficulty`.

---

## Licencia

[MIT](LICENSE).
