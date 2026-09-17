import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'

const clientSource = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

function createFixture({ primitive, fetchImpl } = {}) {
  const state = []
  const refs = []
  let stateIndex = 0
  let refIndex = 0
  let slotRenderer
  let localeSnapshot = { active: 'en' }
  const localeListeners = new Set()
  const effects = []
  const styles = new Map()

  class Component {
    constructor(props) { this.props = props }
  }
  const React = {
    Component,
    createElement(type, props, ...children) {
      const flattened = children.flat(Infinity)
      const elementProps = { ...(props || {}) }
      if (flattened.length) elementProps.children = flattened.length === 1 ? flattened[0] : flattened
      return { type, props: elementProps, children: flattened }
    },
    useState(initial) {
      const index = stateIndex++
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial
      return [state[index], (next) => { state[index] = typeof next === 'function' ? next(state[index]) : next }]
    },
    useEffect(callback) { effects.push(callback) },
    useCallback(callback) { return callback },
    useRef(initial) {
      const index = refIndex++
      if (!(index in refs)) refs[index] = { current: initial }
      return refs[index]
    },
  }

  const document = {
    getElementById(id) { return styles.get(id) || null },
    createElement(tagName) { return { tagName, dataset: {}, textContent: '' } },
    head: { appendChild(style) { styles.set(style.id, style) } },
  }
  let moduleRecord
  vm.runInNewContext(clientSource, {
    window: { __ModuleLoader__: { load(record) { moduleRecord = record } } },
    document,
    console,
    fetch: fetchImpl || (async () => ({ ok: true, status: 200, json: async () => ({}) })),
    setTimeout,
    clearTimeout,
  })

  const plugin = moduleRecord.factory((name) => {
    if (name === 'react') return React
    if (name === '@deepseek-ai/dsh-client-ui-primitives' && primitive) return { IconChevronDownOutline14: primitive }
    throw new Error('Optional module is unavailable: ' + name)
  })
  const ctx = {
    locale: {
      register() {},
      getSnapshot: () => localeSnapshot,
      subscribe(callback) { localeListeners.add(callback); return () => localeListeners.delete(callback) },
    },
    slots: {
      inject(_name, register) { register() },
      register(_config, renderer) { slotRenderer = renderer; return () => {} },
    },
    effect(callback) { callback(); return () => {} },
  }
  plugin.apply(ctx)

  function render() {
    stateIndex = 0
    refIndex = 0
    const card = slotRenderer({})
    const boundaryElement = card.type(card.props)
    const contentElement = new boundaryElement.type(boundaryElement.props).render()
    return contentElement.type(contentElement.props)
  }

  return {
    render,
    effects,
    localeListeners,
    setLocale(value) { localeSnapshot = { active: value } },
    styles,
  }
}

function findElement(root, predicate) {
  if (!root) return undefined
  if (Array.isArray(root)) {
    for (const item of root) {
      const found = findElement(item, predicate)
      if (found) return found
    }
    return undefined
  }
  if (typeof root !== 'object') return undefined
  if (predicate(root)) return root
  return findElement(root.children, predicate)
}

function textContent(root) {
  if (root == null || typeof root === 'boolean') return ''
  if (Array.isArray(root)) return root.map(textContent).join(' ')
  if (typeof root !== 'object') return String(root)
  return textContent(root.children)
}

test('client follows LocaleFace snapshots and updates the visible language on subscription', () => {
  const fixture = createFixture()
  let tree = fixture.render()
  assert.match(textContent(tree), /Issue Reporter/)
  fixture.effects[0]()
  fixture.setLocale('zh-CN')
  for (const listener of fixture.localeListeners) listener()
  tree = fixture.render()
  assert.match(textContent(tree), /问题报告器/)
})

test('client styles have a stable DSH marker and are installed once across remounts', () => {
  const fixture = createFixture()
  fixture.render()
  fixture.render()
  assert.equal(fixture.styles.size, 1)
  const style = fixture.styles.get('dsh-issue-reporter-styles')
  assert.equal(style.dataset.dshPlugin, 'dsh-issue-reporter')
  assert.match(style.textContent, /color-mix\(in srgb/)
  assert.match(style.textContent, /--dsw-alias-state-error-primary/)
  assert.doesNotMatch(style.textContent, /#[\da-f]{3,8}\b|rgba?\(/i)
})

test('client uses the core Chevron when present and its SVG fallback otherwise', () => {
  const fallbackFixture = createFixture()
  const fallbackTree = fallbackFixture.render()
  const fallbackToggle = findElement(fallbackTree, (node) => String(node.props?.className || '').startsWith('ir-chevron'))
  assert.equal(fallbackToggle.children[0].type().type, 'svg')
  assert.match(fallbackToggle.props.className, /ir-chevron-open|ir-chevron/)

  function CoreChevron() {}
  const coreFixture = createFixture({ primitive: CoreChevron })
  const coreTree = coreFixture.render()
  const coreToggle = findElement(coreTree, (node) => String(node.props?.className || '').startsWith('ir-chevron'))
  assert.equal(coreToggle.children[0].type, CoreChevron)
})

test('client references only theme tokens supported by DSH 0.1.6', () => {
  const supportedTokens = new Set([
    '--dsw-alias-bg-layer-1',
    '--dsw-alias-bg-layer-2',
    '--dsw-alias-bg-layer-3',
    '--dsw-alias-bg-mask-1',
    '--dsw-alias-border-l1',
    '--dsw-alias-border-l2',
    '--dsw-alias-interactive-bg-hover',
    '--dsw-alias-label-primary',
    '--dsw-alias-label-primary-inverted',
    '--dsw-alias-label-secondary',
    '--dsw-alias-label-tertiary',
    '--dsw-alias-state-business-primary',
    '--dsw-alias-state-error-primary',
    '--dsw-alias-state-success-primary',
    '--dsw-alias-state-warn-label',
    '--dsw-alias-state-warn-primary',
  ])
  const referencedTokens = new Set(clientSource.match(/--dsw-alias-[\w-]+/g) || [])
  assert.deepEqual([...referencedTokens].filter((token) => !supportedTokens.has(token)), [])
})

test('updater distinguishes HTTP failures from network failures', async () => {
  async function getNotice(fetchImpl) {
    const fixture = createFixture({ fetchImpl })
    fixture.render()
    fixture.effects[3]()
    await new Promise((resolve) => setTimeout(resolve, 0))
    const disclosure = findElement(fixture.render(), (node) => node.props?.['aria-expanded'] === false)
    disclosure.props.onClick()
    return textContent(fixture.render())
  }

  const networkNotice = await getNotice(async () => { throw new TypeError('fetch failed') })
  assert.match(networkNotice, /Could not check for plugin updates\./)
  assert.doesNotMatch(networkNotice, /HTTP \d+/)

  const httpNotice = await getNotice(async () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: 'Unauthorized' }),
  }))
  assert.match(httpNotice, /Could not check for plugin updates\. \(HTTP 401\)/)
})

test('client UI contains no decorative pictographic emoji', () => {
  assert.doesNotMatch(clientSource, /\p{Extended_Pictographic}/u)
})
