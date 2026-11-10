# 预设工坊词汇表

本词汇表只定义领域术语，不含实现细节。

## 语言

**Agent 预设（Agent preset）**：新建会话时可选择的一套 Agent 能力组合，由插件行与结构组构成；它决定模型可用的工具、提示与运行方式，不是权限策略。
_Avoid_: 会话模式、权限预设、配置模板

**预设声明（preset declaration）**：组合树中的一条 `@deepseek-ai/dsh-agent-preset` 行，字段为 `id`、`name`、`description`、`order`、`plugins`。
_Avoid_: 预设文件、预设目录

**官方预设（official preset）**：随 DSH 安装包声明的四个内置预设（Minimal、Standard、PTC、Creator），没有 `name` 字段，显示名由界面文案提供；对本插件永久只读。
_Avoid_: 内置预设、系统预设

**自定义预设（custom preset）**：除官方四个以外的一切预设——无论由本插件创建、用户手写，还是其它插件包声明。默认由本插件管理，可被锁定。

**已托管预设（managed preset）**：托管块内有创建条目或覆盖条目的自定义预设；可直接编辑组合与元数据。

**外部预设（foreign preset）**：由其它补丁层声明、托管块内尚无对应条目的自定义预设；只读，可接管。

**接管（adopt）**：按外部预设原有的 loader 行 id 写一条覆盖声明，把它的组合纳入本插件的托管块。

**锁定（lock）**：把自定义预设标记为「不归本插件管理」；锁定期间不保存、不删除、不接管，界面上只读。

**删除墓碑（tombstone）**：`- id: <loader 行 id>` + `disabled: true` 的补丁条目，用于在删除接管或外部预设后压制原声明，避免其随 bundle 升级复活。
_Avoid_: 删除标记、备份

**插件行（plugin entry）**：预设组合中的一个组成项，`name` 指向提供能力的包，可携带 `config` 与 `disabled`。
_Avoid_: 插件、工具（行不一定注册模型工具）

**结构组（composition group）**：`name: cordis:group` 的行，用于组织子行；不设 `isolate` 时只是文件夹，设了才是服务隔离边界。
_Avoid_: 包组（包组是本插件自动创建的、以包命名的结构组）

**包（package）**：插件行的来源（`name` 字段指向的模块）。包不是预设结构中的节点。
_Avoid_: 模块、插件（同一包可贡献多行）

**包组（package group）**：收录一个多行包时自动创建的结构组，用于把该包的行收在一起。
_Avoid_: 插件分组

**平台变体（platform variant）**：`disabled` 为 `!!js` 表达式（如 `process.platform === 'win32'`）的行；它只在部分平台挂载。
_Avoid_: 平台插件、条件行（条件也可以是其它上下文）

**收录（collect）**：把一个包下的行加入预设的动作。
_Avoid_: 安装、启用（收录不改变包的安装与启用状态）

**禁用（disable）**：保留行声明但不挂载。
_Avoid_: 停用（口语可用，文档统一用禁用）

**移出（remove）**：把行从预设的 `plugins` 中删除。
_Avoid_: 卸载、禁用（移出与禁用不同）

**组合区（composition area）**：工作台中编辑当前预设结构树的区域。
_Avoid_: 画布、列表

**包抽屉（package drawer）**：工作台中按包浏览、收录行的侧边区域。

**用户补丁层（user patch layer）**：profile 的 `cordis.patch.yml`，位于所有 bundle 层之后，可覆盖行配置、禁用行、插入新行。

**托管块（managed block）**：用户补丁层中由本插件维护的一段带注释标记的区域，含创建声明（`insert`）、接管覆盖条目、删除墓碑与 `# locks:` 锁定名单；插件只替换这段区域。
_Avoid_: 插件配置、数据文件

**热应用（hot apply）**：写入用户补丁层后经 HMR 立即重载组合，无需重启应用。

**草稿（draft）**：尚未保存、只存在于工作台内存与浏览器本地状态中的编辑结果。

**失效引用（stale reference）**：预设引用的包未安装或行 id 已不存在的情况；不自动删除，只标记并提示。
