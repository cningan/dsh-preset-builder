/**
 * Pure-function checks for the Host helpers. Run with `node test/unit.mjs`
 * from the repository root; it needs the bundle's local dependencies.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildBlock, parseBlock, readBlock, replaceBlock, extractBlock, validatePresets, blockRevision } from '../bundle/lib/patch.mjs'
import { describeDisabledExpression } from '../bundle/lib/platform.mjs'
import { emitListItem, parseYaml } from '../bundle/lib/yaml.mjs'
import { addInactiveBundlePackages, addPresetOnlyPackages, pickText, textMap } from '../bundle/lib/inventory.mjs'
import { conflictUsage, inactiveUsage, isCollectableRow } from '../bundle/lib/rules.mjs'
import { canonicalConfig, diffPresetRows, flattenPresetRows } from '../bundle/lib/diff.mjs'

let passed = 0
function test(name, fn) {
  fn()
  passed += 1
  console.log(`ok ${passed} - ${name}`)
}

const preset = {
  id: 'my-mode',
  name: '我的模式',
  description: '测试用',
  order: 7,
  plugins: [
    { id: 'tool-web', name: '@deepseek-ai/dsh-tool-web', config: { fetch: true, note: 'a\nb' } },
    { id: 'tool-pwsh', name: '@deepseek-ai/dsh-tool-pwsh', disabled: { __js: "process.platform !== 'win32'" } },
    {
      id: 'planning',
      name: 'cordis:group',
      group: true,
      isolate: { planMode: true },
      config: [{ id: 'plan-mode', name: '@deepseek-ai/dsh-plan-mode' }],
    },
  ],
}

test('block round trip keeps expressions, groups and multiline strings', () => {
  const block = buildBlock([preset])
  const parsed = readBlock(block)
  assert.equal(parsed.length, 1)
  assert.equal(parsed[0].id, 'my-mode')
  assert.equal(parsed[0].rowId, 'preset-studio-my-mode')
  assert.equal(parsed[0].plugins.length, 3)
  assert.deepEqual(parsed[0].plugins[1].disabled, { __js: "process.platform !== 'win32'" })
  assert.equal(parsed[0].plugins[2].config[0].name, '@deepseek-ai/dsh-plan-mode')
  assert.equal(parsed[0].plugins[0].config.note, 'a\nb')
  assert.equal(validatePresets(parsed).length, 0)
})

test('insertion replaces an empty root and preserves surrounding comments', () => {
  const text = '# header\n[]\n'
  const next = replaceBlock(text, buildBlock([preset]))
  assert.ok(next.startsWith('# header\n'))
  assert.ok(!next.includes('\n[]\n'))
  assert.match(next, /preset-studio-my-mode/)
  assert.equal(blockRevision(extractBlock(next)), blockRevision(buildBlock([preset])))
})

test('replacement is idempotent and leaves unrelated rows byte-identical', () => {
  const original = '# keep me\n- id: something\n  disabled: false\n[]\n'
  const first = replaceBlock(original, buildBlock([preset]))
  const second = replaceBlock(first, buildBlock([preset]))
  assert.equal(first, second)
  assert.ok(second.includes('- id: something\n  disabled: false'))
})

test('a broken marker pair is not treated as a managed block', () => {
  const text = '# >>> dsh-preset-studio managed block — 预设工坊维护，请勿手改标记内部\n[]\n'
  const next = replaceBlock(text, buildBlock([preset]))
  assert.equal(extractBlock(text), null)
  assert.ok(next.includes('preset-studio-my-mode'))
})

test('platform expressions are read conservatively', () => {
  assert.equal(describeDisabledExpression("process.platform === 'win32'").label, '仅 Windows')
  assert.equal(describeDisabledExpression("process.platform !== 'win32'").label, '非 Windows')
  assert.equal(describeDisabledExpression("['darwin','linux'].includes(process.platform)").label, '仅 macOS / Linux')
  assert.equal(describeDisabledExpression("!ctx.get('profileContext')").label, '条件启用')
  assert.equal(describeDisabledExpression("process.env.FOO").kind, 'expression')
})

test('collectability and Host conflict rules use row ids, not module names', () => {
  assert.equal(isCollectableRow({ bundleActive: true, enabled: false, disabled: { kind: 'static' } }), true)
  assert.equal(isCollectableRow({ bundleActive: true, enabled: true, disabled: { kind: 'none' } }), false)
  assert.equal(isCollectableRow({ bundleActive: true, enabled: false, disabled: { kind: 'platform' } }), false)
  assert.equal(isCollectableRow({ bundleActive: false, enabled: false, disabled: { kind: 'none' } }), true)
  assert.equal(isCollectableRow({ bundleActive: false, enabled: false, disabled: { kind: 'static' } }), true)
  assert.equal(isCollectableRow({ bundleActive: false, enabled: false, disabled: { kind: 'conditional' } }), false)

  const skill = { id: 'skill-filesystem', name: '@deepseek-ai/dsh-skill-filesystem' }
  const activeGlobal = new Map([['skill-filesystem-global', { moduleName: skill.name, packageName: skill.name }]])
  assert.deepEqual(conflictUsage({ plugins: [skill] }, activeGlobal), [])
  assert.equal(conflictUsage({ plugins: [{ ...skill, id: 'skill-filesystem-global' }] }, activeGlobal).length, 1)
  assert.deepEqual(conflictUsage({ plugins: [{ ...skill, disabled: true, id: 'skill-filesystem-global' }] }, activeGlobal), [])

  const inactive = new Map([[skill.name, { bundle: 'dsh-web-app', bundleEnabled: true }]])
  assert.deepEqual(inactiveUsage({ plugins: [{ ...skill, id: 'nested', group: true, config: [skill] }] }, inactive), [
    { moduleName: skill.name, bundle: 'dsh-web-app', bundleEnabled: true },
  ])

  const client = readFileSync(new URL('../bundle/client.js', import.meta.url), 'utf8')
  assert.match(client, /api\.activeRowIds\?\.has\(row\.id\)/)
  assert.doesNotMatch(client, /api\.activeModules/)
})

test('preset rows flatten with effective group state and group paths', () => {
  const { leaves, groups } = flattenPresetRows([
    { id: 'a', name: 'mod-a' },
    {
      id: 'g',
      name: 'cordis:group',
      group: true,
      config: [
        { id: 'b', name: 'mod-b', disabled: true },
        { id: 'c', name: 'mod-c' },
      ],
    },
    {
      id: 'h',
      name: 'cordis:group',
      group: true,
      disabled: true,
      config: [{ id: 'd', name: 'mod-d' }],
    },
    {
      id: 'p',
      name: 'cordis:group',
      group: true,
      disabled: { __js: "process.platform === 'win32'" },
      config: [{ id: 'e', name: 'mod-e' }],
    },
  ])
  assert.deepEqual(leaves.map((leaf) => [leaf.id, leaf.state, leaf.declared, leaf.path.join('/')]), [
    ['a', 'enabled', 'enabled', ''],
    ['b', 'disabled', 'disabled', 'g'],
    ['c', 'enabled', 'enabled', 'g'],
    ['d', 'disabled', 'enabled', 'h'],
    ['e', 'conditional', 'enabled', 'p'],
  ])
  assert.deepEqual(groups.map((group) => [group.id, group.state]), [['g', 'enabled'], ['h', 'disabled'], ['p', 'conditional']])
})

test('two presets align rows by id and classify every difference', () => {
  const left = [
    { id: 'a', name: 'mod-a', config: { mode: 'x', nested: { one: 1, two: 2 } } },
    { id: 'b', name: 'mod-b' },
    { id: 'c', name: 'mod-c', disabled: true },
  ]
  const right = [
    { id: 'a', name: 'mod-a', config: { nested: { two: 2, one: 1 }, mode: 'y' } },
    { id: 'b', name: 'mod-b', disabled: true },
    { id: 'd', name: 'mod-d' },
  ]
  const { items, summary } = diffPresetRows(left, right)
  const byId = new Map(items.map((item) => [item.id, item]))
  assert.equal(byId.get('a').status, 'config')
  assert.equal(byId.get('b').status, 'state')
  assert.equal(byId.get('c').status, 'only-left')
  assert.equal(byId.get('d').status, 'only-right')
  assert.equal(byId.get('a').configDiff, true)
  assert.equal(byId.get('a').stateDiff, false)
  assert.deepEqual(summary, {
    leftRows: 3,
    rightRows: 3,
    leftEnabled: 2,
    rightEnabled: 2,
    leftConditional: 0,
    rightConditional: 0,
    onlyLeft: 1,
    onlyRight: 1,
    stateDiff: 1,
    configDiff: 1,
    pathDiff: 0,
    same: 0,
  })
})

test('identical presets and group-path moves are distinguishable', () => {
  const same = diffPresetRows(
    [{ id: 'a', name: 'mod-a', config: { k: true } }],
    [{ id: 'a', name: 'mod-a', config: { k: true } }],
  )
  assert.equal(same.items[0].status, 'same')
  assert.equal(same.summary.same, 1)

  const moved = diffPresetRows(
    [{ id: 'a', name: 'mod-a' }],
    [{ id: 'group', name: 'cordis:group', group: true, config: [{ id: 'a', name: 'mod-a' }] }],
  )
  assert.equal(moved.items[0].status, 'path')
  assert.equal(moved.items[0].pathDiff, true)
  assert.equal(moved.summary.pathDiff, 1)
})

test('duplicate row ids keep both rows and config comparison is key-order independent', () => {
  const duplicated = diffPresetRows(
    [{ id: 'x', name: 'mod-x' }, { id: 'x', name: 'mod-x' }],
    [],
  )
  assert.equal(duplicated.items.length, 2)
  assert.deepEqual(duplicated.items.map((item) => item.key), ['x', 'x#2'])
  assert.equal(canonicalConfig({ a: 1, b: [2, { d: 3, c: 4 }] }), canonicalConfig({ b: [2, { c: 4, d: 3 }], a: 1 }))
  assert.notEqual(canonicalConfig({ a: 1 }), canonicalConfig({ a: '1' }))
})

test('invalid presets are reported, not silently repaired', () => {
  assert.ok(validatePresets([{ id: 'Bad Id', plugins: [] }]).length > 0)
  assert.ok(validatePresets([{ id: 'ok', plugins: [{ id: 'a', name: 'x' }, { id: 'a', name: 'y' }] }]).length > 0)
})

test('managed model keeps adopted rows, tombstones and locks', () => {
  const model = {
    presets: [
      preset,
      {
        id: 'foreign',
        name: 'Foreign',
        plugins: [{ id: 'tool-web', name: '@deepseek-ai/dsh-tool-web' }],
        rowId: 'preset-foreign',
        adopted: true,
      },
    ],
    tombstones: ['preset-gone'],
    locks: ['locked-one', 'foreign'],
  }
  const block = buildBlock(model)
  assert.match(block, /# locks: locked-one, foreign/)
  assert.match(block, /- id: preset-foreign/)
  assert.match(block, /- id: preset-gone\n  disabled: true/)
  const parsed = parseBlock(block)
  assert.equal(parsed.presets.length, 2)
  const adopted = parsed.presets.find((row) => row.id === 'foreign')
  assert.equal(adopted.adopted, true)
  assert.equal(adopted.rowId, 'preset-foreign')
  assert.deepEqual(parsed.tombstones, ['preset-gone'])
  assert.deepEqual(parsed.locks, ['locked-one', 'foreign'])
  assert.equal(parsed.presets.find((row) => row.id === 'my-mode').adopted, false)
})

test('an empty model removes the block, a locks-only model keeps it', () => {
  assert.equal(buildBlock({ presets: [], tombstones: [], locks: [] }), '')
  const locksOnly = buildBlock({ presets: [], tombstones: [], locks: ['locked-one'] })
  assert.match(locksOnly, /# locks: locked-one/)
  const parsed = parseBlock(locksOnly)
  assert.deepEqual(parsed.locks, ['locked-one'])
  assert.equal(parsed.presets.length, 0)
})

test('parsed YAML keeps js tags as expression objects', () => {
  const data = parseYaml("- id: a\n  disabled: !!js process.platform === 'win32'\n")
  assert.deepEqual(data[0].disabled, { __js: "process.platform === 'win32'" })
})

test('localized display text prefers Chinese', () => {
  assert.equal(pickText({ en: 'Web tools', zh: '网页工具' }), '网页工具')
  assert.equal(pickText({ 'zh-cn': '计时服务', en: 'Timer' }), '计时服务')
  assert.equal(pickText('plain'), 'plain')
  assert.equal(pickText(undefined), undefined)
})

test('localized text maps keep lowercase language ids', () => {
  assert.deepEqual(textMap({ ZH: '网页工具', En: 'Web tools' }), { zh: '网页工具', en: 'Web tools' })
  assert.deepEqual(textMap('plain'), { en: 'plain' })
  assert.equal(textMap({}), undefined)
})

test('multiline strings emit block scalars and round-trip', () => {
  const text = emitListItem({
    id: 'persona',
    name: '@deepseek-ai/dsh-persona',
    config: { section: '第一行\n第二行' },
  }).join('\n')
  assert.equal(text.includes('section: |-'), true, text)
  assert.equal(parseYaml(text)[0].config.section, '第一行\n第二行')
  const trailing = emitListItem({ config: { section: 'a\nb\n' } }).join('\n')
  assert.equal(trailing.includes('section: |'), true, trailing)
  assert.equal(parseYaml(trailing)[0].config.section, 'a\nb\n')
})

test('preset-only modules become collectable packages', () => {
  const packages = []
  addPresetOnlyPackages({ get: () => undefined }, packages, [[
    { id: 'persona', name: '@deepseek-ai/dsh-persona', config: { prefix: 'x' } },
  ]])
  assert.equal(packages.length, 1)
  assert.equal(packages[0].name, '@deepseek-ai/dsh-persona')
  assert.equal(packages[0].presetOnly, true)
  assert.equal(packages[0].official, true)
  assert.deepEqual(packages[0].rows.map((row) => [row.id, row.disabled.kind, row.config.prefix]), [['persona', 'none', 'x']])

  const known = [{ name: '@deepseek-ai/dsh-tool-web', rows: [{ id: 'tool-web', moduleName: '@deepseek-ai/dsh-tool-web' }] }]
  addPresetOnlyPackages({ get: () => undefined }, known, [[{ id: 'tool-web', name: '@deepseek-ai/dsh-tool-web' }]])
  assert.equal(known.length, 1)
})

const tempRoot = await mkdtemp(join(tmpdir(), 'dsh-inactive-bundle-'))
try {
  const profile = join(tempRoot, 'profile')
  const offDir = join(profile, 'node_modules', 'dsh-off-bundle')
  await mkdir(offDir, { recursive: true })
  await writeFile(join(profile, 'package.json'), JSON.stringify({
    dependencies: { 'dsh-on-bundle': '1.0.0', 'dsh-off-bundle': '1.0.0' },
    dsh: { profile: { bundles: ['dsh-on-bundle'] } },
  }))
  await writeFile(join(offDir, 'package.json'), JSON.stringify({
    name: 'dsh-off-bundle',
    version: '1.0.0',
    dsh: { bundle: { patch: './cordis.patch.yml' } },
  }))
  await writeFile(join(offDir, 'cordis.patch.yml'), [
    '- insert:',
    '    - id: off-enabled',
    "      name: '@deepseek-ai/dsh-tool-off-enabled'",
    '    - id: off-static',
    "      name: '@deepseek-ai/dsh-tool-off-static'",
    '      disabled: true',
    "    - id: off-conditional",
    "      name: '@deepseek-ai/dsh-tool-off-conditional'",
    "      disabled: !!js process.platform === 'win32'",
    '',
  ].join('\n'))
  const packages = []
  const added = await addInactiveBundlePackages({ get: () => undefined }, packages, profile)
  assert.equal(added, 3)
  const rows = packages.flatMap((pkg) => pkg.rows)
  const enabled = rows.find((row) => row.id === 'off-enabled')
  const disabled = rows.find((row) => row.id === 'off-static')
  const conditional = rows.find((row) => row.id === 'off-conditional')
  assert.equal(enabled.bundleActive, false)
  assert.equal(enabled.bundleName, 'dsh-off-bundle')
  assert.equal(enabled.bundleEnabled, true)
  assert.equal(disabled.disabled.kind, 'static')
  assert.equal(disabled.bundleEnabled, false)
  assert.equal(conditional.disabled.kind, 'platform')
  assert.equal(packages.every((pkg) => pkg.inactiveBundles.includes('dsh-off-bundle')), true)
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}
passed += 1
console.log(`ok ${passed} - inactive bundles expose their rows with bundle metadata`)

console.log(`\n${passed} checks passed`)
