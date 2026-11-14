/**
 * UI smoke for the Preset Workshop.
 *
 * Run through the PowerShell wrapper (recommended):
 *   pwsh test/ui-smoke.ps1 [-Screenshots] [-Keep]
 *
 * Direct run against an already-running isolated instance:
 *   $config = @{ url = 'http://127.0.0.1:<port>/?token=...' } | ConvertTo-Json -Compress
 *   $source = "globalThis.__UI_SMOKE_CONFIG__ = $config`n" + (Get-Content test/ui-smoke.mjs -Raw)
 *   $source | ego-browser nodejs
 *
 * ego-browser does not inherit arbitrary environment variables; the config
 * global above is how the URL and screenshot directory reach this script.
 */

const config = globalThis.__UI_SMOKE_CONFIG__ || {}
const url = config.url || process.env.UI_SMOKE_URL
const outDir = config.outDir || process.env.UI_SMOKE_OUT || null

if (!url) {
  console.error('UI_SMOKE_FAIL: UI_SMOKE_URL is not set')
  process.exit(2)
}

const checks = []
const warnings = []
let page = null

function expect(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), ...(detail === undefined ? {} : { detail }) })
  if (!ok) throw new Error(name)
}

async function wait(ms) {
  await page.waitForTimeout(ms)
}

async function capture(name) {
  if (!outDir) return
  try {
    await page.screenshot({ path: `${outDir}/${name}.png` })
  } catch (error) {
    warnings.push(`screenshot ${name} failed: ${error && error.message ? error.message : String(error)}`)
  }
}

async function dismissDialogs() {
  for (let i = 0; i < 6; i += 1) {
    const action = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]')
      if (!dialog) return null
      const close = dialog.querySelector('button[aria-label="关闭"]')
      if (close) {
        close.click()
        return 'close'
      }
      const buttons = [...dialog.querySelectorAll('button')]
      const target = buttons.find((button) => /继续|开始使用|知道了|确定/.test(button.textContent || '')) || buttons[0]
      if (target) {
        target.click()
        return 'button'
      }
      return null
    })
    if (action === null) return
    await wait(400)
  }
}

async function setSelect(label, value) {
  return page.evaluate(({ label, value }) => {
    const select = document.querySelector(`select[aria-label="${label}"]`)
    if (!select) return false
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
    setter.call(select, value)
    select.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, { label, value })
}

async function compareMetrics() {
  return page.evaluate(() => {
    const table = document.querySelector('.ps-cmp-body')
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      rows: document.querySelectorAll('.ps-cmp-row').length,
      previews: document.querySelectorAll('.ps-cmp-preview').length,
      diffbars: document.querySelectorAll('.ps-cmp-diffbar').length,
      tableWidth: table ? Math.round(table.getBoundingClientRect().width) : 0,
    }
  })
}

