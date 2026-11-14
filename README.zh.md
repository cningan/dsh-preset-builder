# 预设工坊（dsh-preset-builder）

一个 DSH profile 插件：在左侧栏提供一个工作台，用 GUI 构建自定义 Agent 预设，不必手写 YAML。

## 为什么要有它

DSH 的 Web 界面能查看预设配置（只读 YAML）、能把某个预设设为新任务默认，但不能创建或编辑预设。目前新增预设的唯一路径是开一个 Creator 会话让 Agent 写 YAML，或者手改 profile 的用户补丁层。与此同时，官方四个预设（Minimal、Standard、PTC、Creator）必须保持只读。

## 它做什么

- 顶栏三页胶囊导航：「简易」「标准」「对比」。默认的「标准」就是三栏工作台；「简易」只改名称与人设提示词；「对比」左右并排两个预设。
- **界面记忆**：切到别的侧栏面板或整页刷新后回来，仍停在上次的页面、选中的预设、结构/包视图、组合/YAML 标签页、折叠的分组、收录目标组与各列的滚动位置；对比页保留 A/B 与「只看差异」，简易页保留基准与正在编辑的预设。只记位置、不缓存数据：每次打开仍从 Host 重新读取；未保存的草稿在切面板时不再丢，但整页刷新仍会丢，需要保留请先保存。
- **复制官方预设直接可用**：内置预设里依赖来源文件的 `!!js` 配置（例如 Creator 的 `customSkillDirs`）在复制时按来源文件求值成具体值，副本落到本 profile 后可以直接保存；若表达式在 profile 处求不出来，保存会说明是哪一行、哪段表达式以及如何修，而不是抛出 `expected string but got [object Object]`。
- 新预设的排序号接在现有最大号之后（官方四个占 1–4，所以首个自建预设是 5），不会和已有预设撞号。
- 左侧栏入口「预设工坊」，三栏工作台：预设列表、组合区、包抽屉。
- 简易页：选任意预设为基准，改名称、ID、描述与人设提示词并保存；官方/外部预设先复制成自定义副本。ID 在首次保存前可改，留空时输入框显示「留空自动生成」并沿用背后的自动 ID。行、组、包与 YAML 不出现，锁定预设只读。
- 预设分两类：官方四个永久只读；其余全部是「自定义」，同一套管理入口。
- 从空白、官方预设或其它自定义预设新建；可改名称、描述、排序；**保存前可改预设代号**（小写字母、数字、连字符，校验重名）。
- 有改动的预设显示「未保存」，未改动的保持安静；预设项的排序数字 `#n` 在各自容器内右对齐。
- 其它插件包声明的预设可以「接管」，接管后与自建预设一样编辑；也可「锁定」退出管理。
- 删除即时生效：托管声明直接移除，接管/外部声明留下禁用墓碑，避免升级后复活。
- 把包及其行收录进预设；多行包自动建同名包组，单行包直接呈现为一行。
- 包抽屉只提供**静态禁用**的行（`disabled: true`，即预设专用行）；Host 已启用或由条件决定的行不提供收录入口，避免条件翻转后重复挂载。**整包都已启用的包不显示在抽屉里**（官方与第三方同一判据，原因见「设计说明」）；官方包在 Host 已启用的行仍折叠在「Host 管理」区。当前预设已声明的行也会被过滤掉。
- 未启用的 bundle 单独进入「非官方 · 未开 Bundle」「官方 · 未开 Bundle」，可以提前收录；行上标「bundle 内启用 / 禁用」，编辑器和分组顶部提示启用该 bundle 后可能与 Host 冲突，建议先启用并确认行状态。
- 编辑器按 **Loader row id** 检查预设行与当前 Host 已启用行是否同 id；冲突用红色框列出具体 row id 与模块名，行上标「Host 冲突」。同一模块用不同 row id（如 Standard 的 `skill-filesystem` 与 Host 的 `skill-filesystem-global`）是 scoped 用法，不误报；未开 Bundle 用黄色框/黄边标出。
- 对比页：任选两个预设（官方、自定义、未保存草稿都行），左右并排、按 **Loader row id** 对齐，默认展示全部行。中间标记列用 Git 风格符号区分 `−` 只在左、`+` 只在右、`~` 启停、`Δ` 字段级配置、`↔` 分组、`=` 相同；仅左/仅右分别用红/绿底，启停琥珀、配置蓝，相同行不铺底色，只留绿色 `=`。每侧在模块名后显示一行配置摘要；配置差异用整行宽的 diffbar 展开为字段级 A/B 表格，「只看差异」可切换到过滤视图。自定义一侧直接读工作台草稿并标「含未保存草稿」，保存前就能比较。
- 说明按需出现：分区、排序、代号、保存校验用 `?` 气泡（悬停看、点击固定），顶部「设计说明」解释 Host/预设分层、为什么第三方包可能不出现。
- 关键词只高亮 Tool、Skill、Persona（含「工具/技能/人设」），帮助快速判断行/包的用途；不再满屏上色。
- 三栏布局与卡片内边距收紧，包标题可换行；主色只保留一个蓝色强调。
- 包卡片显示官方中文名称与简介（取自包内 `locale/zh.json`），非官方包置顶、官方包后置。
- 标题与简介跟随界面语言（设置里的语言或系统语言）；第三方包带 `locale/*.json` 时同样生效。
- 自动发现仅预设使用的包（如 persona、工具调用方式），直接从包里收录并带上声明中的配置；右侧搜索框固定，只有包卡片滚动。
- 未启用的 bundle 也能看到：profile 的直接依赖中声明了 `dsh.bundle.patch`、但没有列进 `dsh.profile.bundles` 的包，会单独分组并允许提前收录；启用后可能与 Host 冲突，界面会提示先启用 bundle 处理。
- 配置编辑对 `section`、`prefix`、`prompt` 等长字符串改用多行文本框；YAML 输出为 `|` 块标量。
- 「添加行」可手动加入模块（带 `persona` 人设模板），覆盖仅预设使用的包；收录与手动添加都支持放进当前选中的结构组。
- YAML 视图可直接预览未保存草稿，并标注「草稿预览」，新建预设不再报读取失败。
- 行三态：启用、禁用（保留声明）、移出（删除行）。
- 结构视图（根 / 组 / 行）与包视图（按包归并行）可切换。
- 平台条件行（`disabled: !!js process.platform === ...`）只读，并显示平台徽标。
- 行 `config` 用常用字段表单编辑，复杂字段用 JSON 兜底。
- 只读 YAML 视图，一键复制。
- 插件配置项 `sidebarEntry` 可隐藏侧栏入口。

