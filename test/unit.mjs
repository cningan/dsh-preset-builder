/**
 * Pure-function checks for the Host helpers. Run with `node test/unit.mjs`
 * from the repository root; it needs the bundle's local dependencies.
 */
import assert from 'node:assert/strict'
import { buildBlock, parseBlock, readBlock, replaceBlock, extractBlock, validatePresets, blockRevision } from '../bundle/lib/patch.mjs'
import { describeDisabledExpression } from '../bundle/lib/platform.mjs'
import { parseYaml } from '../bundle/lib/yaml.mjs'
import { pickText, textMap } from '../bundle/lib/inventory.mjs'

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

console.log(`\n${passed} checks passed`)
