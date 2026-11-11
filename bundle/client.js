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
      thirdPartyInactive: '非官方 · 未开 Bundle',
      officialInactive: '官方 · 未开 Bundle',
      inactiveTag: '未开 Bundle',
      bundleEnabledTag: 'bundle 内启用',
      bundleDisabledTag: 'bundle 内禁用',
      inactiveHint: '这些 bundle 未启用，里面的行现在不会被 Host 挂载。收录进预设后，如果以后启用该 bundle，会与 Host 重复；建议先启用 bundle，并确认这些行在 bundle 中静态禁用。',
      inactiveBanner: '未开 Bundle 可以提前收录；启用该 bundle 后可能与 Host 重复，优先启用 bundle 处理。',
      inactiveCollectNone: '该包在未开 bundle 中没有可安全收录的行（只剩条件行）。',
      inactiveWarning: '{count} 行来自未启用的 bundle（{bundles}）；启用这些 bundle 后会与 Host 重复。建议先启用并确认行状态。',
      inactiveWarningShort: '包含未开 Bundle 的行，启用该 bundle 前请检查冲突。',
      conflictWarning: '{count} 行与 Host 已启用行同 id；预设再声明同一 row id 会重复注册。请从预设移出，或先禁用 Host 对应行。',
      conflictWarningShort: '有预设行与 Host 已启用行同 id，可能重复注册。',
      conflictHint: '按 Loader row id 匹配。同一模块用不同 row id（例如官方 Standard 的 skill-filesystem 与 Host 的 skill-filesystem-global）是 scoped 用法，不算冲突；只有同 id 才提示。',
      conflictBadge: 'Host 冲突',
      inactiveBadge: '未开 Bundle',
      designButton: '设计说明',
      designHelp: '工坊怎么工作',
      designHost: 'Host 与预设是两层：Host 已启用的行不会进入可收录，因为预设再声明会重复注册。',
      designBundle: '未启用的 bundle 单独列为一组：它的行现在没有被 Host 挂载，可以提前收录；但以后启用该 bundle 会与 Host 重复，建议先启用并确认行状态。',
      designCollect: '已启用 bundle 里只收录静态禁用、留给预设挂载的行；未启用 bundle 的行单独分组，条件行不收录。',
      designRows: '可收录性只看行：包里还有未启用的行，就只列出并收录这些行；整包都已启用时不显示，官方和第三方一样。',
      designInactive: '未开 Bundle 的包会标「未开 Bundle」；bundle 内启用的行还会标「bundle 内启用」，提醒启用后可能重复。',
      helpHighlight: '彩色词提示：Tool 工具、Skill 技能、Persona 人设。',
      helpCollect: '可收录：Host 已启用 bundle 里静态禁用、留给预设挂载的行。',
      helpOfficialHost: '官方 Host 行：只读，展开可看。',
      helpSearch: '搜索包名、标题、简介或行 id。',
      helpPresetKinds: '官方预设只读；其它预设都可管理，外部声明需要先接管。',
      helpOrder: '数字越小越靠前；同序按 id。',
      helpId: '保存前可改：小写字母、数字、连字符；保存后固定。',
      helpFiltered: '当前预设已声明的行会从抽屉隐藏。',
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
      thirdPartyInactive: 'Community · bundle off',
      officialInactive: 'Official · bundle off',
      inactiveTag: 'bundle off',
      bundleEnabledTag: 'on in bundle',
      bundleDisabledTag: 'off in bundle',
      inactiveHint: 'These bundles are not enabled, so their rows are not mounted by the Host now. If the bundle is enabled later, a preset declaring the same rows will duplicate it; enabling the bundle first and making those rows statically disabled is preferred.',
      inactiveBanner: 'Rows from bundles that are off can be collected early; enabling the bundle later may duplicate the Host. Prefer enabling the bundle first.',
      inactiveCollectNone: 'No safe rows in this off bundle (only conditional rows).',
      inactiveWarning: '{count} row(s) come from bundles that are off ({bundles}); enabling them will duplicate the Host. Enable them first and check the row state.',
      inactiveWarningShort: 'Contains rows from a bundle that is off; check for conflicts before enabling it.',
      conflictWarning: '{count} row(s) share an id with an active Host row; declaring the same row id in a preset registers it twice. Remove them from the preset, or disable the Host rows first.',
      conflictWarningShort: 'A preset row shares an id with an active Host row and may be registered twice.',
      conflictHint: 'Matched by Loader row id. The same module under different row ids (for example Standard\'s skill-filesystem and the Host\'s skill-filesystem-global) is a scoped use, not a conflict; only a shared id is flagged.',
      conflictBadge: 'Host conflict',
      inactiveBadge: 'bundle off',
      designButton: 'Design notes',
      designHelp: 'How the workshop works',
      designHost: 'Host and presets are two layers: rows active in the Host are not collectable, because a preset declaring them would register the same plugin twice.',
      designBundle: 'Bundles that are off get their own groups: their rows are not mounted by the Host now and can be collected early, but enabling the bundle later duplicates the Host; enable it first and check the row state.',
      designCollect: 'An active bundle offers only statically disabled rows left for presets; rows from an off bundle are grouped separately, and conditional rows are not collectable.',
      designRows: 'Collectability is row-level, not source-level: if a package still has inactive rows, only those rows are listed and collectable; a package whose rows are all active is not shown, for official and third-party packages alike.',
      designInactive: 'Packages from a bundle that is off are marked "bundle off"; rows that would be active inside that bundle are marked "on in bundle", warning about duplication if it is enabled.',
      helpHighlight: 'Colour cues: Tool, Skill, Persona.',
      helpCollect: 'Collectable: rows statically disabled in an active Host bundle, left for presets to mount.',
      helpOfficialHost: 'Official Host rows are read-only; expand to inspect them.',
      helpSearch: 'Search package name, title, description or row id.',
      helpPresetKinds: 'Official presets are read-only; all other presets are manageable, and external declarations must be adopted first.',
      helpOrder: 'Lower numbers come first; ties sort by id.',
      helpId: 'Editable before the first save: lowercase letters, digits and hyphens; fixed after saving.',
      helpFiltered: 'Rows already declared by this preset are hidden from the drawer.',
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
      .ps-root { background: linear-gradient(180deg, color-mix(in srgb, currentColor 2%, transparent), transparent 180px); }
      .ps-root button { transition: background-color 120ms ease, border-color 120ms ease, opacity 120ms ease, transform 120ms ease, box-shadow 120ms ease; }
      .ps-root button:not(:disabled):hover { background-color: color-mix(in srgb, currentColor 8%, transparent); }
      .ps-root button:disabled { opacity: 0.45; cursor: default; }
      .ps-root :focus-visible { outline: none; }
      .ps-root input:focus-visible, .ps-root textarea:focus-visible { outline: 2px solid color-mix(in srgb, currentColor 40%, transparent); outline-offset: 0; }
      .ps-scroll { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, currentColor 20%, transparent) transparent; }
      .ps-scroll::-webkit-scrollbar { width: 9px; height: 9px; }
      .ps-scroll::-webkit-scrollbar-thumb { background: color-mix(in srgb, currentColor 18%, transparent); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
      .ps-scroll::-webkit-scrollbar-track { background: transparent; }
      .ps-preset { border: 1px solid transparent !important; }
      .ps-preset:hover { background: color-mix(in srgb, currentColor 6%, transparent) !important; transform: translateY(-1px); }
      .ps-preset-active { background: color-mix(in srgb, currentColor 7%, transparent) !important; box-shadow: inset 2px 0 0 #4f7cff !important; }
      .ps-card { transition: border-color 140ms ease, box-shadow 140ms ease; }
      .ps-card:hover { border-color: color-mix(in srgb, currentColor 24%, transparent); box-shadow: 0 8px 22px color-mix(in srgb, currentColor 7%, transparent); }
      .ps-row:hover { background-color: color-mix(in srgb, currentColor 8%, transparent); }
      .ps-sticky { position: sticky; top: 0; z-index: 6; background: var(--dsw-alias-bg-base, Canvas); }
      .ps-topbar { background: color-mix(in srgb, var(--dsw-alias-bg-base, Canvas) 94%, transparent); }
      .ps-new { background: #4f7cff !important; color: #fff !important; border-color: transparent !important; }
      .ps-new:hover { background: #5d88ff !important; transform: translateY(-1px); }
      .ps-package { background: color-mix(in srgb, currentColor 2.2%, transparent); transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease; }
      .ps-package:hover { transform: translateY(-1px); box-shadow: 0 7px 20px color-mix(in srgb, currentColor 8%, transparent); border-color: color-mix(in srgb, currentColor 22%, transparent); }
      .ps-help { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 999px; border: 1px solid color-mix(in srgb, currentColor 26%, transparent); font-size: 10px; font-weight: 700; line-height: 1; opacity: 0.62; cursor: help; flex: 0 0 auto; }
      .ps-help:hover { opacity: 1; background: color-mix(in srgb, currentColor 10%, transparent) !important; }
      .ps-tip { position: fixed; z-index: 1000; width: 300px; box-sizing: border-box; max-height: 340px; overflow: auto; padding: 11px 13px; border-radius: 12px; background: Canvas; border: 1px solid color-mix(in srgb, currentColor 18%, transparent); box-shadow: 0 14px 38px rgba(0,0,0,0.22); font-size: 12px; line-height: 1.55; color: inherit; animation: ps-fade 120ms ease; }
      .ps-tip-title { font-weight: 650; margin-bottom: 4px; }
      @keyframes ps-fade { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }
      .ps-term { font-weight: 650; }
      .ps-term-tool { color: #2f6bff; }
      .ps-term-skill { color: #8b5cf6; }
      .ps-term-persona { color: #b26a00; }
      @media (prefers-color-scheme: dark) {
        .ps-term-tool { color: #8ab4ff; }
        .ps-term-skill { color: #b79bff; }
        .ps-term-persona { color: #f0bd6b; }
      }
      .ps-seg { display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: color-mix(in srgb, currentColor 6%, transparent); }
      .ps-seg button { border: none !important; background: transparent !important; border-radius: 8px !important; padding: 4px 10px !important; opacity: 0.7; }
      .ps-seg button[data-active="true"] { background: color-mix(in srgb, currentColor 14%, transparent) !important; opacity: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
      .ps-seg button:hover { opacity: 1; }
      .ps-search-wrap { position: relative; display: flex; align-items: center; width: 100%; }
      .ps-search-wrap svg { position: absolute; left: 9px; opacity: 0.5; pointer-events: none; }
      .ps-search { padding-left: 30px !important; }
    `

    const styles = {
      root: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, color: 'inherit', fontSize: 13, boxSizing: 'border-box', position: 'relative' },
      topbar: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 9px', borderBottom: `1px solid ${tone(10)}`, flexWrap: 'wrap' },
      brand: { display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 },
      logo: { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#4f7cff', color: '#fff', flex: '0 0 auto' },
      title: { margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle: { margin: 0, fontSize: 11.5, opacity: 0.58, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      profileChip: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, padding: '2px 7px', borderRadius: 999, background: tone(8), opacity: 0.85 },
      profileDot: { width: 5, height: 5, borderRadius: 999, background: 'currentColor', opacity: 0.5 },
      iconButton: { width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${tone(14)}`, background: tone(5), color: 'inherit', cursor: 'pointer', padding: 0 },
      body: { display: 'flex', flex: '1 1 auto', minHeight: 0 },
      column: { display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', scrollbarGutter: 'stable' },
      left: { width: 248, flex: '0 0 248px', borderRight: `1px solid ${tone(10)}`, padding: '10px 8px', gap: 9 },
      middle: { flex: '1 1 auto', padding: '14px 16px', gap: 10 },
      right: { width: 332, flex: '0 0 332px', borderLeft: `1px solid ${tone(10)}`, padding: '10px 10px', gap: 8 },
      sectionTitle: { fontSize: 10.5, letterSpacing: '0.03em', opacity: 0.55, margin: '3px 4px 1px', fontWeight: 650 },
      sectionHead: { display: 'flex', alignItems: 'center', gap: 5, margin: '4px 2px 1px' },
      presetItem: { display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 8px', borderRadius: 9, border: '1px solid transparent', background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer', font: 'inherit' },
      presetItemActive: { background: tone(9) },
      presetTop: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
      presetName: { fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', minWidth: 0 },
      presetMeta: { fontSize: 10.5, opacity: 0.58 },
      badge: { fontSize: 10, padding: '1px 6px', borderRadius: 999, background: tone(10), opacity: 0.9, whiteSpace: 'nowrap' },
      badgeWarn: { fontSize: 10, padding: '1px 6px', borderRadius: 999, border: `1px solid ${tone(30)}`, opacity: 0.95, whiteSpace: 'nowrap' },
      badgeRow: { display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
      card: { border: `1px solid ${tone(10)}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7, background: 'color-mix(in srgb, currentColor 1.8%, transparent)' },
      rowLine: { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 7px', borderRadius: 8, border: `1px solid ${tone(7)}`, background: tone(4), flexWrap: 'wrap' },
      rowName: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 },
      code: { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: 11, opacity: 0.7 },
      button: { padding: '4px 9px', borderRadius: 8, border: `1px solid ${tone(16)}`, background: tone(6), color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: 12 },
      buttonPrimary: { padding: '4px 10px', borderRadius: 8, border: `1px solid ${tone(30)}`, background: tone(16), color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: 12, fontWeight: 600 },
      buttonGhost: { padding: '2px 5px', borderRadius: 6, border: '1px solid transparent', background: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: 11, opacity: 0.8 },
      search: { width: '100%', padding: '6px 9px', borderRadius: 9, border: `1px solid ${tone(14)}`, background: tone(4), color: 'inherit', font: 'inherit', boxSizing: 'border-box' },
      input: { width: '100%', padding: '4px 7px', borderRadius: 7, border: `1px solid ${tone(14)}`, background: tone(4), color: 'inherit', font: 'inherit', boxSizing: 'border-box', fontSize: 12 },
      textarea: { width: '100%', minHeight: 80, padding: '5px 7px', borderRadius: 7, border: `1px solid ${tone(14)}`, background: tone(4), color: 'inherit', font: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: 11, boxSizing: 'border-box', resize: 'vertical' },
      packageCard: { border: `1px solid ${tone(10)}`, borderRadius: 10, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 },
      packageHead: { display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' },
      pkgBody: { flex: '1 1 150px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 },
      packageName: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 550 },
      packageTitle: { flex: '1 1 auto', minWidth: 0, fontWeight: 625, fontSize: 12.5, background: 'transparent', border: 'none', color: 'inherit', textAlign: 'left', padding: 0, cursor: 'pointer', lineHeight: 1.35, wordBreak: 'break-word' },
      packageModule: { fontSize: 10, opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      packageDesc: { fontSize: 11.5, opacity: 0.7, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
      packageFoot: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 1 },
      packageMeta: { fontSize: 10.5, opacity: 0.55 },
      inactiveBanner: { display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 8, padding: '6px 9px', borderRadius: 9, border: '1px solid color-mix(in srgb, #d97706 45%, transparent)', background: 'color-mix(in srgb, #f59e0b 10%, Canvas)', fontSize: 11, lineHeight: 1.45 },
      collectBtn: { padding: '3px 8px', borderRadius: 7, border: `1px solid ${tone(30)}`, background: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: 11.5, fontWeight: 600 },
      muted: { opacity: 0.62, fontSize: 12 },
      empty: { padding: '18px 8px', opacity: 0.6, textAlign: 'center', fontSize: 12 },
      errorBox: { padding: '10px 12px', borderRadius: 8, background: tone(8), border: `1px solid ${tone(16)}`, fontSize: 12 },
      errorWarnBox: { display: 'flex', alignItems: 'flex-start', gap: 6, padding: '7px 9px', borderRadius: 9, border: '1px solid color-mix(in srgb, #dc2626 55%, transparent)', background: 'color-mix(in srgb, #dc2626 8%, Canvas)', fontSize: 11.5, lineHeight: 1.45 },
      inactiveWarnBox: { display: 'flex', alignItems: 'flex-start', gap: 6, padding: '7px 9px', borderRadius: 9, border: '1px solid color-mix(in srgb, #d97706 55%, transparent)', background: 'color-mix(in srgb, #f59e0b 13%, Canvas)', fontSize: 11.5, lineHeight: 1.45 },
      badgeError: { fontSize: 10, padding: '1px 6px', borderRadius: 999, border: '1px solid color-mix(in srgb, #dc2626 50%, transparent)', background: 'color-mix(in srgb, #dc2626 12%, Canvas)', color: '#b91c1c', whiteSpace: 'nowrap' },
      badgeWarnYellow: { fontSize: 10, padding: '1px 6px', borderRadius: 999, border: '1px solid color-mix(in srgb, #d97706 50%, transparent)', background: 'color-mix(in srgb, #f59e0b 15%, Canvas)', color: '#92400e', whiteSpace: 'nowrap' },
      dot: { width: 7, height: 7, borderRadius: 999, background: 'currentColor', flex: '0 0 auto' },
      group: { border: `1px dashed ${tone(16)}`, borderRadius: 12, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 },
      groupHead: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
      toolbar: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
      menu: { position: 'absolute', zIndex: 20, marginTop: 4, background: 'Canvas', border: `1px solid ${tone(18)}`, borderRadius: 12, padding: 6, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 210, boxShadow: '0 14px 36px rgba(0,0,0,0.18)' },
      menuItem: { padding: '6px 9px', borderRadius: 7, border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit', fontSize: 12 },
      saveBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, border: `1px solid ${tone(14)}`, background: 'var(--dsw-alias-bg-base, Canvas)', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 6 },
      warnBox: { display: 'flex', alignItems: 'flex-start', gap: 6, padding: '7px 9px', borderRadius: 9, border: `1px solid ${tone(20)}`, background: tone(5), fontSize: 11.5, lineHeight: 1.45 },
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
      if (row.bundleActive === false) {
        return row.disabled?.kind === 'static' || row.disabled?.kind === 'none'
      }
      return row.enabled === false && (row.disabled?.kind === 'static' || row.disabled?.kind === 'none')
    }

    // ---------- presentation primitives ----------

    function Icon({ name, size = 14, style }) {
      const common = {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        style: { flex: '0 0 auto', ...style }, 'aria-hidden': true,
      }
      if (name === 'search') {
        return h('svg', common, h('circle', { cx: 11, cy: 11, r: 7 }), h('path', { d: 'M16.5 16.5 21 21' }))
      }
      if (name === 'plus') return h('svg', common, h('path', { d: 'M12 5v14M5 12h14' }))
      if (name === 'refresh') {
        return h('svg', common, h('path', { d: 'M20 11a8 8 0 1 0-2.3 5.7' }), h('path', { d: 'M20 4v7h-7' }))
      }
      if (name === 'spark') {
        return h('svg', common, h('path', { d: 'M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z' }),
          h('path', { d: 'M18.5 16.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z' }))
      }
      if (name === 'package') {
        return h('svg', common, h('path', { d: 'M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7z' }),
          h('path', { d: 'M3 8.5 12 14l9-5.5M12 14v7' }))
      }
      return h('svg', common, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M12 11v5' }), h('path', { d: 'M12 7.5h.01' }))
    }

    const TERM_RE = /\b(tools?|skills?|personas?|personal|presets?|contexts?|workspaces?|sessions?|subagents?|agents?|plans?)\b|(工具|技能|人设|预设|上下文|工作区|会话|子代理)/gi
    function termKind(word) {
      const value = word.toLowerCase()
      if (value.startsWith('tool') || word === '工具') return 'tool'
      if (value.startsWith('skill') || word === '技能') return 'skill'
      if (value.startsWith('person') || word === '人设') return 'persona'
      return null
    }
    function termNodes(text) {
      if (typeof text !== 'string' || text.length === 0) return text
      const pattern = new RegExp(TERM_RE.source, 'gi')
      const out = []
      let last = 0
      let match
      let index = 0
      while ((match = pattern.exec(text)) !== null) {
        const kind = termKind(match[0])
        if (kind === null) continue
        if (match.index > last) out.push(text.slice(last, match.index))
        out.push(h('span', { key: 'term-' + index, className: 'ps-term ps-term-' + kind }, match[0]))
        index += 1
        last = match.index + match[0].length
      }
      if (last < text.length) out.push(text.slice(last))
      return out
    }

    /**
     * A small "?" with a hover tooltip and click-to-pin popover. The popover is
     * fixed-positioned so it escapes the drawer's scroll container.
     */
    function Help({ api, title, text, children, label, style }) {
      const t = api.t
      const [open, setOpen] = React.useState(false)
      const [pinned, setPinned] = React.useState(false)
      const [pos, setPos] = React.useState(null)
      const ref = React.useRef(null)
      const place = () => {
        const node = ref.current
        if (node === null) return
        const rect = node.getBoundingClientRect()
        const width = 300
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
        const below = rect.bottom + 8
        if (below + 260 > window.innerHeight) {
          setPos({ left, bottom: window.innerHeight - rect.top + 8 })
        } else {
          setPos({ left, top: below })
        }
      }
      const show = () => {
        place()
        setOpen(true)
      }
      const hide = () => {
        if (!pinned) setOpen(false)
      }
      React.useEffect(() => {
        if (!open) return undefined
        const close = () => {
          setPinned(false)
          setOpen(false)
        }
        const onPointerDown = (event) => {
          if (ref.current !== null && !ref.current.contains(event.target) && !event.target.closest?.('.ps-tip')) close()
        }
        const onKey = (event) => {
          if (event.key === 'Escape') close()
        }
        window.addEventListener('scroll', close, true)
        window.addEventListener('resize', close)
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKey)
        return () => {
          window.removeEventListener('scroll', close, true)
          window.removeEventListener('resize', close)
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKey)
        }
      }, [open])
      const toggle = (event) => {
        event.stopPropagation()
        if (pinned) {
          setPinned(false)
          setOpen(false)
        } else {
          setPinned(true)
          show()
        }
      }
      const trigger = label !== undefined
        ? h('button', {
            type: 'button', ref, style: { ...styles.button, display: 'inline-flex', alignItems: 'center', gap: 5, ...style },
            'aria-label': title ?? t('help'), 'aria-expanded': open,
            onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide, onClick: toggle,
          }, h(Icon, { name: 'info', size: 12 }), label)
        : h('span', {
            ref, role: 'button', tabIndex: 0, className: 'ps-help',
            'aria-label': title ?? t('help'), 'aria-expanded': open,
            onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide,
            onClick: toggle,
            onKeyDown: (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                if (pinned) {
                  setPinned(false)
                  setOpen(false)
                } else {
                  setPinned(true)
                  show()
                }
              }
            },
          }, '?')
      return h('span', { style: { display: 'inline-flex', position: 'relative' } },
        trigger,
        open
          ? h('div', {
              role: 'tooltip', className: 'ps-tip',
              style: { left: pos?.left ?? 8, ...(pos?.top !== undefined ? { top: pos.top } : { bottom: pos?.bottom ?? 8 }) },
            },
              title !== undefined ? h('div', { className: 'ps-tip-title' }, termNodes(title)) : null,
              children ?? (text !== undefined ? h('div', null, termNodes(text)) : null))
          : null)
    }

    function DesignNotes({ api }) {
      const t = api.t
      return h(Help, {
        api, label: t('designButton'), title: t('designHelp'),
        children: h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          h('div', null, '• ', termNodes(t('designHost'))),
          h('div', null, '• ', termNodes(t('designBundle'))),
          h('div', null, '• ', termNodes(t('designCollect'))),
          h('div', null, '• ', termNodes(t('designRows'))),
          h('div', null, '• ', termNodes(t('designInactive'))),
          h('div', { style: { ...styles.muted, marginTop: 4 } }, termNodes(t('helpHighlight')))),
      })
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
        className: 'ps-hover ps-preset' + (active ? ' ps-preset-active' : ''),
        style: { ...styles.presetItem, ...(active ? styles.presetItemActive : {}) },
        onClick: () => api.selectPreset(preset.id),
      },
        h('span', { style: styles.presetTop },
          h('span', { style: { flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 } },
            h('span', { style: styles.presetName },
              name,
              ...badges,
              api.presetDirty(preset)
                ? h('span', { style: styles.badgeWarn, title: t('unsaved') }, t('unsavedHere'))
                : null),
            h('span', { style: styles.presetMeta },
              h('code', { style: styles.code }, preset.id),
              preset.order !== undefined ? ' · ' + preset.order : ''))))
    }

    function PresetColumn({ api }) {
      const { t, draft } = api
      const foreign = api.foreignPresets ?? []
      const official = api.officialPresets ?? []
      const stateById = new Map((api.state?.presets ?? []).map((preset) => [preset.id, preset]))
      const customItems = [
        ...draft.map((preset) => ({ preset, managed: true })),
        ...foreign.map((preset) => ({ preset, managed: false })),
      ]
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        h('div', { className: 'ps-sticky', style: { position: 'sticky', top: 0, zIndex: 5, paddingBottom: 6, background: 'var(--dsw-alias-bg-base, Canvas)' } },
          h('button', { type: 'button', className: 'ps-new', style: { ...styles.buttonPrimary, width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }, onClick: () => api.setMenuOpen(!api.menuOpen) },
            h(Icon, { name: 'plus', size: 14, style: { opacity: 0.9 } }), t('newPreset')),
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
              h('div', { style: styles.sectionHead },
                h('span', { style: styles.sectionTitle }, t('official') + ' · ' + official.length),
                h(Help, { api, title: t('official'), text: t('officialHint') })),
              official.map((preset) => h(PresetItem, {
                key: preset.id, api, preset,
                name: preset.name || preset.id,
                badges: [h('span', { key: 'ro', style: styles.badge }, t('readonly'))],
              })))
          : null,
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
          h('div', { style: styles.sectionHead },
            h('span', { style: styles.sectionTitle }, t('custom') + ' · ' + customItems.length),
            h(Help, { api, title: t('custom'), text: t('helpPresetKinds') })),
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
      const offBundle = typeof row.name === 'string' && api.inactiveModules?.has(row.name) === true
      const hostConflict = typeof row.id === 'string' && row.id.length > 0 && row.disabled !== true && api.activeRowIds?.has(row.id) === true
      const flagged = hostConflict
        ? { borderColor: 'color-mix(in srgb, #dc2626 60%, transparent)', background: 'color-mix(in srgb, #dc2626 6%, Canvas)', boxShadow: 'inset 2px 0 0 #dc2626' }
        : offBundle
          ? { borderColor: 'color-mix(in srgb, #d97706 55%, transparent)', background: 'color-mix(in srgb, #f59e0b 10%, Canvas)', boxShadow: 'inset 2px 0 0 #d97706' }
          : {}
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
        h('div', { className: 'ps-row', style: { ...styles.rowLine, marginLeft: depth * 12, opacity: rowState(row) === 'enabled' ? 1 : 0.62, ...flagged } },
          h('span', { style: { ...styles.dot, opacity: rowState(row) === 'enabled' ? 0.8 : 0.2 } }),
          h('span', { style: styles.rowName }, row.id),
          h('code', { style: styles.code }, row.name),
          hostConflict ? h('span', { style: styles.badgeError }, t('conflictBadge')) : offBundle ? h('span', { style: styles.badgeWarnYellow }, t('inactiveBadge')) : null,
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
      const activeListed = listed.map((entry) => ({ pkg: entry.pkg, rows: entry.rows.filter((row) => row.bundleActive !== false) }))
        .filter((entry) => entry.rows.length > 0)
      const inactiveListed = listed.map((entry) => ({ pkg: entry.pkg, rows: entry.rows.filter((row) => row.bundleActive === false) }))
        .filter((entry) => entry.rows.length > 0)
      const usable = activeListed.filter((entry) => entry.rows.some(isCollectableRow))
      const inactiveUsable = inactiveListed.filter((entry) => entry.rows.some(isCollectableRow))
      const hostManaged = activeListed.filter((entry) => entry.rows.length > 0
        && entry.rows.every((row) => row.enabled || row.disabled?.kind === 'expression'))
      const thirdUsable = usable.filter((entry) => entry.pkg.official !== true)
      const officialUsable = usable.filter((entry) => entry.pkg.official === true)
      const officialHost = hostManaged.filter((entry) => entry.pkg.official === true)
      const thirdInactive = inactiveUsable.filter((entry) => entry.pkg.official !== true)
      const officialInactive = inactiveUsable.filter((entry) => entry.pkg.official === true)
      const empty = usable.length === 0 && officialHost.length === 0 && inactiveUsable.length === 0
      const section = { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }
      const activeOpen = showActive || query.trim().length > 0
      const sectionHead = (label, count, helpTitle, helpText) => h('div', { style: styles.sectionHead },
        h('span', { style: styles.sectionTitle }, label + ' · ' + count),
        h(Help, { api, title: helpTitle, text: helpText }))
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, flex: '1 1 auto' } },
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 10, borderBottom: `1px solid ${tone(9)}` } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, padding: '0 2px' } },
            h('span', { style: { ...styles.sectionTitle, margin: 0 } }, t('packages')),
            h('span', { style: styles.badge }, packages.length),
            h('span', { style: { flex: '1 1 auto' } }),
            h(Help, { api, title: t('designHelp'), text: t('designRows') })),
          h('div', { className: 'ps-search-wrap' },
            h(Icon, { name: 'search', size: 13 }),
            h('input', {
              className: 'ps-search', style: styles.search, value: query,
              placeholder: t('searchPackages'), 'aria-label': t('helpSearch'),
              onChange: (event) => setQuery(event.target.value),
            })),
          declared.size > 0
            ? h('div', { style: { ...styles.packageMeta, padding: '0 2px' } }, t('filteredHint'))
            : null),
        h('div', { className: 'ps-scroll', style: { display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, flex: '1 1 auto', overflowY: 'auto', paddingRight: 6, paddingTop: 2, paddingBottom: 8 } },
          empty
            ? h('div', { style: styles.empty },
                h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 8, opacity: 0.5 } }, h(Icon, { name: 'package', size: 26 })),
                t('emptyPackages'))
            : h(React.Fragment, null,
                thirdUsable.length > 0
                  ? h('div', { style: section },
                      sectionHead(t('thirdPartyCollectable'), thirdUsable.length, t('thirdPartyCollectable'), t('helpCollect')),
                      thirdUsable.map((entry) => h(PackageCard, { key: 'active:' + entry.pkg.name, api, pkg: entry.pkg, rows: entry.rows })))
                  : null,
                officialUsable.length > 0
                  ? h('div', { style: section },
                      sectionHead(t('officialCollectable'), officialUsable.length, t('officialCollectable'), t('helpCollect')),
                      officialUsable.map((entry) => h(PackageCard, { key: 'active:' + entry.pkg.name, api, pkg: entry.pkg, rows: entry.rows })))
                  : null,
                inactiveUsable.length > 0
                  ? h(React.Fragment, null,
                      h('div', { style: styles.inactiveBanner },
                        h('span', { style: { flex: '1 1 auto' } }, t('inactiveBanner')),
                        h(Help, { api, title: t('inactiveTag'), text: t('inactiveHint') })),
                      thirdInactive.length > 0
                        ? h('div', { style: section },
                            sectionHead(t('thirdPartyInactive'), thirdInactive.length, t('thirdPartyInactive'), t('inactiveHint')),
                            thirdInactive.map((entry) => h(PackageCard, { key: 'inactive:' + entry.pkg.name, api, pkg: entry.pkg, rows: entry.rows })))
                        : null,
                      officialInactive.length > 0
                        ? h('div', { style: section },
                            sectionHead(t('officialInactive'), officialInactive.length, t('officialInactive'), t('inactiveHint')),
                            officialInactive.map((entry) => h(PackageCard, { key: 'inactive:' + entry.pkg.name, api, pkg: entry.pkg, rows: entry.rows })))
                        : null)
                  : null,
                officialHost.length > 0
                  ? h('div', { style: section },
                      h('div', { style: styles.sectionHead },
                        h('button', {
                          type: 'button',
                          style: { ...styles.sectionTitle, background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 },
                          onClick: () => setShowActive(!showActive),
                        }, (activeOpen ? '▾ ' : '▸ ') + t('hostActiveSection') + ' · ' + officialHost.length),
                        h(Help, { api, title: t('hostActiveSection'), text: t('hostActiveHint') })),
                      activeOpen ? officialHost.map((entry) => h(PackageCard, { key: 'host:' + entry.pkg.name, api, pkg: entry.pkg, rows: entry.rows })) : null)
                  : null)))
    }

    function PackageCard({ api, pkg, rows }) {
      const t = api.t
      const [open, setOpen] = React.useState(false)
      const collectable = rows.filter(isCollectableRow)
      const mixed = collectable.length > 0 && collectable.length < rows.length
      const inactive = rows.some((row) => row.bundleActive === false)
      const title = api.resolveText(pkg.titles) ?? pkg.title ?? pkg.name
      const description = api.resolveText(pkg.descriptions) ?? pkg.description ?? ''
      const displayName = title && title !== pkg.name ? title : pkg.name
      return h('div', { className: 'ps-card ps-package', style: styles.packageCard },
        h('div', { style: styles.packageHead },
          h('div', { style: styles.pkgBody },
            h('button', { type: 'button', style: styles.packageTitle, title: pkg.name, onClick: () => setOpen(!open) }, termNodes(displayName)),
            displayName !== pkg.name ? h('div', { style: styles.packageModule, title: pkg.name }, pkg.name) : null),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginLeft: 'auto' } },
            h('span', { style: pkg.official ? styles.badge : styles.badgeWarn }, pkg.official ? t('officialTag') : t('thirdParty')),
            inactive ? h('span', { style: styles.badgeWarnYellow, title: t('inactiveHint') }, t('inactiveTag')) : null,
            pkg.presetOnly === true ? h('span', { style: styles.badgeWarn, title: t('presetOnlyHint') }, t('presetOnly')) : null,
            collectable.length === 0
              ? rows.some((row) => row.enabled)
                ? h('span', { style: styles.badgeWarn, title: t('hostActiveHint') }, t('hostActive'))
                : h('span', { style: styles.badgeWarn, title: t('conditionalHint') }, t('conditionalRow'))
              : null,
            h('button', { type: 'button', style: styles.buttonGhost, onClick: () => setOpen(!open), 'aria-label': open ? t('cancel') : t('config') }, open ? '▾' : '▸'))),
        description.length > 0 ? h('div', { style: styles.packageDesc, title: description }, termNodes(description)) : null,
        h('div', { style: styles.packageFoot },
          h('span', { style: styles.packageMeta }, rows.length + ' ' + t('rows') + (collectable.length > 0 ? ' · ' + collectable.length + ' ' + t('collectableSection') : '')),
          h('span', { style: { flex: '1 1 auto' } }),
          collectable.length === 0
            ? h('span', { style: { ...styles.muted, fontSize: 11 } }, inactive ? t('inactiveCollectNone') : t('collectNone'))
            : h('button', {
                type: 'button', style: styles.collectBtn,
                onClick: () => api.collectPackage(pkg, collectable),
              }, h(Icon, { name: 'plus', size: 12, style: { marginRight: 3, verticalAlign: '-2px' } }), mixed ? t('collectUsable') : t('collect'))),
        open ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 } },
          rows.map((row) => h('div', { key: row.id + ':' + row.moduleName, style: { ...styles.rowLine, background: 'transparent', borderColor: tone(6), fontSize: 11 } },
            h('code', { style: { ...styles.code, flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, row.id || row.moduleName),
            row.enabled ? h('span', { style: styles.badgeWarn }, t('hostActive')) : null,
            row.bundleActive === false && row.bundleEnabled !== undefined
              ? h('span', { style: row.bundleEnabled ? styles.badgeWarnYellow : styles.badge, title: row.bundleName ? row.bundleName : t('inactiveHint') }, row.bundleEnabled ? t('bundleEnabledTag') : t('bundleDisabledTag'))
              : null,
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
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' } },
        h('span', { style: { ...styles.muted, fontSize: 11 } }, t('presetId')),
        h(Help, { api, title: t('presetId'), text: t('helpId') }),
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
        error.length > 0 ? h('span', { style: { ...styles.badgeWarn, fontSize: 10 } }, error) : null)
    }

    function SaveBar({ api }) {
      const t = api.t
      const dirty = api.dirty
      return h('div', { style: styles.saveBar },
        h('span', { style: { ...styles.dot, background: dirty ? '#f59e0b' : '#22c55e' } }),
        h('span', { style: dirty ? styles.badgeWarn : styles.badge }, dirty ? t('unsaved') : t('saved')),
        h(Help, { api, title: t('save'), text: t('saveCheckHint') }),
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
      const inactive = api.inactiveUsage(preset)
      const inactiveBundles = [...new Set(inactive.map((item) => item.bundle).filter((name) => name.length > 0))]
      const conflicts = api.conflictUsage(preset)
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        h('div', { style: styles.card },
          h('div', { style: { display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' } },
            h('div', { style: { flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 } },
              editable
                ? h('input', { style: { ...styles.input, fontSize: 14, fontWeight: 650, padding: '6px 9px' }, value: preset.name ?? '', placeholder: t('name'), onChange: (event) => api.updatePreset(preset.id, { name: event.target.value }) })
                : h('strong', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 15 } }, preset.name || preset.id),
              h('div', { style: styles.badgeRow },
                api.canRenamePreset(preset.id)
                  ? h(PresetIdField, { api, preset })
                  : h('code', { style: styles.code }, preset.id),
                official ? h('span', { style: styles.badge }, t('officialTag')) : null,
                !official && !managed && !locked ? h('span', { style: styles.badge }, t('foreign')) : null,
                locked ? h('span', { style: styles.badgeWarn }, t('locked')) : null,
                preset.broken ? h('span', { style: styles.badgeWarn }, t('broken')) : null)),
            h('div', { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' } },
              editable
                ? h('label', { style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, opacity: 0.8 } },
                    h('span', null, t('order')),
                    h('input', { style: { ...styles.input, width: 60, flex: '0 0 60px', padding: '4px 6px' }, type: 'number', value: preset.order ?? '', placeholder: t('order'), onChange: (event) => api.updatePreset(preset.id, { order: event.target.value === '' ? undefined : Number(event.target.value) }) }),
                    h(Help, { api, title: t('order'), text: t('helpOrder') }))
                : preset.order !== undefined ? h('span', { style: styles.badge }, 'order ' + preset.order) : null,
              !official && locked ? h('button', { type: 'button', style: styles.button, onClick: () => api.setLocked(preset.id, false) }, t('unlock')) : null,
              !official && !locked ? h('button', { type: 'button', style: styles.button, onClick: () => api.setLocked(preset.id, true) }, t('lock')) : null,
              !official && !locked ? h('button', { type: 'button', style: styles.button, onClick: () => api.deletePreset(preset.id) }, t('deletePreset')) : null,
              !official && !managed && !locked && preset.canAdopt ? h('button', { type: 'button', style: styles.buttonPrimary, onClick: () => api.adoptPreset(preset.id) }, t('adopt')) : null)),
          editable
            ? h('textarea', { style: { ...styles.input, minHeight: 38, resize: 'vertical', opacity: 0.9 }, value: preset.description ?? '', placeholder: t('description'), onChange: (event) => api.updatePreset(preset.id, { description: event.target.value }) })
            : h('div', { style: { ...styles.muted, display: 'flex', alignItems: 'center', gap: 5 } },
                official ? t('officialHint') : locked ? t('lockedHint') : t('foreignHint'),
                h(Help, { api, title: official ? t('official') : locked ? t('locked') : t('foreign'), text: official ? t('officialHint') : locked ? t('lockedHint') : t('foreignHint') })),
          !editable && typeof preset.description === 'string' && preset.description.length > 0
            ? h('div', { style: styles.muted }, preset.description)
            : null,
          !official && !managed && !locked && !preset.canAdopt
            ? h('div', { style: styles.muted }, t('adoptUnavailable'))
            : null),
        editable ? h(SaveBar, { api }) : null,
        conflicts.length > 0
          ? h('div', { style: styles.errorWarnBox },
              h('div', { style: { flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 3 } },
                h('div', { style: { fontWeight: 650, color: '#b91c1c' } }, t('conflictWarning', { count: conflicts.length })),
                conflicts.map((item) => h('div', { key: item.id + '|' + item.name, style: { display: 'flex', gap: 6, fontSize: 11, flexWrap: 'wrap' } },
                  h('code', { style: { ...styles.code, color: 'inherit', opacity: 0.8 } }, item.id || '—'),
                  h('code', { style: { ...styles.code, color: 'inherit', opacity: 0.8 } }, item.name)))),
              h(Help, { api, title: t('conflictWarningShort'), text: t('conflictHint') }))
          : null,
        inactive.length > 0
          ? h('div', { style: styles.inactiveWarnBox },
              h('div', { style: { flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 3 } },
                h('div', { style: { fontWeight: 650 } }, t('inactiveWarning', { count: inactive.length, bundles: inactiveBundles.join(', ') })),
                inactive.map((item) => h('div', { key: item.moduleName, style: { display: 'flex', gap: 6, fontSize: 11, flexWrap: 'wrap' } },
                  h('code', { style: { ...styles.code, color: 'inherit', opacity: 0.8 } }, item.moduleName),
                  h('span', { style: { opacity: 0.6 } }, '· ' + item.bundle)))),
              h(Help, { api, title: t('inactiveTag'), text: t('inactiveHint') }))
          : null,
        preset.broken
          ? h('div', { style: styles.errorBox },
              h('div', { style: { fontWeight: 600, marginBottom: 4 } }, t('broken') + ': ' + preset.broken),
              h('div', { style: styles.muted }, t('brokenHint')))
          : null,
        api.notice !== null ? h('div', { style: styles.errorBox }, api.notice) : null,
        h('div', { style: { ...styles.toolbar, justifyContent: 'space-between' } },
          h('div', { className: 'ps-seg' },
            h('button', { type: 'button', 'data-active': api.tab === 'compose', onClick: () => api.setTab('compose') }, t('composition')),
            h('button', { type: 'button', 'data-active': api.tab === 'yaml', onClick: () => api.setTab('yaml') }, t('yaml'))),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
            api.tab === 'compose' && managed
              ? h('div', { className: 'ps-seg' },
                  h('button', { type: 'button', 'data-active': api.view === 'structure', onClick: () => api.setView('structure') }, t('viewStructure')),
                  h('button', { type: 'button', 'data-active': api.view === 'package', onClick: () => api.setView('package') }, t('viewPackage')))
              : null,
            api.tab === 'compose' && managed && !locked ? h('span', { style: { ...styles.muted, fontSize: 11 } }, api.selectedGroupId === null ? t('targetRoot') : t('targetGroup', { id: api.selectedGroupId })) : null,
            api.tab === 'compose' && editable
              ? h('button', { type: 'button', style: { ...styles.button, display: 'inline-flex', alignItems: 'center', gap: 4 }, onClick: () => api.setAddRowOpen(!api.addRowOpen) },
                  h(Icon, { name: 'plus', size: 12 }), t('addRow'))
              : null,
            api.tab === 'compose' && editable
              ? h('button', { type: 'button', style: styles.button, onClick: () => api.addGroup(preset.id) }, t('addGroup'))
              : null)),
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

      const inactiveModules = React.useMemo(() => {
        const map = new Map()
        for (const pkg of state?.packages ?? []) {
          for (const row of pkg.rows ?? []) {
            if (row.bundleActive === false && !map.has(row.moduleName)) {
              map.set(row.moduleName, {
                bundle: typeof row.bundleName === 'string' ? row.bundleName : '',
                bundleEnabled: row.bundleEnabled === true,
              })
            }
          }
        }
        return map
      }, [state])

      const activeRowIds = React.useMemo(() => {
        const map = new Map()
        for (const pkg of state?.packages ?? []) {
          for (const row of pkg.rows ?? []) {
            if (row.bundleActive !== false && row.enabled === true && typeof row.id === 'string' && row.id.length > 0 && !map.has(row.id)) {
              map.set(row.id, { moduleName: row.moduleName, packageName: pkg.name })
            }
          }
        }
        return map
      }, [state])

      const inactiveUsage = (preset) => {
        const found = new Map()
        walkRows(preset.plugins, (row) => {
          const hit = inactiveModules.get(row.name)
          if (hit !== undefined && !found.has(row.name)) {
            found.set(row.name, { moduleName: row.name, bundle: hit.bundle, bundleEnabled: hit.bundleEnabled })
          }
        })
        return [...found.values()]
      }

      const conflictUsage = (preset) => {
        const found = []
        const seen = new Set()
        walkRows(preset.plugins, (row) => {
          if (row.disabled === true || typeof row.id !== 'string' || row.id.length === 0) return
          const hit = activeRowIds.get(row.id)
          if (hit === undefined) return
          const key = row.id + '|' + row.name
          if (seen.has(key)) return
          seen.add(key)
          found.push({ id: row.id, name: row.name, hostModule: hit.moduleName, packageName: hit.packageName })
        })
        return found
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
          if (inactiveUsage(preset).length > 0) issues.push(preset.id + ': ' + t('inactiveWarningShort'))
          if (conflictUsage(preset).length > 0) issues.push(preset.id + ': ' + t('conflictWarningShort'))
        }
        return issues
      }, [draft, state, inactiveModules, activeRowIds])

      const api = {
        t, state, draft, selectedId, selected, dirty, saving, notice, status,
        resolveText,
        inactiveModules, inactiveUsage, activeRowIds, conflictUsage,
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
        h('div', { className: 'ps-topbar', style: styles.topbar },
          h('div', { style: styles.brand },
            h('span', { style: styles.logo }, h(Icon, { name: 'spark', size: 16 })),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 } },
              h('h1', { style: styles.title }, t('title')),
              h('p', { style: styles.subtitle }, t('subtitle')))),
          h('span', { style: { flex: '1 1 auto' } }),
          state?.profile?.name ? h('span', { style: styles.profileChip }, h('span', { style: styles.profileDot }), 'profile: ' + state.profile.name) : null,
          state?.hmr === false ? h('span', { style: styles.badgeWarn }, 'HMR off') : null,
          h(DesignNotes, { api }),
          h('button', {
            type: 'button', style: styles.iconButton, title: t('refresh'), 'aria-label': t('refresh'),
            onClick: () => void load(),
          }, h(Icon, { name: 'refresh', size: 14 }))),
        h('div', { style: styles.body },
          h('aside', { className: 'ps-scroll', style: { ...styles.column, ...styles.left } }, h(PresetColumn, { api })),
          h('main', { className: 'ps-scroll', style: { ...styles.column, ...styles.middle } }, h(Editor, { api })),
          h('aside', { style: { ...styles.right, display: 'flex', flexDirection: 'column', minHeight: 0 } },
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