预设声明写入 profile 用户补丁层中带标记的托管块（`insert` 创建、按 loader 行 id 覆盖接管、`disabled` 墓碑、`# locks:` 锁定名单），因此创建出来的预设就是普通的 `@deepseek-ai/dsh-agent-preset` 行：同一 registry、同一选择器，其它地方不需要任何特殊处理。保存经 HMR 热应用；HMR 不可用时界面会明确提示需要重启。

## 边界

- 官方四个预设永久只读，可复制。
- 外部自定义预设需要「接管」才能编辑；运行时注册、没有 loader 声明行的预设无法接管。
- 锁定的预设不会被保存、删除或接管，界面只读。
- 不做「设为默认」「用此预设开新会话」（用官方设置页）。
- 不做 bundle 导出/导入；分享走 YAML 复制。
- 不给 Agent 工具，不做跨 profile 共享。
- 插件绝不改动托管块以外的内容，也不重写别人的预设声明（接管是显式操作，且有墓碑可清理）。

规格见 [SPEC.md](SPEC.md)，英文说明见 [README.md](README.md)。

## 安装

仓库：<https://github.com/cningan/dsh-preset-builder>；npm 包名：`dsh-preset-builder`。

把本仓库的 `bundle/` 用 DSH 的 `plugin_manager` 安装为 bundle（`install_bundle`），或从 npm 按包名 `dsh-preset-builder` 安装。本机开发用 `link:` 指向 `bundle/`。Host 侧改动需要重启 DSH，纯界面改动刷新页面即可。

