import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'agentes',
  component: 'Pane',
  requestId: 'agentes',
  props: {
    title: 'Agentes',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

test('el panel y la barra siguen a cualquier subagente y la lista de tareas', async ($, on) => {
  on('command.register', () => ({ value: { command: 'agentes' } }))
  on('tool.register', () => ({ value: {} }) as never)
  on('settings.read', () => ({ value: {} }) as never)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('clock.every', () => ({ value: {} }) as never)
  on('clock.now', () => ({ value: 1000 }) as never)
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }) as never)
  const models = ['claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5-5']
  let spawned = 0
  on('agent.spawn', () => ({ model: models[spawned] ?? 'claude-opus-5-5', agentId: `a${++spawned}` }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.tool.call({
    tool: 'TodoWrite',
    todos: [
      { content: 'Leer el código', status: 'completed', activeForm: 'Leyendo' },
      { content: 'Escribir el mod', status: 'in_progress', activeForm: 'Escribiendo' },
    ],
  } as never)
  await $.agent.spawn({ tool_use_id: 't1', prompt: 'x', description: 'Buscar ficheros', subagentType: 'general-purpose' } as never)
  await $.tool.call({ tool: 'Grep', pattern: 'x', agentId: 'a1' } as never)
  await $.agent.spawn({ tool_use_id: 't2', prompt: 'x', description: 'Explorar la base de datos', subagentType: 'Explore' } as never)
  await $.tool.call({ tool: 'mcp__agentes__step', done: 2, total: 5, note: 'leyendo esquemas', agentId: 'a2' } as never)
  await $.agent.spawn({ tool_use_id: 't3', prompt: 'x', description: 'Planificar la migración', subagentType: 'Plan' } as never)

  const pane = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await pane.find({ type: 'Text', text: /Buscar ficheros/ }))?.text).toContain('Buscar ficheros')
  expect((await pane.find({ type: 'Text', text: /Escribir el mod/ }))?.text).toContain('2. Escribir el mod')
  expect((await pane.find({ type: 'Text', text: /herr\./ }))?.text).toContain('1 herr. · última: Grep')
  await pane.unmount()

  const desk = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await desk.find({ type: 'Svg' })).toBeTruthy()
  await desk.unmount()

  const band = await $.ui.mount({
    plugin: 'agentes',
    component: 'AbovePrompt',
    surface: 'terminal',
    props: { hasSurvey: false, isWorking: true, bodyColumns: 100, maxRows: 3, scroll: { offset: 0, bodyRows: 3 } },
  } as never)
  expect((await band.find({ key: 'agentes-crew' }))?.text).toBe('×3')
  expect((await band.find({ type: 'Text', text: /Tareas 1\/2/ }))?.text).toBe('Tareas 1/2')
  await band.unmount()

  const deskBand = await $.ui.mount({
    plugin: 'agentes',
    component: 'AbovePrompt',
    surface: 'desktop',
    props: { hasSurvey: false, isWorking: true, bodyColumns: 100, maxRows: 3, scroll: { offset: 0, bodyRows: 3 } },
  } as never)
  expect((await deskBand.find({ type: 'Svg' }))?.props.alt).toBe('Escribir el mod: Tareas 1/2, 50%, 3 activos, 0 inactivos')
  await deskBand.unmount()
})

test('un flujo terminado cede la barra a las tareas nuevas y la barra cuenta activos e inactivos', async ($, on) => {
  on('command.register', () => ({ value: { command: 'agentes' } }))
  on('tool.register', () => ({ value: {} }) as never)
  on('settings.read', () => ({ value: {} }) as never)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('clock.every', () => ({ value: {} }) as never)
  on('clock.now', () => ({ value: 1000 }) as never)
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }) as never)
  on('turn.complete', () => ({ text: '' }))
  let spawned = 0
  on('agent.spawn', () => ({ model: 'claude-haiku-5-5', agentId: `b${++spawned}` }))

  const band = async () =>
    $.ui.mount({
      plugin: 'agentes',
      component: 'AbovePrompt',
      surface: 'terminal',
      props: { hasSurvey: false, isWorking: true, bodyColumns: 100, maxRows: 3, scroll: { offset: 0, bodyRows: 3 } },
    } as never)

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.tool.call({ tool: 'mcp__agentes__progress', title: 'Old job', finished: true } as never)
  const old = await band()
  expect((await old.find({ type: 'Text', text: /Hecho/ }))?.text).toBe('Hecho')
  await old.unmount()

  await $.tool.call({ tool: 'TodoWrite', todos: [{ content: 'Nueva tarea', status: 'pending', activeForm: 'Haciendo' }] } as never)
  await $.agent.spawn({ tool_use_id: 'u1', prompt: 'x', description: 'Uno', subagentType: 'general-purpose' } as never)
  await $.agent.spawn({ tool_use_id: 'u2', prompt: 'x', description: 'Dos', subagentType: 'general-purpose' } as never)
  await $.turn.complete({ turnId: 's', reason: 'answer', answer: '', agentId: 'b1' } as never)

  const now = await band()
  expect((await now.find({ type: 'Text', text: /Tareas 0\/1/ }))?.text).toBe('Tareas 0/1')
  expect(await now.find({ type: 'Text', text: /Hecho/ })).toBeFalsy()
  expect((await now.find({ type: 'Text', text: /^●1$/ }))?.text).toBe('●1')
  expect((await now.find({ key: 'agentes-crew' }))?.text).toBe('×2')
  await now.unmount()
})

