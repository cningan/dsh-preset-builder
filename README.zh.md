# 预设工坊（dsh-preset-builder）

一个 DSH profile 插件：在左侧栏提供一个工作台，用 GUI 构建自定义 Agent 预设，不必手写 YAML。

## 为什么要有它

DSH 的 Web 界面能查看预设配置（只读 YAML）、能把某个预设设为新任务默认，但不能创建或编辑预设。目前新增预设的唯一路径是开一个 Creator 会话让 Agent 写 YAML，或者手改 profile 的用户补丁层。与此同时，官方四个预设（Minimal、Standard、PTC、Creator）必须保持只读。

## 它做什么

- 左侧栏入口「预设工坊」，三栏工作台：预设列表、组合区、包抽屉。
- 预设分两类：官方四个永久只读；其余全部是「自定义」，同一套管理入口。
- 从空白、官方预设或其它自定义预设新建；可改名称、描述、排序；**保存前可改预设代号**（小写字母、数字、连字符，校验重名）。
- 有改动的预设显示「未保存」，未改动的保持安静。
- 其它插件包声明的预设可以「接管」，接管后与自建预设一样编辑；也可「锁定」退出管理。
- 删除即时生效：托管声明直接移除，接管/外部声明留下禁用墓碑，避免升级后复活。
- 把包及其行收录进预设；多行包自动建同名包组，单行包直接呈现为一行。
- 包抽屉只提供**静态禁用**的行（`disabled: true`，即预设专用行）；Host 已启用或由条件决定的行不提供收录入口，避免条件翻转后重复挂载。**整包都已启用的第三方包不显示在抽屉里**（原因见「设计说明」）；官方包在 Host 已启用的行仍折叠在「Host 管理」区。当前预设已声明的行也会被过滤掉。
- 说明按需出现：分区、排序、代号、保存校验用 `?` 气泡（悬停看、点击固定），顶部「设计说明」解释 Host/预设分层、为什么第三方包可能不出现。
- 关键词只高亮 Tool、Skill、Persona（含「工具/技能/人设」），帮助快速判断行/包的用途；不再满屏上色。
- 三栏布局与卡片内边距收紧，包标题可换行；主色只保留一个蓝色强调。
- 包卡片显示官方中文名称与简介（取自包内 `locale/zh.json`），非官方包置顶、官方包后置。
- 标题与简介跟随界面语言（设置里的语言或系统语言）；第三方包带 `locale/*.json` 时同样生效。
- 自动发现仅预设使用的包（如 persona、工具调用方式），直接从包里收录并带上声明中的配置；右侧搜索框固定，只有包卡片滚动。
- 已安装但未启用的第三方 bundle 不参与收录：它可能在之后被启用为 Host 使用，预设再声明同一行会重复挂载；界面上也不读取它的补丁来合成行。
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

仓库：<https://github.com/cningan/dsh-preset-studio>；npm 包名：`dsh-preset-builder`。

把本仓库的 `bundle/` 用 DSH 的 `plugin_manager` 安装为 bundle（`install_bundle`），或从 npm 按包名 `dsh-preset-builder` 安装。本机开发用 `link:` 指向 `bundle/`。Host 侧改动需要重启 DSH，纯界面改动刷新页面即可。

> 从旧包名迁移：0.2.7 起包名从 `dsh-preset-studio` 改为 `dsh-preset-builder`（旧名在 npm 上属于另一个插件）。以旧名 link 安装的 profile 需要先移除旧包，再按 `dsh-preset-builder` 安装并重启；托管块里的预设置不受影响。

## 状态

v0.2.12 可安装。已在**独立 DSH 实例**（独立 `DSH_HOME` 与临时 profile）中通过界面验证：侧栏入口、三栏渲染、新建空白预设、改代号、收录包、保存、锁定/解锁、即时删除、仅预设包自动发现（persona）、YAML 草稿预览；另在隔离 profile 手工放了一条外部声明，验证「接管 → 编辑 → 删除留下墓碑」。保存前预挂载校验、官方 Standard 组合接受、宿主服务冲突拒绝均通过；纯函数单测 13 项通过。

## 验证

- `node test/unit.mjs`：托管块往返、空根替换、幂等、平台表达式解析、`!!js` 标签、接管/墓碑/锁定模型、多行块标量、仅预设包归并。
- HTTP 冒烟：`/state`、`/preset-source`、`/save`、`/presets/delete`、`/presets/lock` 均通过；删除后 registry 立即消失，锁定期间保存载荷被忽略。

## 发布

日常发布由 GitHub Actions 完成，不手工 `npm publish`：

- `ci.yml`：push/PR 安装依赖、语法检查、13 项单测、`npm pack --dry-run`。
- `publish.yml`：推 `v*` tag 触发，经 GitHub OIDC（Trusted Publishing）发布到 npm，并自动创建带 tgz 的 GitHub Release；tag 必须等于 `bundle/package.json` 的 version，否则先失败。
- 发布动作：改代码 → 在 `bundle/` 下 `npm version patch|minor|major` → `git push --follow-tags`。
- 只有首次建包允许人工 `npm publish`。

## 开发

需要带 profile 的 DSH 桌面端。准备好 bundle 目录后，用 `plugin_manager` 的 `install_bundle` 指向本仓库的 `bundle/` 安装。契约见 [SPEC.md](SPEC.md)，领域词汇见 [GLOSSARY.md](GLOSSARY.md)。
