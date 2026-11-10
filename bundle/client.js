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
  id: 'dsh-preset-studio',
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
      saveCheckHint: '保存前会实际挂载校验；服务类行需放进带 isolate 的组。',
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
      collect: '收录整包',
      collectRow: '收录此行',
      targetRoot: '收录到：预设根',
      targetGroup: '收录到：组 {id}',
      name: '名称',
      description: '描述',
      order: '排序',
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
      saveCheckHint: 'Every save mounts each preset once; rows that provide services need an isolate group.',
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
      collect: 'Collect package',
      collectRow: 'Collect row',
      targetRoot: 'Collecting to: preset root',
      targetGroup: 'Collecting to: group {id}',
      name: 'Name',
      description: 'Description',
      order: 'Order',
      pending: 'pending',
      needsRestart: 'Saved; HMR is unavailable, restart the application to apply.',
      groupEmpty: 'Empty group',
      noEditablePreset: 'Select an editable preset first (official and locked presets cannot collect rows).',
      stalePackage: 'package not installed',
      duplicateRow: 'duplicate row id',
    }

    const tone = (percent) => `color-mix(in srgb, currentColor ${percent}%, transparent)`

    const styles = {
      root: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, color: 'inherit', fontSize: 13, boxSizing: 'border-box' },
      topbar: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px 10px', borderBottom: `1px solid ${tone(10)}`, flexWrap: 'wrap' },
      title: { margin: 0, fontSize: 15, fontWeight: 600 },
      subtitle: { margin: 0, fontSize: 12, opacity: 0.65, flex: '1 1 240px' },
      body: { display: 'flex', flex: '1 1 auto', minHeight: 0 },
      column: { display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', scrollbarGutter: 'stable' },
      left: { width: 250, flex: '0 0 250px', borderRight: `1px solid ${tone(10)}`, padding: '12px 10px', gap: 10 },
      middle: { flex: '1 1 auto', padding: '14px 18px', gap: 12 },
      right: { width: 330, flex: '0 0 330px', borderLeft: `1px solid ${tone(10)}`, padding: '12px 12px', gap: 8 },
      sectionTitle: { fontSize: 11, letterSpacing: '0.04em', opacity: 0.6, textTransform: 'uppercase', margin: '4px 4px 2px' },
      presetItem: { display: 'flex', flexDirection: 'column', gap: 2, padding: '7px 9px', borderRadius: 8, border: '1px solid transparent', background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer', font: 'inherit' },
      presetItemActive: { background: tone(9), borderColor: tone(18) },
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
      packageCard: { border: `1px solid ${tone(10)}`, borderRadius: 9, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 },
      packageHead: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
      packageName: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 550 },
      muted: { opacity: 0.62, fontSize: 12 },
      empty: { padding: '18px 8px', opacity: 0.6, textAlign: 'center', fontSize: 12 },
      errorBox: { padding: '10px 12px', borderRadius: 8, background: tone(8), border: `1px solid ${tone(16)}`, fontSize: 12 },
      dot: { width: 7, height: 7, borderRadius: 999, background: 'currentColor', flex: '0 0 auto' },
      group: { border: `1px dashed ${tone(18)}`, borderRadius: 9, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 },
      groupHead: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
      toolbar: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
      menu: { position: 'absolute', zIndex: 20, marginTop: 4, background: 'var(--dsw-alias-bg-base, Canvas)', border: `1px solid ${tone(18)}`, borderRadius: 9, padding: 6, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' },
      menuItem: { padding: '5px 8px', borderRadius: 6, border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit', fontSize: 12 },
      saveBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 9, border: `1px solid ${tone(16)}`, background: tone(5), flexWrap: 'wrap' },
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
      const active = preset.id === api.selectedId
      return h('button', {
        type: 'button',
        style: { ...styles.presetItem, ...(active ? styles.presetItemActive : {}) },
        onClick: () => api.selectPreset(preset.id),
      },
        h('span', { style: styles.presetName },
          name,
          ...badges,
          active && api.dirty ? h('span', { style: styles.badgeWarn }, '●') : null),
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
        h('div', { style: { position: 'relative' } },
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
              h('div', { style: styles.sectionTitle }, t('official')),
              official.map((preset) => h(PresetItem, {
                key: preset.id, api, preset,
                name: preset.name || preset.id,
                badges: [h('span', { key: 'ro', style: styles.badge }, t('readonly'))],
              })))
          : null,
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
          h('div', { style: styles.sectionTitle }, t('custom')),
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
                style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 },
              },
                h('span', { style: { minWidth: 130, opacity: 0.72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, key),
                typeof child === 'boolean'
                  ? h('input', {
                      type: 'checkbox',
                      checked: child,
                      onChange: (event) => update({ ...value, [key]: event.target.checked }),
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
        h('div', { style: { ...styles.rowLine, marginLeft: depth * 12, opacity: rowState(row) === 'enabled' ? 1 : 0.62 } },
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
      React.useEffect(() => {
        let alive = true
        setText('')
        setError('')
        requestJson('/yaml?id=' + encodeURIComponent(preset.id))
          .then((body) => { if (alive) setText(body.yaml ?? '') })
          .catch((cause) => { if (alive) setError(String(cause.message ?? cause)) })
        return () => { alive = false }
      }, [preset.id, preset.plugins])
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        h('div', { style: styles.toolbar },
          h('button', {
            type: 'button', style: styles.button,
            onClick: async () => {
              try {
                await navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              } catch {
                setError('clipboard unavailable')
              }
            },
          }, copied ? t('copied') : t('copyYaml'))),
        error.length > 0 ? h('div', { style: styles.errorBox }, t('yamlFailed') + ': ' + error) : null,
        text.length > 0 ? h('pre', { style: styles.yaml }, text) : h('div', { style: styles.empty }, t('loading')))
    }

    function Drawer({ api }) {
      const t = api.t
      const [query, setQuery] = React.useState('')
      const packages = api.state?.packages ?? []
      const filtered = React.useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (needle.length === 0) return packages
        return packages.filter((pkg) => pkg.name.toLowerCase().includes(needle)
          || String(pkg.title ?? '').toLowerCase().includes(needle)
          || pkg.rows.some((row) => String(row.id).toLowerCase().includes(needle)
            || String(row.moduleName).toLowerCase().includes(needle)))
      }, [packages, query])
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 } },
        h('input', { style: styles.search, value: query, placeholder: t('searchPackages'), onChange: (event) => setQuery(event.target.value) }),
        h('div', { style: { ...styles.muted, lineHeight: 1.4 } }, t('saveCheckHint')),
        filtered.length === 0
          ? h('div', { style: styles.empty }, t('emptyPackages'))
          : filtered.map((pkg) => h(PackageCard, { key: pkg.name, api, pkg })))
    }

    function PackageCard({ api, pkg }) {
      const t = api.t
      const [open, setOpen] = React.useState(false)
      return h('div', { style: styles.packageCard },
        h('div', { style: styles.packageHead },
          h('button', { type: 'button', style: styles.buttonGhost, onClick: () => setOpen(!open) }, open ? '▾' : '▸'),
          h('span', { style: styles.packageName, title: pkg.name }, pkg.title && pkg.title !== pkg.name ? pkg.title : pkg.name),
          h('span', { style: styles.badge }, pkg.official ? t('officialTag') : t('thirdParty')),
          h('span', { style: styles.badge }, pkg.rows.length + ' ' + t('rows'))),
        pkg.description ? h('div', { style: styles.muted }, pkg.description) : null,
        h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          h('button', { type: 'button', style: styles.button, onClick: () => api.collectPackage(pkg) }, t('collect'))),
        open ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          pkg.rows.map((row) => h('div', { key: row.id + ':' + row.moduleName, style: { display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, flexWrap: 'wrap' } },
            h('code', { style: { ...styles.code, flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, row.id || row.moduleName),
            row.disabled?.kind === 'platform' ? h('span', { style: styles.badgeWarn }, row.disabled.label) : null,
            row.disabled?.kind === 'expression' ? h('span', { style: styles.badgeWarn }, t('conditional')) : null,
            h('button', { type: 'button', style: styles.buttonGhost, onClick: () => api.collectPackage(pkg, [row]) }, t('collectRow')))))
          : null)
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
              ? h('input', { style: { ...styles.input, maxWidth: 260 }, value: preset.name ?? '', placeholder: t('name'), onChange: (event) => api.updatePreset(preset.id, { name: event.target.value }) })
              : h('strong', null, preset.name || preset.id),
            h('code', { style: styles.code }, preset.id),
            official ? h('span', { style: styles.badge }, t('officialTag')) : null,
            !official && !managed && !locked ? h('span', { style: styles.badge }, t('foreign')) : null,
            locked ? h('span', { style: styles.badgeWarn }, t('locked')) : null,
            preset.broken ? h('span', { style: styles.badgeWarn }, t('broken')) : null,
            editable
              ? h('input', { style: { ...styles.input, width: 88 }, type: 'number', value: preset.order ?? '', placeholder: t('order'), onChange: (event) => api.updatePreset(preset.id, { order: event.target.value === '' ? undefined : Number(event.target.value) }) })
              : preset.order !== undefined ? h('span', { style: styles.badge }, 'order ' + preset.order) : null,
            h('span', { style: { flex: '1 1 auto' } }),
            !official && locked ? h('button', { type: 'button', style: styles.button, onClick: () => api.setLocked(preset.id, false) }, t('unlock')) : null,
            !official && !locked ? h('button', { type: 'button', style: styles.button, onClick: () => api.setLocked(preset.id, true) }, t('lock')) : null,
            !official && !locked ? h('button', { type: 'button', style: styles.button, onClick: () => api.deletePreset(preset.id) }, t('deletePreset')) : null,
            !official && !managed && !locked && preset.canAdopt ? h('button', { type: 'button', style: styles.buttonPrimary, onClick: () => api.adoptPreset(preset.id) }, t('adopt')) : null),
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
          api.tab === 'compose' && editable ? h('button', { type: 'button', style: styles.button, onClick: () => api.addGroup(preset.id) }, t('addGroup')) : null),
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

    function StudioPage({ t }) {
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
        const sourceRows = onlyRows ?? pkg.rows
        mutatePlugins(target.id, (plugins) => {
          const used = new Set()
          walkRows(plugins, (row) => used.add(row.id))
          const rows = sourceRows.map((row) => {
            const base = row.id || slugify(row.moduleName) || 'row'
            const id = uniqueName(base, used)
            used.add(id)
            const next = { id, name: row.moduleName }
            if (row.config !== undefined && row.config !== null && Object.keys(row.config).length > 0) next.config = clone(row.config)
            if (row.disabled?.kind === 'static' && row.disabled.value === true) next.disabled = true
            else if (row.disabled?.kind === 'platform' || row.disabled?.kind === 'expression') next.disabled = { __js: row.disabled.text }
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

      const warnings = React.useMemo(() => {
        const issues = []
        const installed = new Set((state?.packages ?? []).map((pkg) => pkg.name))
        for (const preset of draft) {
          if (preset.locked === true) continue
          if (typeof preset.name !== 'string' || preset.name.trim().length === 0) issues.push(preset.id + ': ' + t('name') + ' —')
          const meta = (state?.presets ?? []).find((savedPreset) => savedPreset.id === preset.id)
          if (typeof meta?.broken === 'string' && meta.broken.length > 0) issues.push(preset.id + ': ' + meta.broken)
          const seen = new Set()
          walkRows(preset.plugins, (row) => {
            if (seen.has(row.id)) issues.push(preset.id + ': ' + t('duplicateRow') + ' ' + row.id)
            seen.add(row.id)
            if (row.name !== 'cordis:group' && !installed.has(packageNameOf(row.name))) {
              issues.push(preset.id + ': ' + t('stalePackage') + ' ' + row.name)
            }
          })
        }
        return issues
      }, [draft, state])

      const api = {
        t, state, draft, selectedId, selected, dirty, saving, notice, status,
        view, tab, menuOpen, collapsed, configEditorId, isolateEditorId, selectedGroupId, warnings, baseRevision,
        officialPresets, foreignPresets,
        setMenuOpen, setView, setTab, setNotice,
        load, selectPreset: (id) => setSelectedId(id),
        brokenOf: (id) => (state?.presets ?? []).find((preset) => preset.id === id)?.broken,
        createBlank: () => createPreset(undefined), copyPreset,
        deletePreset, adoptPreset, setLocked,
        updatePreset, save, discard,
        toggleRow, removeRow, moveRow, applyRowConfig, resetRowConfig,
        toggleConfig: (id) => setConfigEditorId((current) => current === id ? null : id),
        addGroup, removeGroup,
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

      return h('div', { style: styles.root },
        h('div', { style: styles.topbar },
          h('h1', { style: styles.title }, t('title')),
          h('p', { style: styles.subtitle }, t('subtitle')),
          state?.profile?.name ? h('span', { style: styles.badge }, 'profile: ' + state.profile.name) : null,
          state?.hmr === false ? h('span', { style: styles.badgeWarn }, 'HMR off') : null,
          h('button', { type: 'button', style: styles.button, onClick: () => void load() }, t('refresh'))),
        h('div', { style: styles.body },
          h('aside', { style: { ...styles.column, ...styles.left } }, h(PresetColumn, { api })),
          h('main', { style: { ...styles.column, ...styles.middle } }, h(Editor, { api })),
          h('aside', { style: { ...styles.column, ...styles.right } },
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
      const t = ctx.locale.bind(NS)
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
        }, () => h(StudioPage, { t }))
      })
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})