const drain = async (stream: AsyncIterable<unknown>) => {
  for await (const _ of stream);
}

test('la sesión cuenta tokens, coste a precio de API y tiempo de ejecución', async ($, on) => {
  let clock = 1000
  let opens = 0
  let isPlaced = false
  on('command.register', () => ({ value: { command: 'agentes' } }))
  on('tool.register', () => ({ value: {} }) as never)
  on('settings.read', () => ({ value: {} }) as never)
  on('ui.open', () => {
    opens++
    return { value: { isPlaced } }
  })
  on('clock.every', () => ({ value: {} }) as never)
  on('clock.now', () => ({ value: clock }) as never)
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('agent.spawn', () => ({ model: 'claude-haiku-5-5', agentId: 'h1' }))
  on('turn.complete', () => ({ text: '' }))
  // Session on Opus 5.5: 1M in + 100k out = $4 + $2. Haiku 5.5 subagent: 50k in + 10k out = $0.005 + $0.005.
  on('turn.step', async function* (_, e) {
    const isSub = (e as { agentId?: string }).agentId
    const usage = isSub
      ? { model: 'claude-haiku-5-5', input_tokens: 50_000, output_tokens: 10_000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }
      : { model: 'claude-opus-5-5', input_tokens: 1_000_000, output_tokens: 100_000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn', usage } as never
  })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(opens).toBe(0)
  clock = 2000
  // No surface placed it yet: the first prompt tries, the next activity tries again.
  await drain($.turn.step({ turnId: 'm', index: 0, model: 'claude-opus-5-5', messageCount: 1 } as never))
  expect(opens).toBe(1)
  isPlaced = true
  await $.agent.spawn({ tool_use_id: 't1', prompt: 'x', description: 'Revisar precios', subagentType: 'general-purpose' } as never)
  expect(opens).toBe(2)
  // Placed once: closing it is the user's call, nothing reopens it.
  await drain($.turn.step({ turnId: 'm', index: 1, model: 'claude-opus-5-5', messageCount: 3 } as never))
  expect(opens).toBe(2)
  await drain($.turn.step({ turnId: 's', index: 0, model: 'claude-haiku-5-5', messageCount: 1, agentId: 'h1' } as never))
  clock = 32_000
  await $.turn.complete({ turnId: 's', reason: 'answer', answer: '', agentId: 'h1' } as never)
  await $.turn.complete({ turnId: 'm', reason: 'answer', answer: '' } as never)

  const pane = await $.ui.mount({ ...PANE, surface: 'terminal' })
  // Two session steps: 2 × $6.00; the Haiku subagent adds $0.01.
  expect((await pane.find({ type: 'Text', text: /^≈\$12\.0/ }))?.text).toBe('≈$12.0 · Sesión 2.2M · Subagentes 60k · Ejecución 0:30')
  expect((await pane.find({ type: 'Text', text: /Sesión actual/ }))?.text).toContain('Sesión actual')
  expect((await pane.find({ type: 'Text', text: /2\.2M tok/ }))?.text).toContain('2.2M tok · ctx 100% ≈$12.0 0:30')
  expect((await pane.find({ type: 'Text', text: /60k tok/ }))?.text).toContain('60k tok · ctx 6% ≈$0.01 0:30')
  await pane.unmount()
  const desk = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(JSON.stringify(await desk.drawn())).toContain('"alt":"Sesión actual: Opus 5.5, 2.2M tokens, ≈$12.0"')
  await desk.unmount()
})
