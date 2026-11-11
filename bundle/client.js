/**
 * Preset Studio Client half — a left-sidebar entry and a three-column
 * workbench: presets on the left, the selected preset's composition in the
 * middle, and a package drawer on the right.
 *
 * Only the four shipped presets are read-only for good. Every other preset is
 * a custom preset: one this plugin already manages, or one another layer
 * declares (adopt it to edit), and the user may lock any of them.
 */
window.__ModuleLoader__.load({
  id: 'dsh-preset-builder',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'preset-studio'
    const PANEL_ID = 'preset-studio'
    const BASE = '/plugins/preset-studio'

    const zh = {
      panel: '预设工坊',
      title: '预设工坊',
      subtitle: '用已安装的包和行拼出自定义 Agent 预设；保存后与官方预设同一套声明。',
      refresh: '刷新',
      loading: '读取中…',
      error: '读取失败',
      retry: '重试',
      official: '官方预设',
      officialTag: '官方',
      thirdParty: '第三方',
      readonly: '只读',
      custom: '自定义预设',
      managed: '已托管',
      foreign: '外部',
      locked: '已锁定',
      lock: '锁定',
      unlock: '解锁',
      adopt: '接管',
      adoptConfirm: '接管这个预设？预设工坊会覆盖它的声明行，此后组合由你在这里管理。',
      adoptUnavailable: '无法接管：找不到它的声明行（可能是运行时注册的预设）。',
      lockedHint: '已锁定：预设工坊不会修改或删除它。解锁后可继续管理。',
      foreignHint: '这个预设由其它插件声明。接管后，它的组合在这里可编辑，声明也会写入本 profile。',
      officialHint: '官方预设只读；可以复制一份再改。',
      emptyPresets: '还没有自定义预设。',
      emptyComposition: '选择左侧的预设，或新建一个。',
      composition: '组合',
      yaml: 'YAML',
      packages: '包',
      searchPackages: '搜索包名或行 id',
      saveCheckHint: '保存前会挂载校验；服务类行需 isolate 组。',
      collectableSection: '可收录',
      officialCollectable: '官方 · 可收录',
      thirdPartyCollectable: '非官方 · 可收录',
      thirdPartyHost: '非官方 · Host 已启用',
      thirdPartyHostHint: '这些是已安装的第三方包；它们的行在 Host 中已经启用，收进预设有重复注册风险，因此只展示、不提供收录。',
      presetOnly: '仅预设',
      presetOnlyHint: '该包只被预设使用，不在 Host 装载树里；收录后由预设挂载。',
      hostActive: 'Host 已启用',
      hostActiveSection: 'Host 管理 · 不可收录',
      hostActiveHint: '这些包的行已由 Host 启用，或由平台/环境条件决定；收进预设可能重复挂载，因此只列出、不提供收录。',
      conditionalRow: '条件行',
      collectUsable: '收录可用行',
      collectNone: '该包没有可收录的行（都已在 Host 启用，或只是条件行）。',
      conditionalHint: '条件行由 Host 按平台、环境变量或 profile 状态决定是否挂载；收进预设可能重复挂载，因此不提供收录。',
      filteredHint: '已隐藏当前预设已声明的行。',
      alreadyDeclared: '这些行已经在当前预设里了。',
      emptyPackages: '没有匹配的包。',
      rows: '行',
      noRows: '这个预设还没有任何行。从右侧包抽屉收录开始。',
      broken: '加载失败',
      brokenHint: '这个预设无法激活。按提示移除或修改对应行后重新保存；也可以直接删除预设。',
      newPreset: '新建预设',
      blank: '空白预设',
      blankName: '新预设',
      copyOfficial: '复制官方预设',
      copyCustom: '复制自定义预设',
      copySuffix: '副本',
      deletePreset: '删除预设',
      deleteConfirm: '删除这个预设？已打开它的会话不受影响。',
      discardThenDelete: '有未保存的更改，继续会丢弃它们。继续？',
      save: '保存',
      saving: '保存中…',
      discard: '放弃更改',
      unsaved: '有未保存的更改',
      saved: '已保存',
      saveFailed: '保存失败',
      conflict: '托管块已被别处修改，已重新读取；请重试。',
      warnings: '检查提示',
      viewStructure: '结构视图',
      viewPackage: '包视图',
      addGroup: '新建组',
      addRow: '添加行',
      addRowHint: '手动加入模块行（适合仅预设使用的包，如 persona 人设）；配置按 JSON 对象填写，长字符串会自动变成多行编辑。',
      moduleNamePlaceholder: '模块名，如 @deepseek-ai/dsh-persona',
      rowIdPlaceholder: '行 id（可选）',
      configJsonPlaceholder: '配置 JSON，如 {"section": "..."}',
      addRowConfirm: '添加',
      personaTemplate: '人设模板',
      moduleRequired: '请填写模块名。',
      configJsonInvalid: '配置必须是 JSON 对象。',
      cancel: '取消',
      removeGroup: '删除组',
      isolate: 'isolate',
      isolateHint: 'JSON，例如 {"planMode": true}',
      apply: '应用',
      cancel: '取消',
      enable: '启用',
      disable: '禁用',
      remove: '移出',
      config: '配置',
      resetConfig: '重置为全局',
      platformReadonly: '平台条件行，开关只读',
      disabledLabel: '已禁用',
      conditional: '条件启用',
      copyYaml: '复制 YAML',
      copied: '已复制',
      yamlFailed: '读取 YAML 失败',
      yamlDraft: '草稿预览：保存前只在这里显示，不会写入文件。',
      collect: '收录整包',
      collectRow: '收录此行',
      targetRoot: '收录到：预设根',
      targetGroup: '收录到：组 {id}',
      name: '名称',
      description: '描述',
      order: '排序',
      presetId: '代号',
      presetIdHint: '保存前可改：小写字母、数字、连字符',
      invalidId: '代号只能包含小写字母、数字和连字符。',
      duplicateId: '代号已被占用。',
      unsavedHere: '未保存',
      pending: '等待生效',
      needsRestart: '已保存；当前没有 HMR，重启应用后生效。',
      groupEmpty: '空组',
      noEditablePreset: '请先选择一个可编辑的预设（官方预设与锁定预设不可收录）。',
      stalePackage: '包未安装',
      duplicateRow: '行 id 重复',
    }

    const en = {
      panel: 'Preset Workshop',
      title: 'Preset Workshop',
      subtitle: 'Compose a custom Agent preset from installed packages and rows; saved as ordinary preset declarations.',
      refresh: 'Refresh',
      loading: 'Loading…',
      error: 'Failed to load',
      retry: 'Retry',
      official: 'Official presets',
      officialTag: 'official',
      thirdParty: 'community',
      readonly: 'read-only',
      custom: 'Custom presets',
      managed: 'managed',
      foreign: 'external',
      locked: 'locked',
      lock: 'Lock',
      unlock: 'Unlock',
      adopt: 'Adopt',
      adoptConfirm: 'Adopt this preset? The workshop overrides its declaration row and manages the composition from here.',
      adoptUnavailable: 'Cannot adopt: its declaration row was not found (it may be registered at runtime).',
      lockedHint: 'Locked: the workshop will not modify or delete it. Unlock to manage it again.',
      foreignHint: 'Another layer declares this preset. Adopt it to edit its composition; the declaration is then owned by this profile.',
      officialHint: 'Official presets are read-only; copy one to edit.',
      emptyPresets: 'No custom preset yet.',
      emptyComposition: 'Pick a preset on the left or create one.',
      composition: 'Composition',
      yaml: 'YAML',
      packages: 'Packages',
      searchPackages: 'Search package or row id',
      saveCheckHint: 'Mounted before save; service rows need an isolate group.',
      collectableSection: 'Collectable',
      officialCollectable: 'Official · collectable',
      thirdPartyCollectable: 'Community · collectable',
      thirdPartyHost: 'Community · active in Host',
      thirdPartyHostHint: 'Installed third-party packages whose rows are already active in the Host. Collecting them into a preset would register the same plugin twice, so they are listed without a collect action.',
      presetOnly: 'preset-only',
      presetOnlyHint: 'This package is only mounted by presets (absent from the Host loader); collected rows are mounted by the preset.',
      hostActive: 'in host',
      hostActiveSection: 'Host-managed · not collectable',
      hostActiveHint: 'These rows are active in the Host or decided by a platform/environment condition; collecting them could register the same plugin twice, so they are listed but not collectable.',
      conditionalRow: 'conditional',
      collectUsable: 'Collect available rows',
      collectNone: 'No collectable rows (all active in the Host or conditional).',
      conditionalHint: 'Conditional rows (platform, environment variable or profile context) are decided by the Host; collecting them could register the same plugin twice, so they are not collectable.',
      filteredHint: 'Rows already declared in this preset are hidden.',
      alreadyDeclared: 'Those rows are already declared in this preset.',
      emptyPackages: 'No matching package.',
      rows: 'rows',
      noRows: 'This preset has no row yet. Start by collecting a package.',
      broken: 'failed to load',
      brokenHint: 'This preset cannot activate. Remove or fix the row named above and save again, or delete the preset.',
      newPreset: 'New preset',
      blank: 'Blank preset',
      blankName: 'New preset',
      copyOfficial: 'Copy an official preset',
      copyCustom: 'Copy a custom preset',
      copySuffix: 'copy',
      deletePreset: 'Delete preset',
      deleteConfirm: 'Delete this preset? Sessions already using it keep running.',
      discardThenDelete: 'There are unsaved changes; continuing discards them. Continue?',
      save: 'Save',
      saving: 'Saving…',
      discard: 'Discard',
      unsaved: 'Unsaved changes',
      saved: 'Saved',
      saveFailed: 'Save failed',
      conflict: 'The managed block changed elsewhere; reloaded. Please retry.',
      warnings: 'Checks',
      viewStructure: 'Structure',
      viewPackage: 'Packages',
      addGroup: 'Add group',
      addRow: 'Add row',
      addRowHint: 'Add a module row by hand (useful for preset-only packages such as persona); config is a JSON object, and long strings become multiline editors.',
      moduleNamePlaceholder: 'module, e.g. @deepseek-ai/dsh-persona',
      rowIdPlaceholder: 'row id (optional)',
      configJsonPlaceholder: 'config JSON, e.g. {"section": "..."}',
      addRowConfirm: 'Add',
      personaTemplate: 'Persona template',
      moduleRequired: 'Module name is required.',
      configJsonInvalid: 'Config must be a JSON object.',
      cancel: 'Cancel',
      removeGroup: 'Remove group',
      isolate: 'isolate',
      isolateHint: 'JSON, e.g. {"planMode": true}',
      apply: 'Apply',
      cancel: 'Cancel',
      enable: 'Enable',
      disable: 'Disable',
      remove: 'Remove',
      config: 'Config',
      resetConfig: 'Reset to global',
      platformReadonly: 'Platform-conditional row: read-only',
      disabledLabel: 'disabled',
      conditional: 'conditional',
      copyYaml: 'Copy YAML',
      copied: 'Copied',
      yamlFailed: 'Failed to read YAML',
      yamlDraft: 'Draft preview: shown here only; nothing is written until you save.',
      collect: 'Collect package',
      collectRow: 'Collect row',
      targetRoot: 'Collecting to: preset root',
      targetGroup: 'Collecting to: group {id}',
      name: 'Name',
      description: 'Description',
      order: 'Order',
      presetId: 'ID',
      presetIdHint: 'Editable before saving: lowercase letters, digits, hyphens',
      invalidId: 'ID may only contain lowercase letters, digits and hyphens.',
      duplicateId: 'That ID is already taken.',
      unsavedHere: 'unsaved',
      pending: 'pending',
      needsRestart: 'Saved; HMR is unavailable, restart the application to apply.',
      groupEmpty: 'Empty group',
      noEditablePreset: 'Select an editable preset first (official and locked presets cannot collect rows).',
      stalePackage: 'package not installed',
      duplicateRow: 'duplicate row id',
    }

    const tone = (percent) => `color-mix(in srgb, currentColor ${percent}%, transparent)`

    const STYLE_TEXT = `
      .ps-root button { transition: background-color 120ms ease, border-color 120ms ease, opacity 120ms ease; }
      .ps-root button:not(:disabled):hover { background-color: color-mix(in srgb, currentColor 8%, transparent); }
      .ps-root button:disabled { opacity: 0.45; cursor: default; }
      .ps-root :focus-visible { outline: none; }
      .ps-root input:focus-visible, .ps-root textarea:focus-visible { outline: 2px solid color-mix(in srgb, currentColor 40%, transparent); outline-offset: 0; }
      .ps-scroll { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, currentColor 20%, transparent) transparent; }
      .ps-scroll::-webkit-scrollbar { width: 9px; height: 9px; }
      .ps-scroll::-webkit-scrollbar-thumb { background: color-mix(in srgb, currentColor 18%, transparent); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
      .ps-scroll::-webkit-scrollbar-track { background: transparent; }
      .ps-item-active { box-shadow: inset 2px 0 0 color-mix(in srgb, currentColor 55%, transparent); }
      .ps-card { transition: border-color 120ms ease; }
      .ps-card:hover { border-color: color-mix(in srgb, currentColor 24%, transparent); }
      .ps-row:hover { background-color: color-mix(in srgb, currentColor 8%, transparent); }
      .ps-sticky { position: sticky; top: 0; z-index: 6; background: var(--dsw-alias-bg-base, Canvas); }
    `

    const styles = {
      root: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, color: 'inherit', fontSize: 13, boxSizing: 'border-box' },
      topbar: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px 10px', borderBottom: `1px solid ${tone(10)}`, flexWrap: 'wrap' },
      title: { margin: 0, fontSize: 15, fontWeight: 600 },
      subtitle: { margin: 0, fontSize: 12, opacity: 0.65, flex: '1 1 240px' },
      body: { display: 'flex', flex: '1 1 auto', minHeight: 0 },
      column: { display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', scrollbarGutter: 'stable' },
      left: { width: 240, flex: '0 0 240px', borderRight: `1px solid ${tone(10)}`, padding: '12px 8px', gap: 10 },
      middle: { flex: '1 1 auto', padding: '14px 20px', gap: 10 },
      right: { width: 360, flex: '0 0 360px', borderLeft: `1px solid ${tone(10)}`, padding: '12px 14px', gap: 8 },
      sectionTitle: { fontSize: 11, letterSpacing: '0.04em', opacity: 0.6, textTransform: 'uppercase', margin: '4px 4px 2px' },
      presetItem: { display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 8px', borderRadius: 8, border: '1px solid transparent', background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer', font: 'inherit' },
      presetItemActive: { background: tone(9) },
      presetName: { fontWeight: 550, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
      presetMeta: { fontSize: 11, opacity: 0.6 },
      badge: { fontSize: 10, padding: '1px 6px', borderRadius: 999, background: tone(10), opacity: 0.9, whiteSpace: 'nowrap' },
      badgeWarn: { fontSize: 10, padding: '1px 6px', borderRadius: 999, border: `1px solid ${tone(30)}`, opacity: 0.95, whiteSpace: 'nowrap' },
      card: { border: `1px solid ${tone(12)}`, borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
      rowLine: { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 7px', borderRadius: 7, background: tone(4), flexWrap: 'wrap' },
      rowName: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 550 },
      code: { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: 11, opacity: 0.7 },
      button: { padding: '4px 9px', borderRadius: 7, border: `1px solid ${tone(16)}`, background: tone(6), color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: 12 },
      buttonPrimary: { padding: '4px 12px', borderRadius: 7, border: `1px solid ${tone(30)}`, background: tone(16), color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: 12, fontWeight: 600 },
      buttonGhost: { padding: '2px 6px', borderRadius: 6, border: '1px solid transparent', background: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: 11, opacity: 0.8 },
      search: { width: '100%', padding: '6px 9px', borderRadius: 8, border: `1px solid ${tone(14)}`, background: tone(4), color: 'inherit', font: 'inherit', boxSizing: 'border-box' },
      input: { width: '100%', padding: '5px 8px', borderRadius: 7, border: `1px solid ${tone(14)}`, background: tone(4), color: 'inherit', font: 'inherit', boxSizing: 'border-box', fontSize: 12 },
      textarea: { width: '100%', minHeight: 90, padding: '6px 8px', borderRadius: 7, border: `1px solid ${tone(14)}`, background: tone(4), color: 'inherit', font: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: 11, boxSizing: 'border-box', resize: 'vertical' },
      packageCard: { border: `1px solid ${tone(10)}`, borderRadius: 9, padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 5 },
      packageHead: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
      packageName: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 550 },
      packageTitle: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontSize: 12.5, background: 'transparent', border: 'none', color: 'inherit', textAlign: 'left', padding: 0, cursor: 'pointer' },
      packageModule: { fontSize: 10, opacity: 0.55, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      packageDesc: { fontSize: 11.5, opacity: 0.68, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
      muted: { opacity: 0.62, fontSize: 12 },
      empty: { padding: '18px 8px', opacity: 0.6, textAlign: 'center', fontSize: 12 },
      errorBox: { padding: '10px 12px', borderRadius: 8, background: tone(8), border: `1px solid ${tone(16)}`, fontSize: 12 },
      dot: { width: 7, height: 7, borderRadius: 999, background: 'currentColor', flex: '0 0 auto' },
      group: { border: `1px dashed ${tone(18)}`, borderRadius: 9, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 },
      groupHead: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
      toolbar: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
      menu: { position: 'absolute', zIndex: 20, marginTop: 4, background: 'var(--dsw-alias-bg-base, Canvas)', border: `1px solid ${tone(18)}`, borderRadius: 9, padding: 6, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' },
      menuItem: { padding: '5px 8px', borderRadius: 6, border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit', fontSize: 12 },
      saveBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 9, border: `1px solid ${tone(16)}`, background: 'var(--dsw-alias-bg-base, Canvas)', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 6 },
      yaml: { margin: 0, padding: '10px 12px', borderRadius: 9, border: `1px solid ${tone(12)}`, background: tone(4), fontSize: 11, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', overflow: 'auto', maxHeight: '60vh' },
    }

    // ---------- model helpers ----------

    function packageNameOf(specifier) {
      if (typeof specifier !== 'string') return ''
      if (specifier.startsWith('@')) {
        const parts = specifier.split('/')
        return parts.length >= 2 ? parts[0] + '/' + parts[1] : specifier
      }
      return specifier.split('/')[0]
    }

    function slugify(text) {
      const base = String(text ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      return base.length > 0 ? base : 'preset'
    }

    function uniqueName(base, used) {
      if (!used.has(base)) return base
      let index = 2
      while (used.has(base + '-' + index)) index += 1
      return base + '-' + index
    }

    function clone(value) {
      return value === undefined ? undefined : JSON.parse(JSON.stringify(value))
    }

    function isGroup(row) {
      return row !== null && typeof row === 'object' && row.group === true && Array.isArray(row.config)
    }

    function walkRows(rows, visit) {
      if (!Array.isArray(rows)) return
      for (const row of rows) {
        visit(row)
        if (isGroup(row)) walkRows(row.config, visit)
      }
    }

    function locate(rows, id) {
      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index]
        if (row.id === id) return { list: rows, index, row }
        if (isGroup(row)) {
          const found = locate(row.config, id)
          if (found !== undefined) return found
        }
      }
      return undefined
    }

    function platformLabel(text) {
      const source = String(text ?? '')
      const names = { win32: 'Windows', darwin: 'macOS', linux: 'Linux', freebsd: 'FreeBSD', android: 'Android' }
      const display = (name) => names[name] ?? name
      const positive = []
      const negative = []
      let match
      const eq = /process\.platform\s*===?\s*['"]([a-z0-9]+)['"]/g
      const eqr = /['"]([a-z0-9]+)['"]\s*===?\s*process\.platform/g
      const ne = /process\.platform\s*!==?\s*['"]([a-z0-9]+)['"]/g
      const ner = /['"]([a-z0-9]+)['"]\s*!==?\s*process\.platform/g
      const inc = /\[([^\]]*)\]\s*\.includes\(\s*process\.platform\s*\)/g
      while ((match = eq.exec(source)) !== null) positive.push(match[1])
      while ((match = eqr.exec(source)) !== null) positive.push(match[1])
      while ((match = ne.exec(source)) !== null) negative.push(match[1])
      while ((match = ner.exec(source)) !== null) negative.push(match[1])
      while ((match = inc.exec(source)) !== null) {
        const literals = /['"]([a-z0-9]+)['"]/g
        let name
        while ((name = literals.exec(match[1])) !== null) positive.push(name[1])
      }
      if (positive.length > 0 && negative.length === 0) return '仅 ' + positive.map(display).join(' / ')
      if (negative.length > 0 && positive.length === 0) return '非 ' + negative.map(display).join(' / ')
      return ''
    }

    function rowState(row) {
      if (row.disabled === true) return 'disabled'
      if (row.disabled !== undefined && row.disabled !== null) return 'conditional'
      return 'enabled'
    }

    /**
     * A static-disabled host row is preset-only. A conditional row (platform,
     * environment variable, profile context) is decided by the Host at mount
     * time, so collecting it could register the same plugin twice once the
     * condition flips. Keep collection to the static case.
     */
    function isCollectableRow(row) {
      return row.enabled === false && (row.disabled?.kind === 'static' || row.disabled?.kind === 'none')
    }

    function presetPayload(preset) {
      return {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        order: typeof preset.order === 'number' ? preset.order : undefined,
        plugins: preset.plugins,
      }
    }

    async function requestJson(path, options) {
      const response = await fetch(BASE + path, {
        headers: { accept: 'application/json', ...(options?.body ? { 'content-type': 'application/json' } : {}) },
        ...options,
      })
      const body = await response.json().catch(() => null)
      if (!response.ok || body?.ok === false) {
        const error = new Error(body?.error ?? `HTTP ${response.status}`)
        error.body = body
        error.status = response.status
        throw error
      }
      return body
    }

    // ---------- UI ----------

    function PanelIcon() {
      return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true },
        h('rect', { x: 2, y: 3, width: 12, height: 2.4, rx: 0.8, fill: 'currentColor' }),
        h('rect', { x: 2, y: 6.8, width: 12, height: 2.4, rx: 0.8, fill: 'currentColor', opacity: 0.72 }),
        h('rect', { x: 2, y: 10.6, width: 7, height: 2.4, rx: 0.8, fill: 'currentColor', opacity: 0.5 }))
    }

    function PresetItem({ api, preset, name, badges }) {
      const t = api.t
      const active = preset.id === api.selectedId
      return h('button', {
        type: 'button',
        className: 'ps-hover' + (active ? ' ps-item-active' : ''),
        style: { ...styles.presetItem, ...(active ? styles.presetItemActive : {}) },
        onClick: () => api.selectPreset(preset.id),
      },
        h('span', { style: styles.presetName },
          name,
          ...badges,
          api.presetDirty(preset)
            ? h('span', { style: styles.badgeWarn, title: t('unsaved') }, t('unsavedHere'))
            : null),
        h('span', { style: styles.presetMeta },
          h('code', { style: styles.code }, preset.id),
          preset.order !== undefined ? ' · ' + preset.order : ''))
    }

    function PresetColumn({ api }) {
      const { t, draft, selectedId, dirty } = api
      const official = api.officialPresets
      const foreign = api.foreignPresets
      const stateById = new Map((api.state?.presets ?? []).map((preset) => [preset.id, preset]))
      const customItems = [
        ...draft.map((preset) => ({ preset, managed: true })),
        ...foreign.map((preset) => ({ preset, managed: false })),
      ]
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        h('div', { className: 'ps-sticky', style: { position: 'sticky', top: 0, zIndex: 5, paddingBottom: 4, background: 'var(--dsw-alias-bg-base, Canvas)' } },
          h('button', { type: 'button', style: { ...styles.buttonPrimary, width: '100%' }, onClick: () => api.setMenuOpen(!api.menuOpen) }, '+ ' + t('newPreset')),
          api.menuOpen ? h('div', { style: styles.menu },
            h('button', { type: 'button', style: styles.menuItem, onClick: () => api.createBlank() }, t('blank')),
            official.length > 0 ? h('div', { style: { ...styles.sectionTitle, marginTop: 4 } }, t('copyOfficial')) : null,
            official.map((preset) => h('button', {
              key: 'o-' + preset.id, type: 'button', style: styles.menuItem,
              onClick: () => api.copyPreset(preset),
            }, preset.name || preset.id)),
            (draft.length + foreign.length) > 0 ? h('div', { style: { ...styles.sectionTitle, marginTop: 4 } }, t('copyCustom')) : null,
            draft.map((preset) => h('button', {
              key: 'd-' + preset.id, type: 'button', style: styles.menuItem,
              onClick: () => api.copyPreset(preset),
            }, preset.name || preset.id)),
            foreign.map((preset) => h('button', {
              key: 'f-' + preset.id, type: 'button', style: styles.menuItem,
              onClick: () => api.copyPreset(preset),
            }, preset.name || preset.id))
          ) : null),
        official.length > 0
          ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
              h('div', { style: styles.sectionTitle }, t('official') + ' · ' + official.length),
              official.map((preset) => h(PresetItem, {
                key: preset.id, api, preset,
                name: preset.name || preset.id,
                badges: [h('span', { key: 'ro', style: styles.badge }, t('readonly'))],
              })))
          : null,
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
          h('div', { style: styles.sectionTitle }, t('custom') + ' · ' + customItems.length),
          customItems.length === 0 ? h('div', { style: styles.empty }, t('emptyPresets')) : null,
          customItems.map(({ preset }) => {
            const meta = stateById.get(preset.id)
            const locked = preset.locked === true || meta?.locked === true
            return h(PresetItem, {
              key: preset.id, api, preset,
              name: preset.name || preset.id,
              badges: [
                locked ? h('span', { key: 'l', style: styles.badgeWarn }, t('locked')) : null,
                meta?.broken ? h('span', { key: 'b', style: styles.badgeWarn }, t('broken')) : null,
              ].filter(Boolean),
            })
          })))
    }

    function RowActions({ api, preset, row, readOnly }) {
      const t = api.t
      const state = rowState(row)
      const platform = row.disabled !== undefined && typeof row.disabled === 'object' ? platformLabel(row.disabled.__js) : ''
      return h(React.Fragment, null,
        state === 'conditional'
          ? h('span', { style: styles.badgeWarn, title: t('platformReadonly') }, platform || t('conditional'))
          : state === 'disabled'
            ? h('span', { style: styles.badge }, t('disabledLabel'))
            : null,
        readOnly ? null : h(React.Fragment, null,
          state === 'conditional'
            ? null
            : h('button', {
                type: 'button', style: styles.buttonGhost,
                onClick: () => api.toggleRow(preset.id, row.id),
              }, state === 'disabled' ? t('enable') : t('disable')),
          h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.moveRow(preset.id, row.id, -1) }, '↑'),
          h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.moveRow(preset.id, row.id, 1) }, '↓'),
          h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.toggleConfig(row.id) }, t('config')),
          h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.removeRow(preset.id, row.id) }, t('remove'))))
    }

    const PROSE_KEY = /(section|prefix|suffix|prompt|instruction|instructions|description|content|text|message|template|role|persona|note)/i

    function ConfigEditor({ api, preset, row }) {
      const t = api.t
      const [value, setValue] = React.useState(() => clone(row.config ?? {}))
      const [text, setText] = React.useState(() => JSON.stringify(row.config ?? {}, null, 2))
      const [error, setError] = React.useState('')
      React.useEffect(() => {
        setValue(clone(row.config ?? {}))
        setText(JSON.stringify(row.config ?? {}, null, 2))
        setError('')
      }, [row.id])
      const simpleKeys = Object.entries(value).filter(([, child]) =>
        typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean')
      const update = (next) => {
        setValue(next)
        setText(JSON.stringify(next, null, 2))
        setError('')
      }
      const onText = (next) => {
        setText(next)
        try {
          const parsed = JSON.parse(next)
          if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setValue(parsed)
            setError('')
          }
        } catch {
          // keep the last valid form value while the text is mid-edit
        }
      }
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, padding: '6px 8px' } },
        simpleKeys.length > 0
          ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
              simpleKeys.map(([key, child]) => h('label', {
                key,
                style: { display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11 },
              },
                h('span', { style: { minWidth: 130, opacity: 0.72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, key),
                typeof child === 'boolean'
                  ? h('input', {
                      type: 'checkbox',
                      checked: child,
                      onChange: (event) => update({ ...value, [key]: event.target.checked }),
                    })
                  : typeof child === 'string' && (child.includes('\n') || child.length > 80 || PROSE_KEY.test(key))
                    ? h('textarea', {
                        style: { ...styles.input, minHeight: 76, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 },
                        value: child,
                        onChange: (event) => update({ ...value, [key]: event.target.value }),
                      })
                    : h('input', {
                        style: { ...styles.input, flex: '1 1 auto', maxWidth: 280 },
                        type: typeof child === 'number' ? 'number' : 'text',
                        value: String(child),
                        onChange: (event) => update({
                          ...value,
                          [key]: typeof child === 'number' ? Number(event.target.value) : event.target.value,
                        }),
                      }))))
          : null,
        h('textarea', {
          style: styles.textarea,
          value: text,
          spellCheck: false,
          onChange: (event) => onText(event.target.value),
        }),
        error.length > 0 ? h('div', { style: styles.errorBox }, error) : null,
        h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          h('button', {
            type: 'button', style: styles.button,
            onClick: () => {
              try {
                const parsed = JSON.parse(text)
                if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                  setError('config must be a JSON object')
                  return
                }
                setError('')
                api.applyRowConfig(preset.id, row.id, parsed)
              } catch (cause) {
                setError(String(cause && cause.message ? cause.message : cause))
              }
            },
          }, t('apply')),
          h('button', { type: 'button', style: styles.button, onClick: () => api.resetRowConfig(preset.id, row.id) }, t('resetConfig')),
          h('button', { type: 'button', style: styles.button, onClick: () => api.toggleConfig(row.id) }, t('cancel'))))
    }

    function RowView({ api, preset, row, depth, readOnly }) {
      const t = api.t
      if (isGroup(row)) {
        const open = api.collapsed[row.id] !== true
        return h('div', { style: { ...styles.group, marginLeft: depth * 12 } },
          h('div', { style: styles.groupHead },
            h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.toggleCollapsed(row.id) }, open ? '▾' : '▸'),
            h('code', { style: styles.code }, row.id),
            h('span', { style: styles.badge }, 'cordis:group'),
            row.isolate !== undefined && row.isolate !== null && Object.keys(row.isolate).length > 0
              ? h('span', { style: styles.badge }, 'isolate: ' + Object.keys(row.isolate).join(','))
              : null,
            !readOnly && api.selectedGroupId === row.id ? h('span', { style: styles.badgeWarn }, t('targetGroup', { id: row.id })) : null,
            h('span', { style: { flex: '1 1 auto' } }),
            readOnly ? null : h(React.Fragment, null,
              h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.selectGroup(api.selectedGroupId === row.id ? null : row.id) }, '◎'),
              h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.toggleIsolateEditor(row.id) }, 'isolate'),
              h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.removeGroup(preset.id, row.id) }, t('removeGroup')))),
          !readOnly && api.isolateEditorId === row.id
            ? h(IsolateEditor, { api, preset, row })
            : null,
          open
            ? row.config.length === 0
              ? h('div', { style: styles.muted }, t('groupEmpty'))
              : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
                  row.config.map((child) => h(RowView, { key: child.id, api, preset, row: child, depth: depth + 1, readOnly })))
            : null)
      }
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
        h('div', { className: 'ps-row', style: { ...styles.rowLine, marginLeft: depth * 12, opacity: rowState(row) === 'enabled' ? 1 : 0.62 } },
          h('span', { style: { ...styles.dot, opacity: rowState(row) === 'enabled' ? 0.8 : 0.2 } }),
          h('span', { style: styles.rowName }, row.id),
          h('code', { style: styles.code }, row.name),
          h('span', { style: { flex: '1 1 auto' } }),
          h(RowActions, { api, preset, row, readOnly })),
        !readOnly && api.configEditorId === row.id
          ? h(ConfigEditor, { api, preset, row })
          : null)
    }

    function IsolateEditor({ api, preset, row }) {
      const t = api.t
      const [text, setText] = React.useState(() => JSON.stringify(row.isolate ?? {}, null, 2))
      const [error, setError] = React.useState('')
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 6px' } },
        h('div', { style: styles.muted }, t('isolateHint')),
        h('textarea', { style: styles.textarea, value: text, spellCheck: false, onChange: (event) => setText(event.target.value) }),
        error.length > 0 ? h('div', { style: styles.errorBox }, error) : null,
        h('div', { style: { display: 'flex', gap: 6 } },
          h('button', {
            type: 'button', style: styles.button,
            onClick: () => {
              try {
                const value = JSON.parse(text)
                if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                  setError('isolate must be a JSON object')
                  return
                }
                api.applyIsolate(preset.id, row.id, value)
              } catch (cause) {
                setError(String(cause && cause.message ? cause.message : cause))
              }
            },
          }, t('apply')),
          h('button', { type: 'button', style: styles.button, onClick: () => api.toggleIsolateEditor(null) }, t('cancel'))))
    }

    function PackageView({ api, preset }) {
      const t = api.t
      const [collapsed, setCollapsed] = React.useState({})
      const groups = new Map()
      walkRows(preset.plugins, (row) => {
        if (isGroup(row)) return
        const name = packageNameOf(row.name)
        if (!groups.has(name)) groups.set(name, [])
        groups.get(name).push(row)
      })
      if (groups.size === 0) return h('div', { style: styles.empty }, t('noRows'))
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        [...groups.entries()].map(([name, rows]) => {
          const open = collapsed[name] !== true
          return h('div', { key: name, style: styles.card },
            h('div', { style: styles.groupHead },
              h('button', { type: 'button', style: styles.buttonGhost, onClick: () => setCollapsed({ ...collapsed, [name]: open }) }, open ? '▾' : '▸'),
              h('span', { style: styles.packageName }, name),
              h('span', { style: styles.badge }, rows.length + ' ' + t('rows'))),
            open
              ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
                  rows.map((row) => h('div', { key: row.id, style: styles.rowLine },
                    h('span', { style: { ...styles.dot, opacity: rowState(row) === 'enabled' ? 0.8 : 0.2 } }),
                    h('span', { style: styles.rowName }, row.id),
                    h('span', { style: { flex: '1 1 auto' } }),
                    h(RowActions, { api, preset, row, readOnly: true }))))
              : null)
        }))
    }

    function YAMLView({ api, preset }) {
      const t = api.t
      const [text, setText] = React.useState('')
      const [error, setError] = React.useState('')
      const [copied, setCopied] = React.useState(false)
      const managed = preset.kind === 'managed'
      const saved = (api.state?.presets ?? []).find((item) => item.id === preset.id)
      const persisted = saved !== undefined && saved.kind === 'managed'
      const rowId = typeof saved?.rowId === 'string' ? saved.rowId : undefined
      const normalized = (value) => JSON.stringify({
        name: value?.name ?? '',
        description: value?.description ?? '',
        order: typeof value?.order === 'number' ? value.order : undefined,
        plugins: Array.isArray(value?.plugins) ? value.plugins : [],
      })
      const changed = persisted && normalized(preset) !== normalized(saved)
      const draft = managed && (!persisted || changed)
      React.useEffect(() => {
        let alive = true
        setText('')
        setError('')
        const request = managed
          ? requestJson('/yaml-preview', { method: 'POST', body: JSON.stringify({ preset, rowId }) })
          : requestJson('/yaml?id=' + encodeURIComponent(preset.id))
        request
          .then((body) => { if (alive) setText(body.yaml ?? '') })
          .catch((cause) => { if (alive) setError(String(cause.message ?? cause)) })
        return () => { alive = false }
      }, [preset.id, preset.plugins, managed, rowId])
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        h('div', { style: styles.toolbar },
          h('button', {
            type: 'button', style: styles.button, disabled: text.length === 0,
            onClick: async () => {
              try {
                await navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              } catch {
                setError('clipboard unavailable')
              }
            },
          }, copied ? t('copied') : t('copyYaml')),
          draft ? h('span', { style: styles.badgeWarn }, t('yamlDraft')) : null),
        error.length > 0 ? h('div', { style: styles.errorBox }, t('yamlFailed') + ': ' + error) : null,
        text.length > 0 ? h('pre', { style: styles.yaml }, text) : h('div', { style: styles.empty }, t('loading')))
    }

    function Drawer({ api }) {
      const t = api.t
      const [query, setQuery] = React.useState('')
      const [showActive, setShowActive] = React.useState(false)
      const packages = api.state?.packages ?? []
      const declared = React.useMemo(() => {
        const names = new Set()
        const preset = api.selected
        if (preset !== null && Array.isArray(preset.plugins)) walkRows(preset.plugins, (row) => { if (typeof row.name === 'string') names.add(row.name) })
        return names
      }, [api.selected])
      const ordered = React.useMemo(() => {
        const needle = query.trim().toLowerCase()
        const matches = needle.length === 0 ? packages : packages.filter((pkg) => pkg.name.toLowerCase().includes(needle)
          || String(pkg.title ?? '').toLowerCase().includes(needle)
          || String(pkg.description ?? '').toLowerCase().includes(needle)
          || Object.values(pkg.titles ?? {}).some((text) => String(text).toLowerCase().includes(needle))
          || Object.values(pkg.descriptions ?? {}).some((text) => String(text).toLowerCase().includes(needle))
          || pkg.rows.some((row) => String(row.id).toLowerCase().includes(needle)
            || String(row.moduleName).toLowerCase().includes(needle)))
        return [...matches].sort((left, right) => {
          if (left.official !== right.official) return left.official ? 1 : -1
          return String(left.title || left.name).localeCompare(String(right.title || right.name), 'zh')
        })
      }, [packages, query])
      const listed = ordered.map((pkg) => ({ pkg, rows: pkg.rows.filter((row) => !declared.has(row.moduleName)) }))
      const usable = listed.filter((entry) => entry.rows.some(isCollectableRow))
      const hostManaged = listed.filter((entry) => entry.rows.length > 0
        && entry.rows.every((row) => row.enabled || row.disabled?.kind === 'expression'))
      const thirdUsable = usable.filter((entry) => entry.pkg.official !== true)
      const thirdHost = hostManaged.filter((entry) => entry.pkg.official !== true)
      const officialUsable = usable.filter((entry) => entry.pkg.official === true)
      const officialHost = hostManaged.filter((entry) => entry.pkg.official === true)
      const empty = usable.length === 0 && hostManaged.length === 0
      const section = { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }
      const activeOpen = showActive || query.trim().length > 0
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, flex: '1 1 auto' } },
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8, borderBottom: `1px solid ${tone(9)}` } },
          h('input', { style: styles.search, value: query, placeholder: t('searchPackages'), onChange: (event) => setQuery(event.target.value) }),
          h('div', { style: { ...styles.muted, lineHeight: 1.4 } }, t('saveCheckHint') + (declared.size > 0 ? ' ' + t('filteredHint') : ''))),
        h('div', { className: 'ps-scroll', style: { display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, flex: '1 1 auto', overflowY: 'auto', paddingRight: 6, paddingTop: 4, paddingBottom: 8 } },
          empty
            ? h('div', { style: styles.empty }, t('emptyPackages'))
            : h(React.Fragment, null,
                thirdUsable.length > 0
                  ? h('div', { style: section },
                      h('div', { style: styles.sectionTitle }, t('thirdPartyCollectable') + ' · ' + thirdUsable.length),
                      thirdUsable.map((entry) => h(PackageCard, { key: entry.pkg.name, api, pkg: entry.pkg, rows: entry.rows })))
                  : null,
                thirdHost.length > 0
                  ? h('div', { style: section },
                      h('div', { style: styles.sectionTitle }, t('thirdPartyHost') + ' · ' + thirdHost.length),
                      h('div', { style: { ...styles.muted, lineHeight: 1.4 } }, t('thirdPartyHostHint')),
                      thirdHost.map((entry) => h(PackageCard, { key: entry.pkg.name, api, pkg: entry.pkg, rows: entry.rows })))
                  : null,
                officialUsable.length > 0
                  ? h('div', { style: section },
                      h('div', { style: styles.sectionTitle }, t('officialCollectable') + ' · ' + officialUsable.length),
                      officialUsable.map((entry) => h(PackageCard, { key: entry.pkg.name, api, pkg: entry.pkg, rows: entry.rows })))
                  : null,
                officialHost.length > 0
                  ? h('div', { style: section },
                      h('button', {
                        type: 'button',
                        style: { ...styles.sectionTitle, background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 },
                        onClick: () => setShowActive(!showActive),
                      }, (activeOpen ? '▾ ' : '▸ ') + t('hostActiveSection') + ' · ' + officialHost.length),
                      activeOpen ? h('div', { style: { ...styles.muted, lineHeight: 1.4 } }, t('hostActiveHint')) : null,
                      activeOpen ? officialHost.map((entry) => h(PackageCard, { key: entry.pkg.name, api, pkg: entry.pkg, rows: entry.rows })) : null)
                  : null)))
    }

    function PackageCard({ api, pkg, rows }) {
      const t = api.t
      const [open, setOpen] = React.useState(false)
      const collectable = rows.filter(isCollectableRow)
      const mixed = collectable.length > 0 && collectable.length < rows.length
      const title = api.resolveText(pkg.titles) ?? pkg.title ?? pkg.name
      const description = api.resolveText(pkg.descriptions) ?? pkg.description ?? ''
      const displayName = title && title !== pkg.name ? title : pkg.name
      return h('div', { className: 'ps-card', style: styles.packageCard },
        h('div', { style: styles.packageHead },
          h('button', { type: 'button', style: styles.buttonGhost, onClick: () => setOpen(!open) }, open ? '▾' : '▸'),
          h('button', { type: 'button', style: styles.packageTitle, title: pkg.name, onClick: () => setOpen(!open) }, displayName),
          h('span', { style: pkg.official ? styles.badge : styles.badgeWarn }, pkg.official ? t('officialTag') : t('thirdParty')),
          pkg.presetOnly === true ? h('span', { style: styles.badgeWarn, title: t('presetOnlyHint') }, t('presetOnly')) : null,
          collectable.length === 0
            ? rows.some((row) => row.enabled)
              ? h('span', { style: styles.badgeWarn }, t('hostActive'))
              : h('span', { style: styles.badgeWarn, title: t('conditionalHint') }, t('conditionalRow'))
            : null,
          h('span', { style: styles.badge }, rows.length + ' ' + t('rows'))),
        displayName !== pkg.name ? h('div', { style: styles.packageModule, title: pkg.name }, pkg.name) : null,
        description.length > 0 ? h('div', { style: styles.packageDesc, title: description }, description) : null,
        h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          collectable.length === 0
            ? h('div', { style: styles.muted }, t('collectNone'))
            : h('button', {
                type: 'button', style: styles.button,
                onClick: () => api.collectPackage(pkg, mixed ? collectable : undefined),
              }, mixed ? t('collectUsable') : t('collect'))),
        open ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          rows.map((row) => h('div', { key: row.id + ':' + row.moduleName, style: { display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, flexWrap: 'wrap' } },
            h('code', { style: { ...styles.code, flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, row.id || row.moduleName),
            row.enabled ? h('span', { style: styles.badgeWarn }, t('hostActive')) : null,
            row.disabled?.kind === 'platform' ? h('span', { style: styles.badgeWarn }, row.disabled.label) : null,
            row.disabled?.kind === 'expression' ? h('span', { style: styles.badgeWarn, title: t('conditionalHint') }, t('conditional')) : null,
            isCollectableRow(row) ? h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.collectPackage(pkg, [row]) }, t('collectRow')) : null)))
          : null)
    }

    function AddRowView({ api, preset }) {
      const t = api.t
      const [name, setName] = React.useState('')
      const [id, setId] = React.useState('')
      const [config, setConfig] = React.useState('')
      const [error, setError] = React.useState('')
      const fillPersona = () => {
        setName('@deepseek-ai/dsh-persona')
        setId('persona')
        setConfig(JSON.stringify({ prefix: '' }, null, 2))
        setError('')
      }
      const submit = () => {
        if (name.trim().length === 0) {
          setError(t('moduleRequired'))
          return
        }
        let parsed
        if (config.trim().length > 0) {
          try {
            parsed = JSON.parse(config)
          } catch {
            setError(t('configJsonInvalid'))
            return
          }
          if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            setError(t('configJsonInvalid'))
            return
          }
        }
        api.addRow(preset.id, { name: name.trim(), id: id.trim(), config: parsed })
      }
      return h('div', { style: styles.card },
        h('div', { style: styles.sectionTitle }, t('addRow')),
        h('div', { style: styles.muted }, t('addRowHint')),
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
          h('input', {
            style: { ...styles.input, flex: '1 1 220px' },
            value: name,
            placeholder: t('moduleNamePlaceholder'),
            onChange: (event) => setName(event.target.value),
          }),
          h('input', {
            style: { ...styles.input, flex: '0 1 150px' },
            value: id,
            placeholder: t('rowIdPlaceholder'),
            onChange: (event) => setId(event.target.value),
          })),
        h('textarea', {
          style: styles.textarea,
          value: config,
          placeholder: t('configJsonPlaceholder'),
          spellCheck: false,
          onChange: (event) => setConfig(event.target.value),
        }),
        error.length > 0 ? h('div', { style: styles.errorBox }, error) : null,
        h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' } },
          h('button', { type: 'button', style: styles.buttonPrimary, onClick: submit }, t('addRowConfirm')),
          h('button', { type: 'button', style: styles.button, onClick: fillPersona }, t('personaTemplate')),
          h('span', { style: { flex: '1 1 auto' } }),
          h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.setAddRowOpen(false) }, t('cancel'))))
    }

    function PresetIdField({ api, preset }) {
      const t = api.t
      const [text, setText] = React.useState(preset.id)
      const [error, setError] = React.useState('')
      React.useEffect(() => {
        setText(preset.id)
        setError('')
      }, [preset.id])
      const commit = () => {
        const next = text.trim()
        if (next === preset.id) {
          setError('')
          return
        }
        const problem = api.renamePreset(preset.id, next)
        setError(problem ?? '')
      }
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
        h('span', { style: { ...styles.muted, fontSize: 11 } }, t('presetId')),
        h('input', {
          style: { ...styles.input, width: 170, fontSize: 11, fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace' },
          value: text,
          spellCheck: false,
          'aria-label': t('presetId'),
          onChange: (event) => {
            setText(event.target.value)
            setError('')
          },
          onBlur: commit,
          onKeyDown: (event) => {
            if (event.key === 'Enter') commit()
          },
        }),
        error.length > 0
          ? h('span', { style: { ...styles.badgeWarn, fontSize: 10 } }, error)
          : h('span', { style: { ...styles.muted, fontSize: 10 } }, t('presetIdHint')))
    }

    function SaveBar({ api }) {
      const t = api.t
      const dirty = api.dirty
      return h('div', { style: styles.saveBar },
        h('span', { style: dirty ? styles.badgeWarn : styles.badge }, dirty ? t('unsaved') : t('saved')),
        h('span', { style: { flex: '1 1 auto' } }),
        h('button', { type: 'button', style: styles.button, disabled: !dirty || api.saving, onClick: () => api.discard() }, t('discard')),
        h('button', { type: 'button', style: styles.buttonPrimary, disabled: !dirty || api.saving, onClick: () => api.save() }, api.saving ? t('saving') : t('save')))
    }

    function Editor({ api }) {
      const t = api.t
      const preset = api.selected
      if (preset === null) return h('div', { style: styles.empty }, t('emptyComposition'))
      const official = preset.kind === 'official'
      const managed = preset.kind === 'managed'
      const locked = preset.locked === true
      const editable = managed && !locked
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        h('div', { style: styles.card },
          h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
            editable
              ? h('input', { style: { ...styles.input, flex: '1 1 180px', minWidth: 120 }, value: preset.name ?? '', placeholder: t('name'), onChange: (event) => api.updatePreset(preset.id, { name: event.target.value }) })
              : h('strong', { style: { flex: '1 1 180px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, preset.name || preset.id),
            editable
              ? h('label', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.75 } },
                  h('span', null, t('order')),
                  h('input', { style: { ...styles.input, width: 64, flex: '0 0 64px' }, type: 'number', value: preset.order ?? '', placeholder: t('order'), onChange: (event) => api.updatePreset(preset.id, { order: event.target.value === '' ? undefined : Number(event.target.value) }) }))
              : preset.order !== undefined ? h('span', { style: styles.badge }, 'order ' + preset.order) : null,
            h('span', { style: { flex: '1 1 auto' } }),
            !official && locked ? h('button', { type: 'button', style: styles.button, onClick: () => api.setLocked(preset.id, false) }, t('unlock')) : null,
            !official && !locked ? h('button', { type: 'button', style: styles.button, onClick: () => api.setLocked(preset.id, true) }, t('lock')) : null,
            !official && !locked ? h('button', { type: 'button', style: styles.button, onClick: () => api.deletePreset(preset.id) }, t('deletePreset')) : null,
            !official && !managed && !locked && preset.canAdopt ? h('button', { type: 'button', style: styles.buttonPrimary, onClick: () => api.adoptPreset(preset.id) }, t('adopt')) : null),
          h('div', { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
            api.canRenamePreset(preset.id)
              ? h(PresetIdField, { api, preset })
              : h('code', { style: styles.code }, preset.id),
            official ? h('span', { style: styles.badge }, t('officialTag')) : null,
            !official && !managed && !locked ? h('span', { style: styles.badge }, t('foreign')) : null,
            locked ? h('span', { style: styles.badgeWarn }, t('locked')) : null,
            preset.broken ? h('span', { style: styles.badgeWarn }, t('broken')) : null),
          editable
            ? h('textarea', { style: { ...styles.input, minHeight: 38, resize: 'vertical' }, value: preset.description ?? '', placeholder: t('description'), onChange: (event) => api.updatePreset(preset.id, { description: event.target.value }) })
            : h('div', { style: styles.muted }, official ? t('officialHint') : locked ? t('lockedHint') : t('foreignHint')),
          !editable && typeof preset.description === 'string' && preset.description.length > 0
            ? h('div', { style: styles.muted }, preset.description)
            : null,
          !official && !managed && !locked && !preset.canAdopt
            ? h('div', { style: styles.muted }, t('adoptUnavailable'))
            : null),
        editable ? h(SaveBar, { api }) : null,
        preset.broken
          ? h('div', { style: styles.errorBox },
              h('div', { style: { fontWeight: 600, marginBottom: 4 } }, t('broken') + ': ' + preset.broken),
              h('div', { style: styles.muted }, t('brokenHint')))
          : null,
        api.notice !== null ? h('div', { style: styles.errorBox }, api.notice) : null,
        h('div', { style: styles.toolbar },
          h('button', { type: 'button', style: api.tab === 'compose' ? styles.buttonPrimary : styles.button, onClick: () => api.setTab('compose') }, t('composition')),
          h('button', { type: 'button', style: api.tab === 'yaml' ? styles.buttonPrimary : styles.button, onClick: () => api.setTab('yaml') }, t('yaml')),
          api.tab === 'compose' && managed ? h('span', { style: { width: 12 } }) : null,
          api.tab === 'compose' && managed ? h('button', { type: 'button', style: api.view === 'structure' ? styles.buttonPrimary : styles.button, onClick: () => api.setView('structure') }, t('viewStructure')) : null,
          api.tab === 'compose' && managed ? h('button', { type: 'button', style: api.view === 'package' ? styles.buttonPrimary : styles.button, onClick: () => api.setView('package') }, t('viewPackage')) : null,
          api.tab === 'compose' && managed ? h('span', { style: { flex: '1 1 auto' } }) : null,
          api.tab === 'compose' && managed && !locked ? h('span', { style: styles.muted }, api.selectedGroupId === null ? t('targetRoot') : t('targetGroup', { id: api.selectedGroupId })) : null,
          api.tab === 'compose' && editable ? h('button', { type: 'button', style: styles.button, onClick: () => api.setAddRowOpen(!api.addRowOpen) }, t('addRow')) : null,
          api.tab === 'compose' && editable ? h('button', { type: 'button', style: styles.button, onClick: () => api.addGroup(preset.id) }, t('addGroup')) : null),
        editable && api.tab === 'compose' && api.addRowOpen ? h(AddRowView, { api, preset }) : null,
        api.tab === 'yaml'
          ? h(YAMLView, { api, preset })
          : !managed
            ? h('div', { style: styles.empty }, official ? t('officialHint') : locked ? t('lockedHint') : t('foreignHint'))
            : preset.plugins.length === 0
              ? h('div', { style: styles.empty }, t('noRows'))
              : api.view === 'structure'
                ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                    preset.plugins.map((row) => h(RowView, { key: row.id, api, preset, row, depth: 0, readOnly: locked })))
                : h(PackageView, { api, preset }),
        editable && api.warnings.length > 0
          ? h('div', { style: styles.card },
              h('div', { style: styles.sectionTitle }, t('warnings') + ' · ' + api.warnings.length),
              api.warnings.map((warning, index) => h('div', { key: index, style: styles.muted }, '• ' + warning)))
          : null)
    }

    function StudioPage({ t, resolveText }) {
      const [state, setState] = React.useState(null)
      const [draft, setDraft] = React.useState([])
      const [saved, setSaved] = React.useState([])
      const [baseRevision, setBaseRevision] = React.useState('')
      const [selectedId, setSelectedId] = React.useState(null)
      const [view, setView] = React.useState('structure')
      const [tab, setTab] = React.useState('compose')
      const [menuOpen, setMenuOpen] = React.useState(false)
      const [saving, setSaving] = React.useState(false)
      const [notice, setNotice] = React.useState(null)
      const [status, setStatus] = React.useState({ phase: 'loading', message: '' })
      const [collapsed, setCollapsed] = React.useState({})
      const [configEditorId, setConfigEditorId] = React.useState(null)
      const [isolateEditorId, setIsolateEditorId] = React.useState(null)
      const [selectedGroupId, setSelectedGroupId] = React.useState(null)
      const [addRowOpen, setAddRowOpen] = React.useState(false)

      const dirty = React.useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved])

      const load = React.useCallback(async () => {
        setStatus({ phase: 'loading', message: '' })
        try {
          const body = await requestJson('/state')
          const managed = (body.presets ?? [])
            .filter((preset) => preset.kind === 'managed')
            .map((preset) => ({
              id: preset.id,
              name: preset.name ?? '',
              description: preset.description ?? '',
              order: preset.order,
              plugins: Array.isArray(preset.plugins) ? preset.plugins : [],
              locked: preset.locked === true,
            }))
          setState(body)
          setDraft(managed)
          setSaved(clone(managed))
          setBaseRevision(body.revision ?? '')
          setSelectedId((current) => (body.presets ?? []).some((preset) => preset.id === current)
            ? current
            : ((body.presets ?? []).find((preset) => preset.kind !== 'official')?.id ?? (body.presets ?? [])[0]?.id ?? null))
          setStatus({ phase: 'ready', message: '' })
        } catch (cause) {
          setStatus({ phase: 'error', message: String(cause && cause.message ? cause.message : cause) })
        }
      }, [])

      React.useEffect(() => { void load() }, [load])

      const selected = React.useMemo(() => {
        const own = draft.find((preset) => preset.id === selectedId)
        if (own !== undefined) {
          const meta = (state?.presets ?? []).find((preset) => preset.id === own.id)
          return { ...own, kind: 'managed', locked: own.locked === true || meta?.locked === true, broken: meta?.broken }
        }
        const meta = (state?.presets ?? []).find((preset) => preset.id === selectedId)
        return meta ?? null
      }, [draft, state, selectedId])

      const officialPresets = React.useMemo(() => (state?.presets ?? []).filter((preset) => preset.kind === 'official'), [state])
      const foreignPresets = React.useMemo(() => (state?.presets ?? []).filter((preset) => preset.kind === 'foreign'), [state])

      const updatePreset = (id, patch) => setDraft((prev) => prev.map((preset) => preset.id === id ? { ...preset, ...patch } : preset))

      const savedById = React.useMemo(() => new Map(saved.map((preset) => [preset.id, preset])), [saved])
      const presetDirty = (preset) => {
        if (!draft.some((entry) => entry.id === preset.id)) return false
        const base = savedById.get(preset.id)
        return base === undefined || JSON.stringify(base) !== JSON.stringify(preset)
      }
      const canRenamePreset = (id) => !saved.some((preset) => preset.id === id) && draft.some((preset) => preset.id === id)
      const renamePreset = (oldId, rawId) => {
        const next = String(rawId ?? '').trim()
        if (next === oldId) return undefined
        if (!/^[a-z0-9][a-z0-9-]*$/.test(next)) return t('invalidId')
        if (draft.some((preset) => preset.id === next) || (state?.presets ?? []).some((preset) => preset.id === next)) {
          return t('duplicateId')
        }
        setDraft((prev) => prev.map((preset) => preset.id === oldId ? { ...preset, id: next } : preset))
        if (selectedId === oldId) setSelectedId(next)
        return undefined
      }

      const mutatePlugins = (id, mutate) => setDraft((prev) => prev.map((preset) => {
        if (preset.id !== id) return preset
        const plugins = clone(preset.plugins)
        mutate(plugins)
        return { ...preset, plugins }
      }))

      const usedRowIds = (preset) => {
        const used = new Set()
        walkRows(preset.plugins, (row) => { if (typeof row.id === 'string') used.add(row.id) })
        return used
      }

      const nextOrder = () => {
        const values = draft.map((preset) => typeof preset.order === 'number' ? preset.order : 0)
        return values.length === 0 ? 1 : Math.max(...values) + 1
      }

      const createPreset = (source) => {
        const used = new Set(draft.map((preset) => preset.id))
        const id = uniqueName(slugify((source?.id ?? 'preset') + (source === undefined ? '' : '-copy')), used)
        const preset = {
          id,
          name: source === undefined ? t('blankName') : (source.name || source.id) + ' ' + t('copySuffix'),
          description: source?.description ?? '',
          order: nextOrder(),
          plugins: source?.plugins ? clone(source.plugins) : [],
          locked: false,
        }
        setDraft((prev) => [...prev, preset])
        setSelectedId(id)
        setMenuOpen(false)
        setNotice(null)
      }

      const copyPreset = async (source) => {
        setMenuOpen(false)
        try {
          if (Array.isArray(source.plugins)) {
            createPreset(source)
            return
          }
          const body = await requestJson('/preset-source?id=' + encodeURIComponent(source.id))
          createPreset({ id: source.id, name: source.name || source.id, description: body.description, plugins: body.plugins })
        } catch (cause) {
          setNotice(String(cause && cause.message ? cause.message : cause))
        }
      }

      const guardDirty = () => !dirty || window.confirm(t('discardThenDelete'))

      const deletePreset = async (id) => {
        if (!window.confirm(t('deleteConfirm'))) return
        if (!guardDirty()) return
        try {
          const body = await requestJson('/presets/delete', {
            method: 'POST',
            body: JSON.stringify({ id, revision: baseRevision }),
          })
          if (body.needsRestart) setNotice(t('needsRestart'))
          else setNotice(null)
          await load()
        } catch (cause) {
          setNotice(String(cause && cause.message ? cause.message : cause))
        }
      }

      const adoptPreset = async (id) => {
        if (!window.confirm(t('adoptConfirm'))) return
        if (!guardDirty()) return
        try {
          await requestJson('/presets/adopt', {
            method: 'POST',
            body: JSON.stringify({ id, revision: baseRevision }),
          })
          setSelectedId(id)
          setNotice(null)
          await load()
        } catch (cause) {
          setNotice(String(cause && cause.message ? cause.message : cause))
        }
      }

      const setLocked = async (id, locked) => {
        if (!guardDirty()) return
        try {
          await requestJson('/presets/lock', {
            method: 'POST',
            body: JSON.stringify({ id, locked, revision: baseRevision }),
          })
          await load()
        } catch (cause) {
          setNotice(String(cause && cause.message ? cause.message : cause))
        }
      }

      const save = async () => {
        setSaving(true)
        setNotice(null)
        try {
          const body = await requestJson('/save', {
            method: 'POST',
            body: JSON.stringify({ revision: baseRevision, presets: draft.map(presetPayload) }),
          })
          setNotice(body.needsRestart ? t('needsRestart') : null)
          await load()
        } catch (cause) {
          const body = cause.body
          if (body?.problems) setNotice(t('saveFailed') + ': ' + body.problems.join('; '))
          else if (body?.conflict) {
            setNotice(t('conflict'))
            await load()
          } else setNotice(t('saveFailed') + ': ' + String(cause.message ?? cause))
        } finally {
          setSaving(false)
        }
      }

      const discard = () => {
        if (!window.confirm(t('discardThenDelete'))) return
        setDraft(clone(saved))
        setNotice(null)
        setSelectedId((current) => saved.some((preset) => preset.id === current) ? current : (saved[0]?.id ?? null))
      }

      const toggleRow = (presetId, rowId) => mutatePlugins(presetId, (plugins) => {
        const found = locate(plugins, rowId)
        if (found === undefined) return
        const { row } = found
        if (row.disabled !== undefined && typeof row.disabled === 'object') return
        if (row.disabled === true) delete row.disabled
        else row.disabled = true
      })

      const removeRow = (presetId, rowId) => mutatePlugins(presetId, (plugins) => {
        const found = locate(plugins, rowId)
        if (found !== undefined) found.list.splice(found.index, 1)
      })

      const moveRow = (presetId, rowId, delta) => mutatePlugins(presetId, (plugins) => {
        const found = locate(plugins, rowId)
        if (found === undefined) return
        const target = found.index + delta
        if (target < 0 || target >= found.list.length) return
        const [row] = found.list.splice(found.index, 1)
        found.list.splice(target, 0, row)
      })

      const applyRowConfig = (presetId, rowId, config) => mutatePlugins(presetId, (plugins) => {
        const found = locate(plugins, rowId)
        if (found !== undefined) found.row.config = config
        setConfigEditorId(null)
      })

      const resetRowConfig = (presetId, rowId) => mutatePlugins(presetId, (plugins) => {
        const found = locate(plugins, rowId)
        if (found === undefined) return
        const pkg = (state?.packages ?? []).find((candidate) => candidate.name === packageNameOf(found.row.name))
        const global = pkg?.rows.find((row) => row.moduleName === found.row.name && row.id === found.row.id)
          ?? pkg?.rows.find((row) => row.moduleName === found.row.name)
        if (global?.config !== undefined && global.config !== null) found.row.config = clone(global.config)
        else delete found.row.config
      })

      const addGroup = (presetId) => mutatePlugins(presetId, (plugins) => {
        const used = new Set()
        walkRows(plugins, (row) => used.add(row.id))
        const id = uniqueName('group', used)
        plugins.push({ id, name: 'cordis:group', group: true, config: [] })
      })

      const removeGroup = (presetId, groupId) => {
        if (!window.confirm(t('removeGroup') + '? ' + groupId)) return
        mutatePlugins(presetId, (plugins) => {
          const found = locate(plugins, groupId)
          if (found !== undefined) found.list.splice(found.index, 1)
        })
        if (selectedGroupId === groupId) setSelectedGroupId(null)
      }

      const applyIsolate = (presetId, groupId, value) => mutatePlugins(presetId, (plugins) => {
        const found = locate(plugins, groupId)
        if (found === undefined) return
        if (Object.keys(value).length === 0) delete found.row.isolate
        else found.row.isolate = value
        setIsolateEditorId(null)
      })

      const collectPackage = (pkg, onlyRows) => {
        const target = selected
        if (target === null || target.kind !== 'managed' || target.locked === true) {
          setNotice(t('noEditablePreset'))
          return
        }
        const declared = new Set()
        walkRows(target.plugins, (row) => { if (typeof row.name === 'string') declared.add(row.name) })
        const sourceRows = (onlyRows ?? pkg.rows).filter((row) => isCollectableRow(row) && !declared.has(row.moduleName))
        if (sourceRows.length === 0) {
          setNotice(t('alreadyDeclared'))
          return
        }
        mutatePlugins(target.id, (plugins) => {
          const used = new Set()
          walkRows(plugins, (row) => used.add(row.id))
          const rows = sourceRows.map((row) => {
            const base = row.id || slugify(row.moduleName) || 'row'
            const id = uniqueName(base, used)
            used.add(id)
            const next = { id, name: row.moduleName }
            if (row.config !== undefined && row.config !== null && Object.keys(row.config).length > 0) next.config = clone(row.config)
            return next
          })
          if (rows.length === 0) return
          const group = selectedGroupId === null ? undefined : locate(plugins, selectedGroupId)
          const list = group !== undefined ? group.row.config : plugins
          if (rows.length === 1) {
            list.push(rows[0])
            return
          }
          const usedGroups = new Set(plugins.filter((row) => isGroup(row)).map((row) => row.id))
          const gid = uniqueName('group-' + slugify(pkg.name), usedGroups)
          list.push({ id: gid, name: 'cordis:group', group: true, config: rows })
        })
      }

      const addRow = (presetId, { name, id, config }) => {
        const target = selected
        if (target === null || target.kind !== 'managed' || target.locked === true) {
          setNotice(t('noEditablePreset'))
          return
        }
        mutatePlugins(presetId, (plugins) => {
          const used = new Set()
          walkRows(plugins, (row) => used.add(row.id))
          const rowId = uniqueName(id || slugify(packageNameOf(name)) || 'row', used)
          const row = { id: rowId, name }
          if (config !== undefined && config !== null && Object.keys(config).length > 0) row.config = config
          const group = selectedGroupId === null ? undefined : locate(plugins, selectedGroupId)
          const list = group !== undefined ? group.row.config : plugins
          list.push(row)
        })
        setAddRowOpen(false)
      }

      const warnings = React.useMemo(() => {
        const issues = []
        for (const preset of draft) {
          if (preset.locked === true) continue
          if (typeof preset.name !== 'string' || preset.name.trim().length === 0) issues.push(preset.id + ': ' + t('name') + ' —')
          const meta = (state?.presets ?? []).find((savedPreset) => savedPreset.id === preset.id)
          if (typeof meta?.broken === 'string' && meta.broken.length > 0) issues.push(preset.id + ': ' + meta.broken)
          const seen = new Set()
          walkRows(preset.plugins, (row) => {
            if (seen.has(row.id)) issues.push(preset.id + ': ' + t('duplicateRow') + ' ' + row.id)
            seen.add(row.id)
          })
        }
        return issues
      }, [draft, state])

      const api = {
        t, state, draft, selectedId, selected, dirty, saving, notice, status,
        resolveText,
        view, tab, menuOpen, collapsed, configEditorId, isolateEditorId, selectedGroupId, warnings, baseRevision,
        officialPresets, foreignPresets,
        setMenuOpen, setView, setTab, setNotice,
        load, selectPreset: (id) => setSelectedId(id),
        brokenOf: (id) => (state?.presets ?? []).find((preset) => preset.id === id)?.broken,
        createBlank: () => createPreset(undefined), copyPreset,
        deletePreset, adoptPreset, setLocked,
        updatePreset, save, discard,
        presetDirty, canRenamePreset, renamePreset,
        toggleRow, removeRow, moveRow, applyRowConfig, resetRowConfig,
        toggleConfig: (id) => setConfigEditorId((current) => current === id ? null : id),
        addGroup, removeGroup,
        addRowOpen, setAddRowOpen, addRow,
        toggleIsolateEditor: (id) => setIsolateEditorId((current) => current === id ? null : id),
        applyIsolate,
        selectGroup: (id) => setSelectedGroupId(id),
        collectPackage,
        toggleCollapsed: (id) => setCollapsed((prev) => ({ ...prev, [id]: prev[id] !== true })),
      }

      if (status.phase === 'loading' && state === null) return h('div', { style: styles.empty }, t('loading'))
      if (status.phase === 'error') {
        return h('div', { style: { padding: 18, display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { style: styles.errorBox }, t('error') + ': ' + status.message),
          h('button', { type: 'button', style: styles.button, onClick: () => void load() }, t('retry')))
      }

      return h('div', { className: 'ps-root', style: styles.root },
        h('div', { style: styles.topbar },
          h('h1', { style: styles.title }, t('title')),
          h('p', { style: styles.subtitle }, t('subtitle')),
          state?.profile?.name ? h('span', { style: styles.badge }, 'profile: ' + state.profile.name) : null,
          state?.hmr === false ? h('span', { style: styles.badgeWarn }, 'HMR off') : null,
          h('button', { type: 'button', style: styles.button, onClick: () => void load() }, t('refresh'))),
        h('div', { style: styles.body },
          h('aside', { className: 'ps-scroll', style: { ...styles.column, ...styles.left } }, h(PresetColumn, { api })),
          h('main', { className: 'ps-scroll', style: { ...styles.column, ...styles.middle } }, h(Editor, { api })),
          h('aside', { style: { ...styles.right, display: 'flex', flexDirection: 'column', minHeight: 0 } },
            h('div', { style: styles.sectionTitle }, (t('packages') + ' · ' + (state?.packages?.length ?? 0))),
            h(Drawer, { api }))))
    }

    async function sidebarEntryEnabled() {
      try {
        const response = await fetch(BASE + '/config', {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(4000),
        })
        if (!response.ok) return true
        const body = await response.json()
        return body?.config?.sidebarEntry !== false
      } catch {
        return true
      }
    }

    async function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'preset-studio: dictionaries')
      ctx.effect(() => {
        const style = document.createElement('style')
        style.setAttribute('data-preset-studio', '')
        style.textContent = STYLE_TEXT
        document.head.append(style)
        return () => { style.remove() }
      }, 'preset-studio: styles')
      const t = ctx.locale.bind(NS)
      const resolveText = (value) => {
        try {
          if (ctx.locale !== undefined && typeof ctx.locale.resolveText === 'function') {
            const text = ctx.locale.resolveText(value)
            if (typeof text === 'string' && text.length > 0) return text
          }
        } catch {
          // fall through to the static map
        }
        if (typeof value === 'string') return value
        if (value !== null && typeof value === 'object') {
          for (const key of ['zh', 'zh-cn', 'en']) {
            if (typeof value[key] === 'string' && value[key].length > 0) return value[key]
          }
        }
        return undefined
      }
      if (!(await sidebarEntryEnabled())) return

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 120,
        label: () => t('panel'),
        locale: NS,
      }, PanelIcon))

      ctx.slots.inject('main', function* () {
        yield ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, () => h(StudioPage, { t, resolveText }))
      })
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})
