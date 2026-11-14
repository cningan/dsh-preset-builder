# 隔离 UI 冒烟检查

CI 只跑纯函数和 HTTP 契约；界面行为用隔离实例验证，避免污染桌面 profile。结构/布局问题优先跑脚本，密度和美观仍要人看截图。

## 自动冒烟（推荐）

前置条件：

- Windows，PATH 里有 `dsh`、`pnpm`、`ego-browser`。
- `ego-browser` 需要 **full access / danger-full-access** 终端；默认文件沙箱下它无法连接 bootstrap。
- 脚本会在仓库下建 `.tmp-ui-smoke`、选空闲端口、建临时 profile，正常结束后清理。

```powershell
pwsh test/ui-smoke.ps1                 # 结构断言
pwsh test/ui-smoke.ps1 -Screenshots    # 另存 compare.png / simple.png
pwsh test/ui-smoke.ps1 -Keep           # 保留日志与截图，便于失败排查
```

脚本当前断言：

- 1366×839 视口下，侧栏展开与折叠时 `document.documentElement.scrollWidth === innerWidth`（无横向溢出）。
- 对比页标准 vs 修改过 persona 的草稿：至少 20 行、配置摘要 > 0、配置 diffbar > 0；展开后字段值出现；折叠侧栏后表格宽度 ≥ 1100。
- 简易页复制 → 清空 ID：输入框保持为空、placeholder 含「留空自动生成」、提示含「当前将使用」、保存按钮可用。
- 非法 ID 显示错误并禁用保存；保存成功后真实 ID 回填且输入框只读。
- 界面记忆：切到另一个侧栏面板后工作台确实卸载；回来后仍在对比页，A/B 与「只看差异」保持，标准页的选中预设也不变。
- 滚动位置：对比页滚到 900 后切面板再回来仍在 900；包抽屉在切页后回到原处；渲染过程中的自动归零不会把记录清成 0。
- 序号：新建空白预设得到「现有最大号 + 1」（官方占 1–4 时是 `#5`）。
- 复制官方 Creator：菜单里点 `cordis` 生成的副本在编辑器里是具体 skills 路径；点「保存」出现「已保存」、没有「保存失败」。
- 整页刷新后仍落在同一页、同一预设与同一对比组合；断言里用一个旧文档标记消失来确认页面真的重载了。
- 捕获窗口 `error` / `unhandledrejection`（刷新后再捕获一次）。

`ego-browser` 不继承任意环境变量，所以 wrapper 把 URL 通过 `globalThis.__UI_SMOKE_CONFIG__` 注入脚本，而不是依赖 `$env:UI_SMOKE_URL`。手工直跑时：

```powershell
$config = @{ url = 'http://127.0.0.1:<port>/?token=...' } | ConvertTo-Json -Compress
$source = "globalThis.__UI_SMOKE_CONFIG__ = $config`n" + (Get-Content test/ui-smoke.mjs -Raw)
$source | ego-browser nodejs
```

## 视觉评审（脚本兜不住）

用 `-Screenshots` 后在 `.tmp-ui-smoke/screenshots/` 查看 `compare.png` 和 `simple.png`，逐项看：

- 对比页是否真正用满可用宽度，而不是把内容挤在中间一条；行高、字号、留白是否适合连续看 30 行。
- 简易页的空 ID 是否以浅色 placeholder 呈现，hint 是否给出实际将使用的 ID；保存后是否显示真实 ID。
- 顶栏三页胶囊是否居中，副标题是否在放不下时省略，右侧操作是否被挤出。
- 1366×839 下侧栏展开/折叠两种状态都看一遍；窗口最小化时截图会失败，先恢复窗口。

## 手动回归（脚本之外）

1. 新建空白预设，添加行：
   - 模块 `@deepseek-ai/dsh-skill-filesystem`，行 id `skill-filesystem` → **不出现**红色 Host 冲突。
   - 行 id 改为当前 Host 已启用行的 id（如 `preset-standard`）→ 出现红色框，列出 row id 和模块名，行有红边和「Host 冲突」。
   - 行 `disabled: true` 后红色消失。
2. 从官方 `standard` 复制一份；`skill-filesystem` 行不应标红。
3. 在临时 profile 的依赖里加一个未启用 bundle（声明了 `dsh.bundle.patch`），刷新后：
   - 抽屉出现「未开 Bundle」组；
   - 收录其中默认启用的行 → 编辑器出现黄色框、黄边行和「未开 Bundle」；
   - 保存不阻断，但刷新后再次显示黄色提示。
4. 深浅色主题：红/黄警告的正文、徽标仍可读；宿主 token 缺失时回退色仍可读。
5. 对比页勾选「只看差异」只剩差异行；交换 A/B 后左右互换且草稿标识跟随；`?` 气泡不被抽屉裁切。
6. 详情页锁定/解锁、放弃改动、删除预设后选择框回到可用状态。

脚本已覆盖导航、对比页和简易页的结构部分；改动 UI 布局或简易页字段时，优先跑脚本，再按上面的视觉清单抽查。

## 排查

- `ElementResolutionError` / 元素被遮挡：弹窗先关，侧栏先展开；定位用 `aria-label`、`.ps-topnav button:nth-child(n)`、`role`，不要用 `text=中文`（「简易」会同时匹配预设名）。
- `Cannot capture a screenshot while the window is minimized`：恢复 ego 窗口，或先不带 `-Screenshots` 跑断言。
- `ego-browser` 报无法连接 bootstrap：换 full access 终端；这是沙箱边界，不是脚本问题。
- 本机没装 `ego-browser` 时脚本无法启动；可临时用 Edge `--headless=new --remote-debugging-port` + CDP 手工执行同一组断言（2026-11 的界面记忆验证即如此），但不要为此替换仓库里的脚本。
- 失败时加 `-Keep`，看 `.tmp-ui-smoke/dsh.out.log`、`dsh.err.log`；确认端口进程已清理。

不要用桌面 profile 做破坏性检查；不要删除 `~/.dsh/profiles` 下的已有配置。