> 从旧包名迁移：0.2.7 起包名从 `dsh-preset-studio` 改为 `dsh-preset-builder`（旧名在 npm 上属于另一个插件）。以旧名 link 安装的 profile 需要先移除旧包，再按 `dsh-preset-builder` 安装并重启；托管块里的预设置不受影响。

## 状态

v0.6.0 可安装。已在**独立 DSH 实例**（独立 `DSH_HOME` 与临时 profile）中通过界面验证：居中的三页胶囊导航与副标题省略、简易页（复制官方预设 → 改名称/ID/描述/人设 → 清空 ID 查看自动占位 → 保存 → 刷新后仍在）、标准页三栏渲染、新建空白预设、改代号、收录包、保存、锁定/解锁、即时删除、仅预设包自动发现（persona）、YAML 草稿预览。对比页验证了官方 Standard vs PTC 的左右并排、默认全部行、Git 风格配色与图例、行内配置摘要、整行 diffbar 的 `prefix` 字段差异、未保存草稿对比、只显示差异与 A/B 交换；1366px 视口下无横向溢出。另在隔离 profile 手工放了一条外部声明，验证「接管 → 编辑 → 删除留下墓碑」。保存前预挂载校验、官方 Standard 组合接受、宿主服务冲突拒绝均通过；纯函数单测 20 项通过。

## 验证

- `node test/unit.mjs`：托管块往返、空根替换、幂等、平台表达式解析、`!!js` 标签、接管/墓碑/锁定模型、多行块标量、仅预设包归并，以及对比契约（组状态继承、按 row id 对齐、启停/配置/分组差异分类、字段级配置摊平、重复 id、配置键序无关）。
- `ci.yml`：push/PR 安装依赖、ESLint + 语法检查、20 项单测、`npm pack --dry-run`。
- `pwsh test/ui-smoke.ps1`：隔离 UI 冒烟（临时 `DSH_HOME` + profile），断言 1366px 布局、对比页配置摘要/diffbar、简易页 ID 的清空/校验/保存链路；加 `-Screenshots` 另存视觉评审截图。
- HTTP 冒烟：`/state`、`/preset-source`、`/save`、`/presets/delete`、`/presets/lock` 均通过；删除后 registry 立即消失，锁定期间保存载荷被忽略。

## 发布

日常发布由 GitHub Actions 完成，不手工 `npm publish`：

- `ci.yml`：push/PR 安装依赖、ESLint + 语法检查、20 项单测、`npm pack --dry-run`。
- `publish.yml`：推 `v*` tag 触发，经 GitHub OIDC（Trusted Publishing）发布到 npm，并自动创建带 tgz 的 GitHub Release；tag 必须等于 `bundle/package.json` 的 version，否则先失败。
- 发布动作：改代码 → 在 `bundle/` 下 `npm version patch|minor|major` → `git push --follow-tags`。
- 只有首次建包允许人工 `npm publish`。
- **仓库改名后**，npm 的 trusted publisher 仍指向旧 owner/repo；先跑 `npm trust list dsh-preset-builder` 并重配（或先发一个 `vX.Y.Z-rc.1` 验证 OIDC），失败过的 tag 不要复用。`bundle/package.json` 的 `repository.url` 保持与当前仓库一致。

## 开发

需要带 profile 的 DSH 桌面端。准备好 bundle 目录后，用 `plugin_manager` 的 `install_bundle` 指向本仓库的 `bundle/` 安装。

命令在 `bundle/` 下运行：`npm install`、`npm run check`（ESLint + 语法）、`npm test`（20 项单测）。UI 冒烟从仓库根运行：`pwsh test/ui-smoke.ps1`（需要 `dsh`、`pnpm`、`ego-browser`，以及 full-access 终端）。契约见 [SPEC.md](SPEC.md)，领域词汇见 [GLOSSARY.md](GLOSSARY.md)，隔离 UI 冒烟步骤见 [test/ui-smoke.md](test/ui-smoke.md)。
