# 预设工坊（dsh-preset-studio）

一个 DSH profile 插件：在左侧栏提供一个工作台，用 GUI 构建自定义 Agent 预设，不必手写 YAML。

## 为什么要有它

DSH 的 Web 界面能查看预设配置（只读 YAML）、能把某个预设设为新任务默认，但不能创建或编辑预设。目前新增预设的唯一路径是开一个 Creator 会话让 Agent 写 YAML，或者手改 profile 的用户补丁层。与此同时，官方四个预设（Minimal、Standard、PTC、Creator）必须保持只读。

## 它做什么

- 左侧栏入口「预设工坊」，三栏工作台：预设列表、组合区、包抽屉。
- 从空白、内置预设或其它自定义预设新建；可改名称、描述、排序。
- 把包及其行收录进预设；多行包自动建同名包组，单行包直接呈现为一行。
- 行三态：启用、禁用（保留声明）、移出（删除行）。
- 结构视图（根 / 组 / 行）与包视图（按包归并行）可切换。
- 平台条件行（`disabled: !!js process.platform === ...`）只读，并显示平台徽标。
- 行 `config` 用常用字段表单编辑，复杂字段用 JSON 兜底。
- 只读 YAML 视图，一键复制。
- 插件配置项 `sidebarEntry` 可隐藏侧栏入口。

预设声明写入 profile 用户补丁层中带标记的 `- insert:` 块，因此创建出来的预设就是普通的 `@deepseek-ai/dsh-agent-preset` 行：同一 registry、同一选择器，其它地方不需要任何特殊处理。保存经 HMR 热应用；HMR 不可用时界面会明确提示需要重启。

## 边界

- 内置预设与他人声明的预设只读，可复制。
- 不做「设为默认」「用此预设开新会话」（用官方设置页）。
- 不做 bundle 导出/导入；分享走 YAML 复制。
- 不给 Agent 工具，不做跨 profile 共享。
- 插件绝不改动托管块以外的内容，也不重写别人的预设声明。

规格见 [SPEC.md](SPEC.md)，英文说明见 [README.md](README.md)。

## 状态

v0.1 可安装。已验证：Host 端点、托管块写入/热应用/删除、官方预设源文件解析、纯函数单测。待确认：桌面端页面刷新后的侧栏入口与工作台渲染（需要已登录的 Web 会话，自动浏览器无法通过本机 Web 鉴权）。

## 验证

- `node test/unit.mjs`：托管块往返、空根替换、幂等、平台表达式解析、`!!js` 标签。
- HTTP 冒烟：`GET /plugins/preset-studio/state`、`GET /preset-source?id=standard`、`POST /save` 新建与删除，均通过；保存后 registry 列表出现/消失，托管块只改自身区域。

## 开发

需要带 profile 的 DSH 桌面端。准备好 bundle 目录后，用 `plugin_manager` 的 `install_bundle` 指向本仓库的 `bundle/` 安装。契约见 [SPEC.md](SPEC.md)，领域词汇见 [GLOSSARY.md](GLOSSARY.md)。