try {
  const task = await taskSpace('preset-builder-ui-smoke')
  page = task.page('p1')
  await page.goto(url)
  await wait(2500)

  await page.evaluate(() => {
    window.__uiSmokeErrors = []
    addEventListener('error', (event) => window.__uiSmokeErrors.push(String(event.message || event.error || 'error')))
    addEventListener('unhandledrejection', (event) => window.__uiSmokeErrors.push('unhandledrejection: ' + String(event.reason)))
  })
  await dismissDialogs()
  await page.cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 839, deviceScaleFactor: 1, mobile: false })
  await wait(400)

  if (await page.evaluate(() => Boolean(document.querySelector('button[aria-label="打开侧边栏"]')))) {
    await page.click('css=button[aria-label="打开侧边栏"]')
    await wait(300)
  }
  await page.click('css=button[aria-label="预设工坊"]')
  await wait(1400)
  expect('workshop opens', await page.evaluate(() => Boolean(document.querySelector('.ps-topnav'))))

  await page.click('css=.ps-topnav button:nth-child(1)')
  await wait(600)
  expect('simple base picker', await setSelect('基础预设', 'standard'))
  await wait(400)
  if (await page.evaluate(() => Boolean([...document.querySelectorAll('button')].find((button) => button.textContent.trim() === '复制并编辑')))) {
    await page.click('loc=role:button[name="复制并编辑"]')
    await wait(800)
  }
  expect('simple ID field appears', await page.evaluate(() => Boolean(document.querySelector('#ps-simple-id'))))
  const draftId = await page.evaluate(() => document.querySelector('#ps-simple-id').value)
  expect('new copy has a draft ID', draftId.length > 0, draftId)
  await page.fill('css=#ps-simple-persona', 'UI smoke persona')
  await wait(500)

  await page.click('css=.ps-topnav button:nth-child(3)')
  await wait(800)
  expect('compare A picker', await setSelect('预设 A', draftId))
  expect('compare B picker', await setSelect('预设 B', 'standard'))
  await wait(1400)

  const wide = await compareMetrics()
  expect('compare rows rendered', wide.rows >= 20, wide.rows)
  expect('config previews rendered', wide.previews > 0, wide.previews)
  expect('field diffbars rendered', wide.diffbars > 0, wide.diffbars)
  expect('no horizontal overflow (sidebar open)', wide.scrollWidth <= wide.viewport.width, wide)

  if (await page.evaluate(() => Boolean(document.querySelector('button[aria-label="收起侧边栏"]')))) {
    await page.click('css=button[aria-label="收起侧边栏"]')
    await wait(400)
  }
  const collapsed = await compareMetrics()
  expect('no horizontal overflow (sidebar collapsed)', collapsed.scrollWidth <= collapsed.viewport.width, collapsed)
  expect('wide table uses the available width', collapsed.tableWidth >= 1100, collapsed)

  await page.click('css=.ps-cmp-diffbar')
  await wait(400)
  const expanded = await page.evaluate(() => ({
    expanded: document.querySelector('.ps-cmp-diffbar')?.getAttribute('aria-expanded'),
    fields: document.querySelectorAll('.ps-cmp-field').length,
  }))
  expect('diffbar expands to field values', expanded.expanded === 'true' && expanded.fields > 0, expanded)
  await capture('compare')

  await page.click('css=.ps-topnav button:nth-child(1)')
  await wait(700)
  if (!(await page.evaluate(() => Boolean(document.querySelector('#ps-simple-id'))))) {
    expect('simple draft reselect', await setSelect('基础预设', draftId))
    await wait(600)
  }
  expect('simple draft is editable', await page.evaluate(() => {
    const input = document.querySelector('#ps-simple-id')
    return Boolean(input) && input.disabled === false
  }))

  const initial = await page.evaluate(() => ({
    value: document.querySelector('#ps-simple-id').value,
    disabled: document.querySelector('#ps-simple-id').disabled,
  }))
  expect('new copy exposes an editable ID', initial.value.length > 0 && initial.disabled === false, initial)

  await page.fill('css=#ps-simple-id', '')
  await wait(300)
  const cleared = await page.evaluate(() => ({
    value: document.querySelector('#ps-simple-id').value,
    placeholder: document.querySelector('#ps-simple-id').placeholder,
    hint: [...document.querySelectorAll('.ps-simple-hint')].map((node) => node.textContent).join(' | '),
    saveDisabled: [...document.querySelectorAll('button')].find((button) => button.textContent === '保存')?.disabled,
  }))
  expect('blank ID stays empty', cleared.value === '', cleared)
  expect('blank ID shows the auto placeholder', cleared.placeholder.includes('留空自动生成'), cleared)
  expect('blank ID hint shows the effective ID', cleared.hint.includes('当前将使用'), cleared)
  expect('blank ID can be saved', cleared.saveDisabled === false, cleared)

  await page.fill('css=#ps-simple-id', 'Bad_ID')
  await page.click('css=#ps-simple-name')
  await wait(300)
  const invalid = await page.evaluate(() => ({
    error: [...document.querySelectorAll('.ps-simple-error')].map((node) => node.textContent).join(' | '),
    saveDisabled: [...document.querySelectorAll('button')].find((button) => button.textContent === '保存')?.disabled,
  }))
  expect('invalid ID reports an error', invalid.error.length > 0, invalid)
  expect('invalid ID blocks save', invalid.saveDisabled === true, invalid)

  await page.fill('css=#ps-simple-id', '')
  await wait(200)
  await page.fill('css=#ps-simple-persona', 'UI smoke persona')
  await page.fill('css=#ps-simple-description', 'UI smoke description')
  await wait(300)
  await page.click('loc=role:button[name="保存"]')
  await wait(1800)
  const saved = await page.evaluate(() => ({
    value: document.querySelector('#ps-simple-id').value,
    disabled: document.querySelector('#ps-simple-id').disabled,
  }))
  expect('save fills the real ID and locks it', saved.value.length > 0 && saved.disabled === true, saved)
  await capture('simple')

  // ---- 界面记忆：离开预设工坊再回来，页面与选择仍在原位 ----
  await page.click('css=.ps-topnav button:nth-child(3)')
  await wait(1400)
  const compareBefore = await page.evaluate(() => ({
    a: document.querySelector('select[aria-label="预设 A"]')?.value ?? null,
    b: document.querySelector('select[aria-label="预设 B"]')?.value ?? null,
  }))
  await page.evaluate(() => document.querySelector('.ps-cmp-toolbar input[type="checkbox"]')?.click())
  await wait(500)

  await page.click('css=.ps-topnav button:nth-child(2)')
  await wait(700)
  const pickedInList = await page.evaluate((id) => {
    const target = [...document.querySelectorAll('.ps-preset code')].find((code) => code.textContent.trim() === id)
    if (!target) return false
    target.closest('.ps-preset').click()
    return true
  }, saved.value)
  expect('saved preset is selectable in the list', pickedInList)
  await wait(400)

  const otherPanel = await page.evaluate(() => {
    const nav = [...document.querySelectorAll('nav')].find((node) => node.querySelector('button[aria-label="预设工坊"]'))
    if (!nav) return null
    return [...nav.querySelectorAll('button[aria-label]')]
      .filter((button) => !button.hasAttribute('aria-haspopup'))
      .map((button) => button.getAttribute('aria-label'))
      .find((label) => label !== '预设工坊') ?? null
  })

  if (otherPanel !== null) {
    await page.evaluate((label) => {
      const button = [...document.querySelectorAll('nav button[aria-label]')]
        .find((node) => node.getAttribute('aria-label') === label)
      if (button) button.click()
    }, otherPanel)
    await wait(1200)
    expect('the workshop unmounts when another panel takes the main slot',
      await page.evaluate(() => !document.querySelector('.ps-topnav')))
    await page.click('css=button[aria-label="预设工坊"]')
    await wait(1400)
  } else {
    warnings.push('no second sidebar panel to switch to; the in-session switch check was skipped')
  }

  const afterReturn = await page.evaluate(() => ({
    page: [...document.querySelectorAll('.ps-topnav button')].findIndex((button) => button.dataset.active === 'true'),
    preset: document.querySelector('.ps-preset-active code')?.textContent?.trim() ?? null,
  }))
  expect('returning keeps the standard page', afterReturn.page === 1, afterReturn)
  expect('returning keeps the selected preset', afterReturn.preset === saved.value, afterReturn)

  await page.click('css=.ps-topnav button:nth-child(3)')
  await wait(1400)
  const compareAfter = await page.evaluate(() => ({
    a: document.querySelector('select[aria-label="预设 A"]')?.value ?? null,
    b: document.querySelector('select[aria-label="预设 B"]')?.value ?? null,
    onlyDiff: document.querySelector('.ps-cmp-toolbar input[type="checkbox"]')?.checked === true,
  }))
  expect('the compare pair survives the round trip',
    compareAfter.a === compareBefore.a && compareAfter.b === compareBefore.b, { compareBefore, compareAfter })
  expect('the compare filter survives the round trip', compareAfter.onlyDiff === true, compareAfter)

  const jsErrors = await page.evaluate(() => window.__uiSmokeErrors || [])
  checks.push({ name: 'page errors', ok: jsErrors.length === 0, detail: jsErrors })
  if (jsErrors.length > 0) throw new Error('page errors')

  // 整页刷新后同样回到原位（localStorage 支撑，与进程内切页无关）。
  await page.goto(url)
  await page.evaluate(() => {
    window.__uiSmokeErrors = []
    addEventListener('error', (event) => window.__uiSmokeErrors.push(String(event.message || event.error || 'error')))
    addEventListener('unhandledrejection', (event) => window.__uiSmokeErrors.push('unhandledrejection: ' + String(event.reason)))
  })
  await wait(2600)
  await dismissDialogs()
  if (await page.evaluate(() => Boolean(document.querySelector('button[aria-label="打开侧边栏"]')))) {
    await page.click('css=button[aria-label="打开侧边栏"]')
    await wait(400)
  }
  await page.click('css=button[aria-label="预设工坊"]')
  await wait(1600)
  const afterReload = await page.evaluate(() => ({
    page: [...document.querySelectorAll('.ps-topnav button')].findIndex((button) => button.dataset.active === 'true'),
    a: document.querySelector('select[aria-label="预设 A"]')?.value ?? null,
    b: document.querySelector('select[aria-label="预设 B"]')?.value ?? null,
  }))
  expect('a page reload lands on the same page', afterReload.page === 2, afterReload)
  expect('a page reload keeps the compare pair',
    afterReload.a === compareBefore.a && afterReload.b === compareBefore.b, afterReload)

  await page.click('css=.ps-topnav button:nth-child(2)')
  await wait(900)
  const presetAfterReload = await page.evaluate(() => document.querySelector('.ps-preset-active code')?.textContent?.trim() ?? null)
  expect('a page reload keeps the selected preset', presetAfterReload === saved.value, presetAfterReload)

  const jsErrorsAfterReload = await page.evaluate(() => window.__uiSmokeErrors || [])
  checks.push({ name: 'page errors after reload', ok: jsErrorsAfterReload.length === 0, detail: jsErrorsAfterReload })
  if (jsErrorsAfterReload.length > 0) throw new Error('page errors after reload')

  console.log(JSON.stringify({
    ok: true,
    checks,
    warnings,
    metrics: { wide, collapsed, expanded, initial, cleared, invalid, saved, compareBefore, afterReturn, compareAfter, afterReload, presetAfterReload },
  }, null, 2))
} catch (error) {
  console.error('UI_SMOKE_FAIL:', error && error.stack ? error.stack : String(error))
  console.error(JSON.stringify({ ok: false, checks, warnings }, null, 2))
  if (outDir && page !== null) {
    try {
      await page.screenshot({ path: `${outDir}/failure.png` })
    } catch {
      // A minimized window can make failure screenshots impossible; the JSON above still has the failing check.
    }
  }
  process.exit(1)
}
