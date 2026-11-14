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
      help: '帮助',
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
      pageSimple: '简易',
      pageStandard: '标准',
      pageCompare: '对比',
      simpleSubtitle: '轻量配置：名称、ID、描述与人设。',
      compareSubtitle: '左右并排两个预设，按 Loader 行 id 对齐，查看声明、启停与字段级配置差异。',
      compareTitle: '预设对比',
      comparePickA: '预设 A',
      comparePickB: '预设 B',
      compareSwap: '交换 A/B',
      compareOnlyDiff: '只看差异',
      compareLoading: '读取中…',
      compareLoadFailed: '读取预设失败',
      compareSummary: 'A 启用 {a} 行 · B 启用 {b} 行 · 差异 {diff} 处',
      compareOnlyLeft: '只在 A',
      compareOnlyRight: '只在 B',
      compareStateDiff: '启停不同',
      compareConfigDiff: '配置不同',
      comparePathDiff: '分组不同',
      compareSame: '相同',
      compareEmpty: '两边都没有可比较的行。',
      compareSelf: '两侧是同一个预设。',
      compareDraft: '含未保存草稿',
      compareEnabled: '启用',
      compareDisabled: '禁用',
      compareConditional: '条件',
      compareRow: '行',
      compareConfigMismatch: '两边的 config 不一致',
      comparePathMismatch: '两边的分组路径不一致',
      compareRoot: '根',
      compareNoDiff: '没有差异。',
      compareHelp: '按 Loader 行 id 对齐：同 id 才视为同一行。状态取有效值，组被禁用时其子行也按禁用比较；条件行单列，不与启用合并。',
      compareRules: '对齐规则',
      simpleTitle: '简易配置',
      simpleIntro: '选一个预设，改名字、ID、描述与人设，保存即可。',
      simplePickBase: '基础预设',
      simpleReadonly: '官方预设只读，会先复制一个自定义副本。',
      simpleCopyEdit: '复制并编辑',
      simpleName: '预设名称',
      simpleId: '预设 ID',
      simpleIdHint: '小写字母、数字、连字符；留空自动生成；保存后不可改。',
      simpleIdBlankUses: '当前将使用 {id}；保存后不可改。',
      simpleIdPlaceholder: '留空自动生成',
      simpleIdInvalid: 'ID 只能使用小写字母、数字和连字符，且以字母或数字开头。',
      simpleDescription: '描述',
      simpleDescriptionPlaceholder: '一句话说明这个预设的用途（可留空）',
      simplePersona: '人设提示词',
      simplePersonaHint: '写清这个 Agent 是谁、该怎么做事；会写入 persona 的 prefix，保存后对新会话生效。',
      simplePersonaPlaceholder: '例如：你是一名谨慎的代码审阅者，先读代码再给结论……',
      simpleNoPersona: '这个预设没有 persona 行；请到标准页添加后再来。',
      simpleMore: '更多设置（标准页）',
      simpleSuffix: ' 简易版',
      simpleEditing: '正在编辑',
      simpleLocked: '这个预设已锁定，解锁后才能在简易页修改。',
      simpleEmpty: '没有可编辑的自定义预设；先从官方预设复制一个，或去标准页新建。',
      simpleDraftNote: '简易页只改名称与人设，其余行、组与配置请在标准页处理。',
      simpleSavedElsewhere: '保存会同时提交工作台里的其它未保存改动。',
      simpleCopyFailed: '复制失败',
      compareFieldDiff: '字段级差异',
      compareFieldDiffHint: '按 config 的叶子路径逐项比较；对象按键、数组按下标展开，相同字段不列出。',
      compareFieldsCount: '{count} 项配置不同',
      compareLegendSame: '相同',
      compareLegendLeft: '仅左侧',
      compareLegendRight: '仅右侧',
      compareLegendState: '启停不同',
      compareLegendConfig: '配置不同',
      compareLegendPath: '分组不同',
      compareRowsShort: '{rows} 行 · {enabled} 启用',
      compareNoRowsSide: '没有行',
      compareGhost: '未声明',
      compareDiffCount: '差异 {count} 处',
      compareValueEmpty: '空',
      compareInheritedChip: '继承：{state}',
      compareInheritedHint: '行本身为「{declared}」，受祖先组影响后为「{state}」。',
      compareExpand: '展开',
      compareCollapse: '收起',
      compareField: '字段',
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
      help: 'Help',
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
      pageSimple: 'Simple',
      pageStandard: 'Standard',
      pageCompare: 'Compare',
      simpleSubtitle: 'Light setup: name, ID, description and persona.',
      compareSubtitle: 'Put two presets side by side, aligned by Loader row id, with state and field-level config differences.',
      compareTitle: 'Preset comparison',
      comparePickA: 'Preset A',
      comparePickB: 'Preset B',
      compareSwap: 'Swap A/B',
      compareOnlyDiff: 'Differences only',
      compareLoading: 'Loading…',
      compareLoadFailed: 'Failed to load the preset',
      compareSummary: 'A enables {a} row(s) · B enables {b} · {diff} difference(s)',
      compareOnlyLeft: 'Only in A',
      compareOnlyRight: 'Only in B',
      compareStateDiff: 'State differs',
      compareConfigDiff: 'Config differs',
      comparePathDiff: 'Group differs',
      compareSame: 'Same',
      compareEmpty: 'Neither preset declares any row.',
      compareSelf: 'Both sides are the same preset.',
      compareDraft: 'includes unsaved draft',
      compareEnabled: 'enabled',
      compareDisabled: 'disabled',
      compareConditional: 'conditional',
      compareRow: 'Row',
      compareConfigMismatch: 'The two configs differ',
      comparePathMismatch: 'The two group paths differ',
      compareRoot: 'root',
      compareNoDiff: 'No differences.',
      compareHelp: 'Aligned by Loader row id: only the same id counts as the same row. States are effective, so a row inside a disabled group is compared as disabled; conditional rows stay separate from enabled ones.',
      compareRules: 'Alignment rules',
      simpleTitle: 'Simple setup',
      simpleIntro: 'Pick a preset, then adjust its name, ID, description and persona before saving.',
      simplePickBase: 'Base preset',
      simpleReadonly: 'Official presets are read-only; a custom copy is created first.',
      simpleCopyEdit: 'Copy and edit',
      simpleName: 'Preset name',
      simpleId: 'Preset ID',
      simpleIdHint: 'Lowercase letters, digits and hyphens; leave blank to auto-generate; fixed after saving.',
      simpleIdBlankUses: 'It will use {id}; fixed after saving.',
      simpleIdPlaceholder: 'Leave blank to auto-generate',
      simpleIdInvalid: 'IDs use lowercase letters, digits and hyphens, starting with a letter or digit.',
      simpleDescription: 'Description',
      simpleDescriptionPlaceholder: 'One line about what this preset is for (optional)',
      simplePersona: 'Persona prompt',
      simplePersonaHint: 'Describe who this Agent is and how it should work; it becomes the persona prefix and applies to new sessions after saving.',
      simplePersonaPlaceholder: 'e.g. You are a careful code reviewer: read the code first, then give conclusions…',
      simpleNoPersona: 'This preset has no persona row; add one on the Standard page first.',
      simpleMore: 'More settings (Standard page)',
      simpleSuffix: ' simple',
      simpleEditing: 'Editing',
      simpleLocked: 'This preset is locked; unlock it before editing here.',
      simpleEmpty: 'No editable custom preset yet; copy an official one or create one on the Standard page.',
      simpleDraftNote: 'The Simple page only changes the name and persona; rows, groups and config stay on the Standard page.',
      simpleSavedElsewhere: 'Saving also submits other pending changes from the workbench.',
      simpleCopyFailed: 'Copy failed',
      compareFieldDiff: 'Field-level differences',
      compareFieldDiffHint: 'Compares config leaf paths field by field; objects expand by key and arrays by index, and equal fields are omitted.',
      compareFieldsCount: '{count} config field(s) differ',
      compareLegendSame: 'Same',
      compareLegendLeft: 'Only left',
      compareLegendRight: 'Only right',
      compareLegendState: 'State differs',
      compareLegendConfig: 'Config differs',
      compareLegendPath: 'Group differs',
      compareRowsShort: '{rows} rows · {enabled} enabled',
      compareNoRowsSide: 'No rows',
      compareGhost: 'not declared',
      compareDiffCount: '{count} difference(s)',
      compareValueEmpty: 'empty',
      compareInheritedChip: 'Inherited {state}',
      compareInheritedHint: 'Declared {declared}, effective {state} after an ancestor group.',
      compareExpand: 'Expand',
      compareCollapse: 'Collapse',
      compareField: 'Field',
    }

    const tone = (percent) => `color-mix(in srgb, currentColor ${percent}%, transparent)`

    const STYLE_TEXT = `
      .ps-root {
        --ps-danger: var(--dsw-alias-color-danger, var(--dsw-alias-danger, #dc2626));
        --ps-warn: var(--dsw-alias-color-warning, var(--dsw-alias-warning, #d97706));
        --ps-ok: var(--dsw-alias-color-success, var(--dsw-alias-success, #22c55e));
        background: linear-gradient(180deg, color-mix(in srgb, currentColor 2%, transparent), transparent 180px);
      }
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
      .ps-topbar { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 12px; background: color-mix(in srgb, var(--dsw-alias-bg-base, Canvas) 94%, transparent); }
      .ps-brand { min-width: 0; }
      .ps-brand .ps-subtitle { max-width: min(300px, 26vw); }
      .ps-topnav { justify-self: center; min-width: 0; }
      .ps-actions { justify-self: end; display: flex; align-items: center; justify-content: flex-end; gap: 8px; min-width: 0; flex-wrap: wrap; }
      @media (max-width: 1040px) {
        .ps-topbar { grid-template-columns: minmax(0, 1fr) auto; }
        .ps-topnav { grid-column: 1 / -1; grid-row: 2; }
        .ps-brand .ps-subtitle { max-width: 52vw; }
      }
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
      .ps-simple, .ps-simple * { box-sizing: border-box; }
      .ps-simple { width: 100%; max-width: 720px; margin: 0 auto; padding: 20px 18px 48px; display: flex; flex-direction: column; gap: 12px; }
      .ps-simple-title { margin: 0 0 2px; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
      .ps-simple-intro { margin: 0; font-size: 12.5px; opacity: 0.64; line-height: 1.6; }
      .ps-simple-block { display: flex; flex-direction: column; gap: 5px; }
      .ps-simple-label { font-size: 11.5px; font-weight: 650; opacity: 0.72; }
      .ps-simple-hint { font-size: 11px; opacity: 0.55; line-height: 1.5; }
      .ps-simple-error { font-size: 11px; color: var(--ps-danger); line-height: 1.45; }
      .ps-simple-persona { min-height: 210px !important; font-family: inherit !important; font-size: 13.5px !important; line-height: 1.65 !important; padding: 11px 13px !important; }
      .ps-simple-foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 11px; opacity: 0.62; }
      .ps-cmp, .ps-cmp * { box-sizing: border-box; }
      .ps-cmp { display: flex; flex-direction: column; width: 100%; max-width: 1440px; margin: 0 auto; padding: 14px 20px 44px; gap: 8px; }
      .ps-cmp-head { position: sticky; top: 0; z-index: 7; display: grid; grid-template-columns: minmax(0, 1fr) 44px minmax(0, 1fr); align-items: stretch; border: 1px solid color-mix(in srgb, currentColor 12%, transparent); border-radius: 12px; background: var(--dsw-alias-bg-base, Canvas); overflow: hidden; }
      .ps-cmp-headcell { padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
      .ps-cmp-headcell + .ps-cmp-headcell { border-left: 1px solid color-mix(in srgb, currentColor 8%, transparent); }
      .ps-cmp-kicker { font-size: 10.5px; letter-spacing: 0.04em; font-weight: 650; opacity: 0.58; }
      .ps-cmp-select { width: 100% !important; max-width: none !important; font-size: 12.5px !important; padding: 5px 8px !important; }
      .ps-cmp-meta { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; font-size: 11px; opacity: 0.62; }
      .ps-cmp-swap { align-self: center; justify-self: center; }
      .ps-cmp-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 0 2px 2px; }
      .ps-cmp-legend { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 11px; opacity: 0.78; }
      .ps-legend-item { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
      .ps-legend-swatch { width: 9px; height: 9px; border-radius: 3px; border: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
      .ps-cmp-body { display: flex; flex-direction: column; border: 1px solid color-mix(in srgb, currentColor 10%, transparent); border-radius: 12px; overflow: hidden; }
      .ps-cmp-row { display: grid; grid-template-columns: minmax(0, 1fr) 44px minmax(0, 1fr); border-top: 1px solid color-mix(in srgb, currentColor 6%, transparent); }
      .ps-cmp-row:first-child { border-top: none; }
      .ps-cmp-row:hover { background: color-mix(in srgb, currentColor 3.5%, transparent); }
      .ps-cmp-cell { padding: 9px 12px; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 3px; }
      .ps-cmp-cell.del { background: color-mix(in srgb, var(--ps-danger) 7%, transparent); box-shadow: inset 2px 0 0 color-mix(in srgb, var(--ps-danger) 55%, transparent); }
      .ps-cmp-cell.add { background: color-mix(in srgb, var(--ps-ok) 8%, transparent); box-shadow: inset 2px 0 0 color-mix(in srgb, var(--ps-ok) 60%, transparent); }
      .ps-cmp-cell.mod { background: color-mix(in srgb, var(--ps-warn) 6%, transparent); box-shadow: inset 2px 0 0 color-mix(in srgb, var(--ps-warn) 45%, transparent); }
      .ps-cmp-cell.modconfig { background: color-mix(in srgb, #4f7cff 5%, transparent); box-shadow: inset 2px 0 0 color-mix(in srgb, #4f7cff 45%, transparent); }
      .ps-cmp-cell.modpath { background: color-mix(in srgb, currentColor 3.5%, transparent); box-shadow: inset 2px 0 0 color-mix(in srgb, currentColor 20%, transparent); }
      .ps-cmp-cell.ghost { background: repeating-linear-gradient(135deg, color-mix(in srgb, currentColor 3%, transparent) 0 6px, transparent 6px 12px); }
      .ps-cmp-gutter { display: flex; align-items: center; justify-content: center; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 13px; font-weight: 700; }
      .ps-cmp-main { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; min-width: 0; }
      .ps-cmp-identity { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .ps-cmp-modline { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .ps-cmp-preview { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 10.5px; opacity: 0.56; padding-left: 8px; border-left: 1px solid color-mix(in srgb, currentColor 13%, transparent); }
      .ps-cmp-chips { display: flex; align-items: center; justify-content: flex-end; gap: 5px; flex-wrap: wrap; min-width: 0; }
      .ps-cmp-chip { font-size: 10px; line-height: 1.5; padding: 1px 7px; border-radius: 999px; background: color-mix(in srgb, currentColor 6.5%, transparent); opacity: 0.72; white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
      .ps-cmp-id { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12.5px; font-weight: 650; opacity: 0.92; }
      .ps-cmp-mod { font-size: 11px; opacity: 0.6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
      .ps-cmp-state { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; white-space: nowrap; }
      .ps-cmp-dot { width: 6px; height: 6px; border-radius: 999px; flex: 0 0 auto; }
      .ps-cmp-ghost { font-size: 11px; opacity: 0.4; font-style: italic; }
      .ps-cmp-diffbar { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; width: 100%; padding: 5px 12px; border: 0; border-top: 1px solid color-mix(in srgb, currentColor 8%, transparent); background: color-mix(in srgb, #4f7cff 4.5%, transparent); color: inherit; cursor: pointer; font: inherit; text-align: left; }
      .ps-cmp-diffbar:hover { background: color-mix(in srgb, #4f7cff 8%, transparent); }
      .ps-cmp-diffbar-tag { font-size: 10.5px; font-weight: 650; color: color-mix(in srgb, #4f7cff 78%, currentColor); white-space: nowrap; }
      .ps-cmp-diffbar-paths { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 10.5px; opacity: 0.62; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
      .ps-cmp-diffbar-action { margin-left: auto; font-size: 10.5px; opacity: 0.72; white-space: nowrap; }
      .ps-cmp-fields { grid-column: 1 / -1; margin: 0 12px 10px; border: 1px solid color-mix(in srgb, currentColor 12%, transparent); border-radius: 9px; overflow: auto; max-height: 320px; background: color-mix(in srgb, currentColor 1.5%, transparent); }
      .ps-cmp-field { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr); gap: 10px; padding: 4px 10px; font-size: 11px; line-height: 1.5; }
      .ps-cmp-field + .ps-cmp-field { border-top: 1px solid color-mix(in srgb, currentColor 6%, transparent); }
      .ps-cmp-fieldpath { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; opacity: 0.72; word-break: break-all; }
      .ps-cmp-fieldval { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; word-break: break-word; min-width: 0; }
      .ps-cmp-fieldval.del { color: color-mix(in srgb, var(--ps-danger) 78%, currentColor); }
      .ps-cmp-fieldval.add { color: color-mix(in srgb, var(--ps-ok) 72%, currentColor); }
      .ps-cmp-fieldhead { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr); gap: 10px; padding: 5px 10px; font-size: 10px; letter-spacing: 0.03em; opacity: 0.55; border-bottom: 1px solid color-mix(in srgb, currentColor 8%, transparent); }
      .ps-actions .ps-profile { max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      @media (max-width: 1180px) {
        .ps-actions .ps-profile { display: none; }
      }
      @media (max-width: 900px) {
        .ps-cmp-head, .ps-cmp-row { grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr); }
        .ps-cmp-main { grid-template-columns: minmax(0, 1fr) auto; }
        .ps-cmp-identity { grid-column: 1; }
        .ps-cmp-chips { grid-column: 1 / -1; justify-content: flex-start; }
        .ps-cmp-field, .ps-cmp-fieldhead { grid-template-columns: minmax(0, 1fr); gap: 2px; }
      }
    `

    const styles = {
      root: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, color: 'inherit', fontSize: 13, boxSizing: 'border-box', position: 'relative' },
      topbar: { padding: '10px 16px 9px', borderBottom: `1px solid ${tone(10)}` },
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
      inactiveBanner: { display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 8, padding: '6px 9px', borderRadius: 9, border: '1px solid color-mix(in srgb, var(--ps-warn) 45%, transparent)', background: 'color-mix(in srgb, var(--ps-warn) 10%, Canvas)', fontSize: 11, lineHeight: 1.45 },
      collectBtn: { padding: '3px 8px', borderRadius: 7, border: `1px solid ${tone(30)}`, background: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: 11.5, fontWeight: 600 },
      muted: { opacity: 0.62, fontSize: 12 },
      empty: { padding: '18px 8px', opacity: 0.6, textAlign: 'center', fontSize: 12 },
      errorBox: { padding: '10px 12px', borderRadius: 8, background: tone(8), border: `1px solid ${tone(16)}`, fontSize: 12 },
      errorWarnBox: { display: 'flex', alignItems: 'flex-start', gap: 6, padding: '7px 9px', borderRadius: 9, border: '1px solid color-mix(in srgb, var(--ps-danger) 55%, transparent)', background: 'color-mix(in srgb, var(--ps-danger) 8%, Canvas)', fontSize: 11.5, lineHeight: 1.45 },
      inactiveWarnBox: { display: 'flex', alignItems: 'flex-start', gap: 6, padding: '7px 9px', borderRadius: 9, border: '1px solid color-mix(in srgb, var(--ps-warn) 55%, transparent)', background: 'color-mix(in srgb, var(--ps-warn) 13%, Canvas)', fontSize: 11.5, lineHeight: 1.45 },
      badgeError: { fontSize: 10, padding: '1px 6px', borderRadius: 999, border: '1px solid color-mix(in srgb, var(--ps-danger) 50%, transparent)', background: 'color-mix(in srgb, var(--ps-danger) 12%, Canvas)', color: 'color-mix(in srgb, var(--ps-danger) 65%, currentColor)', whiteSpace: 'nowrap' },
      badgeWarnYellow: { fontSize: 10, padding: '1px 6px', borderRadius: 999, border: '1px solid color-mix(in srgb, var(--ps-warn) 50%, transparent)', background: 'color-mix(in srgb, var(--ps-warn) 15%, Canvas)', color: 'color-mix(in srgb, var(--ps-warn) 70%, currentColor)', whiteSpace: 'nowrap' },
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

    function findPersonaRow(rows) {
      let found
      walkRows(rows, (row) => {
        if (found === undefined && !isGroup(row) && (row.id === 'persona' || row.name === '@deepseek-ai/dsh-persona')) found = row
      })
      return found
    }

    function presetChoiceLabel(choice, nameCounts) {
      const name = String(choice.name || choice.id)
      return (nameCounts.get(name) ?? 0) > 1 ? name + ' · ' + choice.id : name
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

    // ---------- collectability rules ----------
    // Golden contract: bundle/lib/rules.mjs, exercised by test/unit.mjs.
    // The client ships as one plain-JS file, so keep this small copy in sync.

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

    // ---------- preset comparison ----------
    // Golden contract: bundle/lib/diff.mjs, exercised by test/unit.mjs.
    // The client ships as one plain-JS file, so keep this small copy in sync.

    function canonicalConfig(value) {
      if (value === null || value === undefined) return 'null'
      if (typeof value !== 'object') return JSON.stringify(value)
      if (Array.isArray(value)) return '[' + value.map(canonicalConfig).join(',') + ']'
      const keys = Object.keys(value).sort()
      if (keys.length === 0) return 'null'
      return '{' + keys.map((key) => JSON.stringify(key) + ':' + canonicalConfig(value[key])).join(',') + '}'
    }

    function combineRowState(inherited, own) {
      if (inherited === 'disabled' || own === 'disabled') return 'disabled'
      if (inherited === 'conditional' || own === 'conditional') return 'conditional'
      return 'enabled'
    }

    function configFields(value, prefix = '', out = []) {
      if (value === null || value === undefined) {
        out.push({ path: prefix, value: null })
        return out
      }
      if (typeof value !== 'object') {
        out.push({ path: prefix, value })
        return out
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          out.push({ path: prefix, value: [] })
          return out
        }
        value.forEach((item, index) => configFields(item, prefix + '[' + index + ']', out))
        return out
      }
      const keys = Object.keys(value).sort()
      if (keys.length === 0) {
        out.push({ path: prefix, value: {} })
        return out
      }
      for (const key of keys) {
        configFields(value[key], prefix.length === 0 ? key : prefix + '.' + key, out)
      }
      return out
    }

    function configFieldDiff(left, right) {
      const leftFields = new Map(configFields(left).map((field) => [field.path, field.value]))
      const rightFields = new Map(configFields(right).map((field) => [field.path, field.value]))
      const paths = [...new Set([...leftFields.keys(), ...rightFields.keys()])].sort()
      const diff = []
      for (const path of paths) {
        const hasLeft = leftFields.has(path)
        const hasRight = rightFields.has(path)
        const leftValue = leftFields.get(path)
        const rightValue = rightFields.get(path)
        if (hasLeft && hasRight && canonicalConfig(leftValue) === canonicalConfig(rightValue)) continue
        diff.push({
          path,
          left: hasLeft ? leftValue : undefined,
          right: hasRight ? rightValue : undefined,
          kind: !hasLeft ? 'added' : !hasRight ? 'removed' : 'changed',
        })
      }
      return diff
    }

    /** Flatten a composition into leaf rows with effective state and group path. */
    function flattenPresetRows(rows) {
      const leaves = []
      const visit = (list, path, inherited) => {
        if (!Array.isArray(list)) return
        for (const row of list) {
          if (row === null || typeof row !== 'object') continue
          if (isGroup(row)) {
            const state = combineRowState(inherited, rowState(row))
            visit(row.config, [...path, typeof row.id === 'string' ? row.id : ''], state)
            continue
          }
          leaves.push({
            id: typeof row.id === 'string' && row.id.length > 0 ? row.id : undefined,
            name: typeof row.name === 'string' ? row.name : '',
            path: [...path],
            state: combineRowState(inherited, rowState(row)),
            declared: rowState(row),
            config: row.config === undefined ? null : row.config,
            configKey: canonicalConfig(row.config),
          })
        }
      }
      visit(rows, [], 'enabled')
      return leaves
    }

    function indexPresetLeaves(leaves) {
      const map = new Map()
      const order = []
      for (const leaf of leaves) {
        const base = leaf.id ?? 'name:' + leaf.name
        let key = base
        let index = 2
        while (map.has(key)) {
          key = base + '#' + index
          index += 1
        }
        map.set(key, leaf)
        order.push(key)
      }
      return { map, order }
    }

    function samePath(left, right) {
      if (left.length !== right.length) return false
      for (let index = 0; index < left.length; index += 1) {
        if (left[index] !== right[index]) return false
      }
      return true
    }

    function diffPresetRows(leftRows, rightRows) {
      const left = indexPresetLeaves(flattenPresetRows(leftRows))
      const right = indexPresetLeaves(flattenPresetRows(rightRows))
      const keys = [...left.order, ...right.order.filter((key) => !left.map.has(key))]
      const items = []
      const summary = {
        leftRows: left.map.size, rightRows: right.map.size,
        leftEnabled: 0, rightEnabled: 0, leftConditional: 0, rightConditional: 0,
        onlyLeft: 0, onlyRight: 0, stateDiff: 0, configDiff: 0, pathDiff: 0, same: 0,
      }
      for (const key of keys) {
        const a = left.map.get(key)
        const b = right.map.get(key)
        if (a !== undefined) {
          if (a.state === 'enabled') summary.leftEnabled += 1
          if (a.state === 'conditional') summary.leftConditional += 1
        }
        if (b !== undefined) {
          if (b.state === 'enabled') summary.rightEnabled += 1
          if (b.state === 'conditional') summary.rightConditional += 1
        }
        const item = {
          key,
          id: a?.id ?? b?.id,
          name: a?.name ?? b?.name ?? '',
          left: a === undefined ? { present: false } : { present: true, state: a.state, declared: a.declared, path: a.path, config: a.config },
          right: b === undefined ? { present: false } : { present: true, state: b.state, declared: b.declared, path: b.path, config: b.config },
          status: 'same',
          stateDiff: false,
          configDiff: false,
          pathDiff: false,
        }
        if (a === undefined) {
          item.status = 'only-right'
        } else if (b === undefined) {
          item.status = 'only-left'
        } else {
          item.stateDiff = a.state !== b.state
          item.configDiff = a.configKey !== b.configKey
          item.pathDiff = !samePath(a.path, b.path)
          if (item.stateDiff) item.status = 'state'
          else if (item.configDiff) item.status = 'config'
          else if (item.pathDiff) item.status = 'path'
        }
        if (item.status === 'only-left') summary.onlyLeft += 1
        else if (item.status === 'only-right') summary.onlyRight += 1
        else if (item.status === 'state') summary.stateDiff += 1
        else if (item.status === 'config') summary.configDiff += 1
        else if (item.status === 'path') summary.pathDiff += 1
        else summary.same += 1
        items.push(item)
      }
      return { items, summary }
    }

    // ---------- view memory ----------

    /**
     * Where the user was looking. The panel unmounts whenever another sidebar
     * entry takes the main slot, so React state alone cannot survive a trip to
     * the Conversation and back. Only the view is remembered here; every mount
     * still reloads `/state` from the Host, and a remembered id that no longer
     * exists falls back to the same default the component would have picked.
     */
    const MEMORY_KEY = 'dsh.preset-studio.view.v1'
    const MEMORY_PAGES = ['simple', 'standard', 'compare']
    const MEMORY_VIEWS = ['structure', 'package']
    const MEMORY_TABS = ['compose', 'yaml']

    /** Last successful `/state` body, reused while the panel remounts. */
    let warmState = null

    function memoryObject(value) {
      return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}
    }

    function readMemory() {
      try {
        const raw = window.localStorage?.getItem(MEMORY_KEY)
        if (typeof raw !== 'string' || raw.length === 0) return {}
        const value = memoryObject(JSON.parse(raw))
        return value.v === 1 ? value : {}
      } catch {
        // Storage disabled, full, or a record written by another version: start clean.
        return {}
      }
    }

    function writeMemory(patch) {
      try {
        window.localStorage?.setItem(MEMORY_KEY, JSON.stringify({ ...readMemory(), ...patch, v: 1 }))
      } catch {
        // A full or unavailable store only costs the next restore.
      }
    }

    function memoryText(value) {
      return typeof value === 'string' && value.length > 0 ? value : null
    }

    function memoryOneOf(value, allowed, fallback) {
      return allowed.includes(value) ? value : fallback
    }

    function memoryFlags(value) {
      const flags = {}
      for (const [key, flag] of Object.entries(memoryObject(value))) if (flag === true) flags[key] = true
      return flags
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
            h('span', { style: { ...styles.presetMeta, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 } },
              h('code', { style: { ...styles.code, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } }, preset.id),
              preset.order !== undefined
                ? h('span', {
                    title: t('order') + ' ' + preset.order,
                    style: { marginLeft: 'auto', flex: '0 0 auto', fontSize: 10, opacity: 0.62, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' },
                  }, '#' + preset.order)
                : null))))
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
        ? { borderColor: 'color-mix(in srgb, var(--ps-danger) 60%, transparent)', background: 'color-mix(in srgb, var(--ps-danger) 6%, Canvas)', boxShadow: 'inset 2px 0 0 var(--ps-danger)' }
        : offBundle
          ? { borderColor: 'color-mix(in srgb, var(--ps-warn) 55%, transparent)', background: 'color-mix(in srgb, var(--ps-warn) 10%, Canvas)', boxShadow: 'inset 2px 0 0 var(--ps-warn)' }
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
        h('span', { style: { ...styles.dot, background: dirty ? 'var(--ps-warn)' : 'var(--ps-ok)' } }),
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
                h('div', { style: { fontWeight: 650, color: 'color-mix(in srgb, var(--ps-danger) 70%, currentColor)' } }, t('conflictWarning', { count: conflicts.length })),
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

    function SimplePage({ api }) {
      const t = api.t
      const remembered = React.useMemo(() => readMemory(), [])
      const rememberedSimple = memoryObject(remembered.simple)
      const initialManaged = api.selected?.kind === 'managed'
        ? api.selected.id
        : (api.draft.find((preset) => preset.locked !== true)?.id ?? null)
      const [workingId, setWorkingId] = React.useState(() => memoryText(rememberedSimple.workingId) ?? initialManaged)
      const [baseId, setBaseId] = React.useState(() => memoryText(rememberedSimple.baseId) ?? (initialManaged ?? api.selectedId ?? api.presetChoices[0]?.id ?? null))
      const [notice, setNotice] = React.useState(null)
      const [copying, setCopying] = React.useState(false)
      const [idText, setIdText] = React.useState(initialManaged ?? '')
      const [idError, setIdError] = React.useState(null)

      React.useEffect(() => {
        if (workingId !== null && api.localPreset(workingId) === null) setWorkingId(null)
      }, [workingId, api.draft])

      const working = workingId === null ? null : api.localPreset(workingId)
      const base = baseId === null ? null : (api.localPreset(baseId) ?? (api.state?.presets ?? []).find((preset) => preset.id === baseId) ?? null)
      const persona = working === null ? null : findPersonaRow(working.plugins)
      const locked = working?.locked === true
      const canEditId = working !== null && !locked && api.canRenamePreset(working.id)
      const idPending = canEditId && idText.trim() !== '' && idText.trim() !== working.id

      React.useEffect(() => {
        if (working === null) return
        setIdText(working.id)
        setIdError(null)
      }, [working?.id])

      React.useEffect(() => {
        if (base !== null || api.presetChoices.length === 0) return
        const next = api.draft.find((preset) => preset.locked !== true)?.id ?? api.presetChoices[0].id
        setBaseId(next)
        setWorkingId(api.localPreset(next) !== null ? next : null)
      }, [base, api.presetChoices, api.draft])

      React.useEffect(() => {
        writeMemory({ simple: { workingId, baseId } })
      }, [workingId, baseId])

      const pick = (id) => {
        setNotice(null)
        setBaseId(id)
        setWorkingId(api.localPreset(id) !== null ? id : null)
      }
      const copyAndEdit = async () => {
        if (base === null) return
        setCopying(true)
        setNotice(null)
        try {
          const id = await api.simpleCopy(base)
          if (id !== null) {
            setWorkingId(id)
            setBaseId(id)
          } else {
            setNotice(t('simpleCopyFailed'))
          }
        } finally {
          setCopying(false)
        }
      }
      const applyId = (raw) => {
        if (working === null || !canEditId) return true
        const next = String(raw ?? '').trim()
        if (next === '') return true
        if (!/^[a-z0-9][a-z0-9-]*$/.test(next)) {
          setIdError(t('simpleIdInvalid'))
          return false
        }
        if (next === working.id) {
          setIdError(null)
          return true
        }
        const error = api.renamePreset(working.id, next)
        if (error) {
          setIdError(error)
          return false
        }
        setIdError(null)
        setIdText(next)
        setWorkingId(next)
        setBaseId(next)
        return true
      }
      const changeId = (value) => {
        if (!canEditId) return
        setIdText(value)
        setIdError(null)
        if (value !== '' && /^[a-z0-9][a-z0-9-]*$/.test(value)) applyId(value)
      }
      const blurId = () => {
        if (!canEditId) return
        const text = idText.trim()
        if (text === '') {
          setIdError(null)
          return
        }
        if (!/^[a-z0-9][a-z0-9-]*$/.test(text)) {
          setIdError(t('simpleIdInvalid'))
          return
        }
        if (text !== working.id) applyId(text)
      }
      const saveSimple = async () => {
        await api.save()
        if (idText.trim() === '' && working !== null) setIdText(working.id)
      }
      const options = api.presetChoices
      const nameCounts = new Map()
      for (const choice of options) {
        const name = String(choice.name || choice.id)
        nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1)
      }
      const optionGroups = [
        { label: t('official'), items: options.filter((choice) => choice.kind === 'official') },
        { label: t('custom'), items: options.filter((choice) => choice.kind !== 'official') },
      ]
      const baseSelect = h('select', {
        style: { ...styles.input, fontSize: 12.5, padding: '6px 8px' },
        value: workingId ?? baseId ?? '',
        'aria-label': t('simplePickBase'),
        onChange: (event) => pick(event.target.value),
      }, optionGroups.map((group) => group.items.length === 0 ? null : h('optgroup', { key: group.label, label: group.label },
        group.items.map((choice) => h('option', { key: choice.id, value: choice.id }, presetChoiceLabel(choice, nameCounts))))))

      return h('div', { className: 'ps-simple' },
        h('div', null,
          h('h2', { className: 'ps-simple-title' }, t('simpleTitle')),
          h('p', { className: 'ps-simple-intro' }, t('simpleIntro'))),
        h('div', { style: styles.card },
          h('div', { style: styles.sectionTitle }, t('simplePickBase')),
          baseSelect,
          working === null && base !== null && api.localPreset(base.id) === null
            ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 } },
                h('span', { style: { ...styles.muted, fontSize: 11.5 } }, t('simpleReadonly')),
                h('button', { type: 'button', style: styles.buttonPrimary, disabled: copying, onClick: () => void copyAndEdit() }, copying ? t('loading') : t('simpleCopyEdit')))
            : null,
          working === null && base !== null && api.localPreset(base.id) !== null && base.locked === true
            ? h('div', { style: { ...styles.muted, fontSize: 11.5, marginTop: 4 } }, t('simpleLocked'))
            : null,
          working !== null
            ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11, opacity: 0.62 } },
                h('span', { style: { ...styles.dot, background: 'var(--ps-ok)' } }),
                h('span', null, t('simpleEditing') + ' · ' + (working.name || working.id)))
            : null),
        working === null
          ? (base === null ? h('div', { style: styles.empty }, t('simpleEmpty')) : null)
          : h(React.Fragment, null,
              h('div', { style: { ...styles.card, gap: 10 } },
                h('div', { className: 'ps-simple-block' },
                  h('label', { htmlFor: 'ps-simple-name', className: 'ps-simple-label' }, t('simpleName')),
                  h('input', {
                    id: 'ps-simple-name',
                    style: { ...styles.input, fontSize: 14, fontWeight: 600, padding: '7px 9px' },
                    value: String(working.name ?? ''),
                    disabled: locked,
                    onChange: (event) => api.updatePreset(working.id, { name: event.target.value }),
                  })),
                h('div', { className: 'ps-simple-block' },
                  h('label', { htmlFor: 'ps-simple-id', className: 'ps-simple-label' }, t('simpleId')),
                  h('input', {
                    id: 'ps-simple-id',
                    style: { ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: 12.5, padding: '6px 9px' },
                    value: idText,
                    placeholder: t('simpleIdPlaceholder'),
                    disabled: !canEditId,
                    spellCheck: false,
                    autoCapitalize: 'off',
                    onChange: (event) => changeId(event.target.value),
                    onBlur: blurId,
                    onKeyDown: (event) => { if (event.key === 'Enter') event.currentTarget.blur() },
                  }),
                  h('div', { className: 'ps-simple-hint' },
                    idText.trim() === '' && working !== null
                      ? t('simpleIdBlankUses', { id: working.id })
                      : t('simpleIdHint')),
                  idError !== null ? h('div', { className: 'ps-simple-error' }, idError) : null),
                h('div', { className: 'ps-simple-block' },
                  h('label', { htmlFor: 'ps-simple-description', className: 'ps-simple-label' }, t('simpleDescription')),
                  h('input', {
                    id: 'ps-simple-description',
                    style: { ...styles.input, fontSize: 12.5, padding: '6px 9px' },
                    value: String(working.description ?? ''),
                    placeholder: t('simpleDescriptionPlaceholder'),
                    disabled: locked,
                    onChange: (event) => api.updatePreset(working.id, { description: event.target.value }),
                  }))),
              h('div', { style: styles.card },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                  h('label', { htmlFor: 'ps-simple-persona', style: styles.sectionTitle }, t('simplePersona')),
                  h(Help, { api, title: t('simplePersona'), text: t('simplePersonaHint') })),
                persona === null
                  ? h('div', { style: styles.muted }, t('simpleNoPersona'))
                  : h('textarea', {
                      id: 'ps-simple-persona',
                      className: 'ps-simple-persona',
                      style: { ...styles.textarea, resize: 'vertical' },
                      value: String(persona.config?.prefix ?? ''),
                      placeholder: t('simplePersonaPlaceholder'),
                      disabled: locked,
                      onChange: (event) => api.setPersona(working.id, event.target.value),
                    }),
                h('div', { style: { ...styles.muted, fontSize: 11 } }, t('simplePersonaHint'))),
              locked ? h('div', { style: styles.badgeWarn }, t('simpleLocked')) : null,
              h('div', { style: styles.saveBar },
                h('span', { style: { ...styles.dot, background: api.dirty ? 'var(--ps-warn)' : 'var(--ps-ok)' } }),
                h('span', { style: api.dirty ? styles.badgeWarn : styles.badge }, api.dirty ? t('unsaved') : t('saved')),
                h('span', { style: { flex: '1 1 auto' } }),
                h('button', { type: 'button', style: styles.button, disabled: !api.dirty || api.saving, onClick: () => api.discard() }, t('discard')),
                h('button', { type: 'button', style: styles.buttonPrimary, disabled: !api.dirty || api.saving || idPending || idError !== null, onClick: () => void saveSimple() }, api.saving ? t('saving') : t('save'))),
              api.notice !== null ? h('div', { style: styles.errorBox }, api.notice) : null,
              notice !== null ? h('div', { style: styles.errorBox }, notice) : null,
              h('div', { className: 'ps-simple-foot' },
                h('span', null, t('simpleDraftNote')),
                h('span', null, t('simpleSavedElsewhere')),
                h('span', { style: { flex: '1 1 auto' } }),
                h('button', { type: 'button', style: styles.button, onClick: () => api.setPage('standard') }, t('simpleMore')))))
    }

    function compareStateLabel(t, state) {
      if (state === 'enabled') return t('compareEnabled')
      if (state === 'disabled') return t('compareDisabled')
      return t('compareConditional')
    }

    function compareStateColor(state) {
      if (state === 'enabled') return 'var(--ps-ok)'
      if (state === 'conditional') return 'var(--ps-warn)'
      return 'color-mix(in srgb, currentColor 32%, transparent)'
    }

    function compareStatusMeta(t, status) {
      if (status === 'only-left') return { glyph: '−', color: 'var(--ps-danger)', label: t('compareLegendLeft') }
      if (status === 'only-right') return { glyph: '+', color: 'var(--ps-ok)', label: t('compareLegendRight') }
      if (status === 'state') return { glyph: '~', color: 'var(--ps-warn)', label: t('compareLegendState') }
      if (status === 'config') return { glyph: 'Δ', color: '#4f7cff', label: t('compareLegendConfig') }
      if (status === 'path') return { glyph: '↔', color: 'currentColor', label: t('compareLegendPath') }
      return { glyph: '=', color: 'var(--ps-ok)', label: t('compareLegendSame') }
    }

    function compareCellClass(status, side) {
      if (status === 'only-left') return side === 'left' ? 'del' : 'ghost'
      if (status === 'only-right') return side === 'right' ? 'add' : 'ghost'
      if (status === 'state') return 'mod'
      if (status === 'config') return 'modconfig'
      if (status === 'path') return 'modpath'
      return ''
    }

    function formatConfigValue(value, t) {
      if (value === undefined) return t('compareGhost')
      if (value === null) return 'null'
      if (typeof value === 'string') return value.length > 240 ? value.slice(0, 240) + '…' : value
      if (typeof value === 'object') {
        const text = JSON.stringify(value)
        return text.length > 240 ? text.slice(0, 240) + '…' : text
      }
      return String(value)
    }

    function configPreviewOf(config, t) {
      if (config === null || typeof config !== 'object') return ''
      const parts = []
      for (const field of configFields(config)) {
        if (field.value !== null && typeof field.value === 'object') continue
        const text = formatConfigValue(field.value, t)
        parts.push((field.path || 'config') + ': ' + (text.length > 56 ? text.slice(0, 56) + '…' : text))
        if (parts.length >= 2) break
      }
      const joined = parts.join(' · ')
      return joined.length > 120 ? joined.slice(0, 120) + '…' : joined
    }

    function presetStatsOf(rows) {
      const leaves = flattenPresetRows(rows)
      return { rows: leaves.length, enabled: leaves.filter((leaf) => leaf.state === 'enabled').length }
    }

    function CompareCell({ t, item, side }) {
      const entry = side === 'left' ? item.left : item.right
      const className = 'ps-cmp-cell ' + compareCellClass(item.status, side)
      if (entry.present !== true) {
        return h('div', { className },
          h('div', { className: 'ps-cmp-ghost' }, t('compareGhost')))
      }
      const preview = configPreviewOf(entry.config, t)
      return h('div', { className },
        h('div', { className: 'ps-cmp-main' },
          h('span', { className: 'ps-cmp-state', style: { opacity: entry.state === 'disabled' ? 0.66 : 1 } },
            h('span', { className: 'ps-cmp-dot', style: { background: compareStateColor(entry.state) } }),
            compareStateLabel(t, entry.state)),
          h('div', { className: 'ps-cmp-identity' },
            h('code', { className: 'ps-cmp-id' }, item.id || item.key),
            h('div', { className: 'ps-cmp-modline' },
              h('div', { className: 'ps-cmp-mod', title: item.name }, item.name),
              preview.length > 0 ? h('span', { className: 'ps-cmp-preview', title: preview }, preview) : null)),
          h('div', { className: 'ps-cmp-chips' },
            entry.path.length > 0 ? h('span', { className: 'ps-cmp-chip', title: entry.path.join(' › ') }, entry.path.join(' › ')) : null,
            entry.declared !== entry.state
              ? h('span', { className: 'ps-cmp-chip', title: t('compareInheritedHint', { declared: compareStateLabel(t, entry.declared), state: compareStateLabel(t, entry.state) }) }, t('compareInheritedChip', { state: compareStateLabel(t, entry.state) }))
              : null)))
    }

    function FieldDiffPanel({ t, fields }) {
      return h('div', { className: 'ps-cmp-fields' },
        h('div', { className: 'ps-cmp-fieldhead' },
          h('span', null, t('compareField')),
          h('span', null, 'A'),
          h('span', null, 'B')),
        fields.map((field) => h('div', { key: field.path, className: 'ps-cmp-field' },
          h('code', { className: 'ps-cmp-fieldpath' }, field.path || t('compareValueEmpty')),
          h('code', { className: 'ps-cmp-fieldval' + (field.kind === 'added' ? '' : ' del') }, formatConfigValue(field.left, t)),
          h('code', { className: 'ps-cmp-fieldval' + (field.kind === 'removed' ? '' : ' add') }, formatConfigValue(field.right, t)))))
    }

    function CompareRow({ t, item, expanded, onToggle }) {
      const meta = compareStatusMeta(t, item.status)
      const fields = item.configDiff && item.left.present && item.right.present
        ? configFieldDiff(item.left.config, item.right.config)
        : []
      const paths = fields.slice(0, 4).map((field) => field.path || t('compareValueEmpty')).join(' · ') + (fields.length > 4 ? ' …' : '')
      return h('div', { className: 'ps-cmp-row' },
        h(CompareCell, { t, item, side: 'left' }),
        h('div', { className: 'ps-cmp-gutter', style: { color: meta.color }, title: meta.label }, meta.glyph),
        h(CompareCell, { t, item, side: 'right' }),
        fields.length > 0
          ? h('button', {
              type: 'button',
              className: 'ps-cmp-diffbar',
              'aria-expanded': expanded,
              onClick: onToggle,
            },
              h('span', { className: 'ps-cmp-diffbar-tag' }, 'Δ ' + t('compareFieldsCount', { count: fields.length })),
              h('span', { className: 'ps-cmp-diffbar-paths' }, paths),
              h('span', { className: 'ps-cmp-diffbar-action' }, expanded ? t('compareCollapse') + ' ▴' : t('compareExpand') + ' ▾'))
          : null,
        expanded && fields.length > 0 ? h(FieldDiffPanel, { t, fields }) : null)
    }

    function ComparePage({ api }) {
      const t = api.t
      const choices = api.presetChoices
      const preferredRight = (left) => {
        for (const id of ['ptc', 'standard', 'cordis', 'minimal']) {
          if (id !== left && choices.some((choice) => choice.id === id)) return id
        }
        return choices.find((choice) => choice.id !== left)?.id ?? left
      }
      const initialLeft = api.selectedId ?? choices[0]?.id ?? null
      const remembered = React.useMemo(() => readMemory(), [])
      const rememberedCompare = memoryObject(remembered.compare)
      const rememberedLeft = memoryText(rememberedCompare.leftId)
      const rememberedRight = memoryText(rememberedCompare.rightId)
      // A remembered pair survives only while the workbench still selects the
      // same preset; selecting another preset means this comparison is new.
      const keepPair = rememberedLeft !== null && rememberedCompare.selectedId === api.selectedId
      const [leftId, setLeftId] = React.useState(() => keepPair ? rememberedLeft : initialLeft)
      const [rightId, setRightId] = React.useState(() => rememberedRight !== null ? rememberedRight : preferredRight(initialLeft))
      const [onlyDiff, setOnlyDiff] = React.useState(() => rememberedCompare.onlyDiff === true)
      const [expanded, setExpanded] = React.useState({})
      const [reload, setReload] = React.useState(0)
      const [remoteLeft, setRemoteLeft] = React.useState({ status: 'idle' })
      const [remoteRight, setRemoteRight] = React.useState({ status: 'idle' })

      React.useEffect(() => {
        writeMemory({ compare: { leftId, rightId, onlyDiff, selectedId: api.selectedId } })
      }, [leftId, rightId, onlyDiff])

      React.useEffect(() => {
        const ids = new Set(choices.map((choice) => choice.id))
        if (leftId !== null && !ids.has(leftId)) setLeftId(choices[0]?.id ?? null)
        if (rightId !== null && !ids.has(rightId)) setRightId(preferredRight(leftId))
      }, [choices, leftId, rightId])

      React.useEffect(() => { setExpanded({}) }, [leftId, rightId])

      React.useEffect(() => {
        if (leftId === null || api.localPreset(leftId) !== null) {
          setRemoteLeft({ status: 'idle' })
          return undefined
        }
        let alive = true
        setRemoteLeft({ status: 'loading' })
        api.loadPresetRows(leftId)
          .then((source) => { if (alive) setRemoteLeft({ status: 'ready', name: source.name, rows: source.rows }) })
          .catch((error) => { if (alive) setRemoteLeft({ status: 'error', error: String(error?.message ?? error) }) })
        return () => { alive = false }
      }, [leftId, api.dataVersion, reload])

      React.useEffect(() => {
        if (rightId === null || api.localPreset(rightId) !== null) {
          setRemoteRight({ status: 'idle' })
          return undefined
        }
        let alive = true
        setRemoteRight({ status: 'loading' })
        api.loadPresetRows(rightId)
          .then((source) => { if (alive) setRemoteRight({ status: 'ready', name: source.name, rows: source.rows }) })
          .catch((error) => { if (alive) setRemoteRight({ status: 'error', error: String(error?.message ?? error) }) })
        return () => { alive = false }
      }, [rightId, api.dataVersion, reload])

      const sourceOf = (id, remote) => {
        if (id === null) return { status: 'idle' }
        const local = api.localPreset(id)
        if (local !== null) {
          return { status: 'ready', rows: local.plugins, name: local.name || id, draft: api.presetDirty(local) }
        }
        return remote
      }
      const left = sourceOf(leftId, remoteLeft)
      const right = sourceOf(rightId, remoteRight)
      const compare = left.status === 'ready' && right.status === 'ready' ? diffPresetRows(left.rows, right.rows) : null
      const totalDiff = compare === null ? 0
        : compare.summary.onlyLeft + compare.summary.onlyRight + compare.summary.stateDiff + compare.summary.configDiff + compare.summary.pathDiff
      const items = compare === null ? [] : (onlyDiff ? compare.items.filter((item) => item.status !== 'same') : compare.items)
      const leftStats = left.status === 'ready' ? presetStatsOf(left.rows) : null
      const rightStats = right.status === 'ready' ? presetStatsOf(right.rows) : null
      const optionGroups = [
        { label: t('official'), items: choices.filter((choice) => choice.kind === 'official') },
        { label: t('custom'), items: choices.filter((choice) => choice.kind !== 'official') },
      ]
      const nameCounts = new Map()
      for (const choice of choices) {
        const name = String(choice.name || choice.id)
        nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1)
      }
      const picker = (value, setValue, label) => h('select', {
        className: 'ps-cmp-select',
        style: styles.input,
        value: value ?? '',
        'aria-label': label,
        onChange: (event) => setValue(event.target.value),
      }, optionGroups.map((group) => group.items.length === 0 ? null : h('optgroup', { key: group.label, label: group.label },
        group.items.map((choice) => h('option', { key: choice.id, value: choice.id }, presetChoiceLabel(choice, nameCounts))))))
      const headerCell = (side, id, source, stats, setter) => h('div', { className: 'ps-cmp-headcell' },
        h('span', { className: 'ps-cmp-kicker' }, side === 'left' ? t('comparePickA') : t('comparePickB')),
        picker(id, setter, side === 'left' ? t('comparePickA') : t('comparePickB')),
        h('div', { className: 'ps-cmp-meta' },
          source.status === 'ready' && stats !== null
            ? h('span', null, t('compareRowsShort', { rows: stats.rows, enabled: stats.enabled }))
            : source.status === 'error' ? h('span', null, t('error')) : h('span', null, t('compareLoading')),
          source.draft ? h('span', { style: styles.badgeWarn }, t('compareDraft')) : null))
      const swap = () => {
        setLeftId(rightId)
        setRightId(leftId)
      }
      const legend = [
        [t('compareLegendSame'), 'transparent'],
        [t('compareLegendLeft'), 'color-mix(in srgb, var(--ps-danger) 35%, transparent)'],
        [t('compareLegendRight'), 'color-mix(in srgb, var(--ps-ok) 35%, transparent)'],
        [t('compareLegendState'), 'color-mix(in srgb, var(--ps-warn) 35%, transparent)'],
        [t('compareLegendConfig'), 'color-mix(in srgb, #4f7cff 35%, transparent)'],
        [t('compareLegendPath'), 'color-mix(in srgb, currentColor 18%, transparent)'],
      ]
      const problems = left.status === 'error' || right.status === 'error'
        ? h('div', { style: styles.errorBox },
            t('compareLoadFailed') + ': ' + (left.status === 'error' ? left.error : right.error),
            h('button', { type: 'button', style: { ...styles.button, marginLeft: 8 }, onClick: () => { api.clearCompareCache?.(); setReload(reload + 1) } }, t('retry')))
        : null
      return h('div', { className: 'ps-cmp' },
        h('div', { className: 'ps-cmp-head' },
          headerCell('left', leftId, left, leftStats, setLeftId),
          h('div', { className: 'ps-cmp-headcell', style: { padding: 0, alignItems: 'center', justifyContent: 'center' } },
            h('button', { type: 'button', style: { ...styles.buttonGhost, fontSize: 14, alignSelf: 'center' }, title: t('compareSwap'), 'aria-label': t('compareSwap'), onClick: swap }, '⇄')),
          headerCell('right', rightId, right, rightStats, setRightId)),
        h('div', { className: 'ps-cmp-toolbar' },
          h('div', { className: 'ps-cmp-legend' }, legend.map(([label, color]) => h('span', { key: label, className: 'ps-legend-item' },
            h('span', { className: 'ps-legend-swatch', style: { background: color } }), label))),
          h(Help, { api, title: t('compareFieldDiff'), text: t('compareFieldDiffHint') }),
          h('span', { style: { flex: '1 1 auto' } }),
          compare !== null ? h('span', { style: { ...styles.muted, fontSize: 11 } }, t('compareDiffCount', { count: totalDiff })) : null,
          h('label', { style: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, opacity: 0.8 } },
            h('input', { type: 'checkbox', checked: onlyDiff, onChange: (event) => setOnlyDiff(event.target.checked) }),
            t('compareOnlyDiff')),
          h('button', { type: 'button', style: styles.buttonGhost, onClick: () => { api.clearCompareCache?.(); setReload(reload + 1) } }, t('refresh'))),
        leftId === rightId ? h('div', { style: { ...styles.muted, fontSize: 11 } }, t('compareSelf')) : null,
        problems,
        left.status === 'loading' || right.status === 'loading' || left.status === 'idle' || right.status === 'idle'
          ? h('div', { style: styles.empty }, t('compareLoading'))
          : compare === null
            ? null
            : compare.items.length === 0
              ? h('div', { style: styles.empty }, t('compareEmpty'))
              : items.length === 0
                ? h('div', { style: styles.empty }, t('compareNoDiff'))
                : h('div', { className: 'ps-cmp-body' },
                    items.map((item) => h(CompareRow, {
                      key: item.key,
                      t,
                      item,
                      expanded: expanded[item.key] === true,
                      onToggle: () => setExpanded({ ...expanded, [item.key]: expanded[item.key] !== true }),
                    }))))
    }

    function StudioPage({ t, resolveText }) {
      const remembered = React.useMemo(() => readMemory(), [])
      const warm = warmState
      const [state, setState] = React.useState(() => warm === null ? null : warm.body)
      const [draft, setDraft] = React.useState(() => warm === null ? [] : clone(warm.managed))
      const [saved, setSaved] = React.useState(() => warm === null ? [] : clone(warm.managed))
      const [baseRevision, setBaseRevision] = React.useState(() => warm === null ? '' : warm.revision)
      const [selectedId, setSelectedId] = React.useState(() => {
        const rememberedId = memoryText(remembered.selectedId)
        if (rememberedId !== null) return rememberedId
        const presets = warm === null ? [] : (warm.body.presets ?? [])
        return presets.find((preset) => preset.kind !== 'official')?.id ?? presets[0]?.id ?? null
      })
      const [view, setView] = React.useState(() => memoryOneOf(remembered.view, MEMORY_VIEWS, 'structure'))
      const [tab, setTab] = React.useState(() => memoryOneOf(remembered.tab, MEMORY_TABS, 'compose'))
      const [menuOpen, setMenuOpen] = React.useState(false)
      const [saving, setSaving] = React.useState(false)
      const [notice, setNotice] = React.useState(null)
      const [status, setStatus] = React.useState(() => warm === null ? { phase: 'loading', message: '' } : { phase: 'ready', message: '' })
      const [collapsed, setCollapsed] = React.useState(() => memoryFlags(remembered.collapsedGroups))
      const [configEditorId, setConfigEditorId] = React.useState(null)
      const [isolateEditorId, setIsolateEditorId] = React.useState(null)
      const [selectedGroupId, setSelectedGroupId] = React.useState(() => memoryText(remembered.targetGroupId))
      const [addRowOpen, setAddRowOpen] = React.useState(false)
      const [page, setPage] = React.useState(() => memoryOneOf(remembered.page, MEMORY_PAGES, 'standard'))
      const [dataVersion, setDataVersion] = React.useState(0)
      const compareCache = React.useRef(new Map())

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
          warmState = { body, managed: clone(managed), revision: body.revision ?? '' }
          compareCache.current.clear()
          setDataVersion((value) => value + 1)
          setSelectedId((current) => (body.presets ?? []).some((preset) => preset.id === current)
            ? current
            : ((body.presets ?? []).find((preset) => preset.kind !== 'official')?.id ?? (body.presets ?? [])[0]?.id ?? null))
          setStatus({ phase: 'ready', message: '' })
        } catch (cause) {
          setStatus({ phase: 'error', message: String(cause && cause.message ? cause.message : cause) })
        }
      }, [])

      React.useEffect(() => { void load() }, [load])

      React.useEffect(() => {
        writeMemory({
          page, selectedId, view, tab,
          collapsedGroups: collapsed,
          targetGroupId: selectedGroupId,
        })
      }, [page, selectedId, view, tab, collapsed, selectedGroupId])

      const selected = React.useMemo(() => {
        const own = draft.find((preset) => preset.id === selectedId)
        if (own !== undefined) {
          const meta = (state?.presets ?? []).find((preset) => preset.id === own.id)
          return { ...own, kind: 'managed', locked: own.locked === true || meta?.locked === true, broken: meta?.broken }
        }
        const meta = (state?.presets ?? []).find((preset) => preset.id === selectedId)
        return meta ?? null
      }, [draft, state, selectedId])

      // A remembered target group may belong to another preset or to a group the
      // user removed meanwhile; drop it rather than aim new rows at a dead id.
      React.useEffect(() => {
        if (selectedGroupId === null || selected === null || !Array.isArray(selected.plugins)) return
        const found = locate(selected.plugins, selectedGroupId)
        if (found === undefined || !isGroup(found.row)) setSelectedGroupId(null)
      }, [selected, selectedGroupId])

      const officialPresets = React.useMemo(() => (state?.presets ?? []).filter((preset) => preset.kind === 'official'), [state])
      const foreignPresets = React.useMemo(() => (state?.presets ?? []).filter((preset) => preset.kind === 'foreign'), [state])

      const updatePreset = (id, patch) => setDraft((prev) => prev.map((preset) => preset.id === id ? { ...preset, ...patch } : preset))

      const savedById = React.useMemo(() => new Map(saved.map((preset) => [preset.id, preset])), [saved])
      const presetDirty = (preset) => {
        if (!draft.some((entry) => entry.id === preset.id)) return false
        const base = savedById.get(preset.id)
        return base === undefined || JSON.stringify(base) !== JSON.stringify(preset)
      }
      const presetChoices = React.useMemo(() => {
        const choices = []
        const seen = new Set()
        for (const preset of state?.presets ?? []) {
          seen.add(preset.id)
          choices.push({ id: preset.id, name: preset.name ?? '', kind: preset.kind })
        }
        for (const preset of draft) {
          if (!seen.has(preset.id)) choices.push({ id: preset.id, name: preset.name ?? '', kind: 'managed' })
        }
        return choices
      }, [state, draft])
      const localPreset = (id) => draft.find((preset) => preset.id === id) ?? null
      const loadPresetRows = (id) => {
        const key = String(id)
        if (compareCache.current.has(key)) return compareCache.current.get(key)
        const pending = requestJson('/preset-source?id=' + encodeURIComponent(id)).then((body) => ({
          name: typeof body.name === 'string' ? body.name : id,
          rows: Array.isArray(body.plugins) ? body.plugins : [],
        }))
        compareCache.current.set(key, pending)
        pending.catch(() => { compareCache.current.delete(key) })
        return pending
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

      const simpleCopy = async (base) => {
        try {
          let plugins = Array.isArray(base.plugins) ? clone(base.plugins) : null
          if (plugins === null) {
            const body = await requestJson('/preset-source?id=' + encodeURIComponent(base.id))
            plugins = Array.isArray(body.plugins) ? clone(body.plugins) : []
          }
          const used = new Set([...draft.map((preset) => preset.id), ...(state?.presets ?? []).map((preset) => preset.id)])
          const id = uniqueName(slugify(base.id + '-simple'), used)
          const preset = {
            id,
            name: (base.name || base.id) + t('simpleSuffix'),
            description: base.description ?? '',
            order: nextOrder(),
            plugins,
            locked: false,
          }
          setDraft((prev) => [...prev, preset])
          setSelectedId(id)
          setNotice(null)
          return id
        } catch (cause) {
          setNotice(String(cause && cause.message ? cause.message : cause))
          return null
        }
      }

      const setPersona = (presetId, text) => mutatePlugins(presetId, (plugins) => {
        const row = findPersonaRow(plugins)
        if (row === undefined) return
        const config = row.config !== null && typeof row.config === 'object' && !Array.isArray(row.config) ? { ...row.config } : {}
        config.prefix = text
        row.config = config
      })

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
        officialPresets, foreignPresets, page, presetChoices, dataVersion,
        setMenuOpen, setView, setTab, setNotice, setPage, localPreset, loadPresetRows,
        clearCompareCache: () => compareCache.current.clear(),
        load, selectPreset: (id) => setSelectedId(id),
        brokenOf: (id) => (state?.presets ?? []).find((preset) => preset.id === id)?.broken,
        createBlank: () => createPreset(undefined), copyPreset, simpleCopy, setPersona,
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
          h('div', { className: 'ps-brand', style: styles.brand },
            h('span', { style: styles.logo }, h(Icon, { name: 'spark', size: 16 })),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 } },
              h('h1', { style: styles.title }, t('title')),
              h('p', { className: 'ps-subtitle', style: styles.subtitle },
                t(page === 'compare' ? 'compareSubtitle' : page === 'simple' ? 'simpleSubtitle' : 'subtitle')))),
          h('div', { className: 'ps-topnav' },
            h('div', { className: 'ps-seg' },
              [['simple', t('pageSimple')], ['standard', t('pageStandard')], ['compare', t('pageCompare')]].map(([key, label]) =>
                h('button', { key, type: 'button', 'data-active': page === key, onClick: () => setPage(key) }, label)))),
          h('div', { className: 'ps-actions' },
            state?.profile?.name ? h('span', { className: 'ps-profile', style: styles.profileChip }, h('span', { style: styles.profileDot }), 'profile: ' + state.profile.name) : null,
            state?.hmr === false ? h('span', { style: styles.badgeWarn }, 'HMR off') : null,
            h(DesignNotes, { api }),
            h('button', {
              type: 'button', style: styles.iconButton, title: t('refresh'), 'aria-label': t('refresh'),
              onClick: () => void load(),
            }, h(Icon, { name: 'refresh', size: 14 })))),
        h('div', { style: styles.body },
          page === 'standard'
            ? h(React.Fragment, null,
                h('aside', { className: 'ps-scroll', style: { ...styles.column, ...styles.left } }, h(PresetColumn, { api })),
                h('main', { className: 'ps-scroll', style: { ...styles.column, ...styles.middle } }, h(Editor, { api })),
                h('aside', { style: { ...styles.right, display: 'flex', flexDirection: 'column', minHeight: 0 } },
                  h(Drawer, { api })))
            : page === 'compare'
              ? h('main', { className: 'ps-scroll', style: { ...styles.column, flex: '1 1 auto', padding: 0 } }, h(ComparePage, { api }))
              : h('main', { className: 'ps-scroll', style: { ...styles.column, flex: '1 1 auto', padding: 0 } }, h(SimplePage, { api }))))
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
