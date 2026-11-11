# 隔离 UI 冒烟检查

CI 只跑纯函数和 HTTP 契约；界面行为用手动隔离实例验证，避免污染桌面 profile。以下流程在 Windows + 本机 DSH 安装下使用。

## 准备隔离 profile

```powershell
$dshHome = Join-Path $env:TEMP 'dsh-preset-builder-smoke'
Remove-Item -Recurse -Force $dshHome -ErrorAction SilentlyContinue

$env:DSH_HOME = $dshHome
dsh --profile verify --from-default-profile web --dump-config | Out-Null

$profileDir = Join-Path $dshHome 'profiles\verify'
@'
{
  "name": "dsh-profile-verify",
  "private": true,
  "dependencies": {
    "dsh-preset-builder": "link:D:/Work/Plugin-DSH/dsh-preset-builder/bundle"
  },
  "dsh": {
    "profile": {
      "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-preset-builder"]
    }
  }
}
'@ | Set-Content (Join-Path $profileDir 'package.json') -Encoding utf8

Push-Location $profileDir
pnpm install --ignore-scripts
Pop-Location

dsh --profile verify --host 127.0.0.1 --port 57390 --no-open
```

打开打印出的 URL（带 token），进入「预设工坊」。

## 必查断言

1. 新建空白预设，添加行：
   - 模块 `@deepseek-ai/dsh-skill-filesystem`，行 id `skill-filesystem` → **不出现**红色 Host 冲突。
   - 行 id 改为当前 Host 已启用行的 id（如 `preset-standard`）→ 出现红色框，列出 row id 和模块名，行有红边和「Host 冲突」。
   - 行 `disabled: true` 后红色消失。
2. 从官方 `standard` 复制一份；`skill-filesystem` 行不应标红。
3. 在临时 profile 的依赖里加一个未启用 bundle（声明了 `dsh.bundle.patch`），刷新后：
   - 抽屉出现「未开 Bundle」组；
   - 收录其中默认启用的行 → 编辑器出现黄色框、黄边行和「未开 Bundle」；
   - 保存不阻断，但刷新后再次显示黄色提示。
4. 窄窗口/小屏：警告框、列表、按钮换行不溢出；`?` 气泡不被抽屉裁切。
5. 深浅色：红/黄警告的正文、徽标仍可读；宿主 token 缺失时回退色仍可读。
6. 顶栏三页胶囊导航「简易 / 标准 / 对比」居中，副标题随页变化且放不下时省略；左侧预设项的排序数字 `#n` 右对齐。
7. 简易页：选 official standard →「复制并编辑」生成副本；改名称与人设 → 保存 → `/preset-source?id=<副本>` 的 persona `prefix` 与输入一致，刷新后仍在；放弃副本后选择框回到可用状态。
8. 对比页选 A=standard、B=ptc：左右并排、默认全部行；相同行不铺底色、标记列为绿色 `=`；`tool-schedule` 为仅右侧绿色并在末尾；状态差异为琥珀色。
9. 简易页复制 Standard 并改 persona 后进对比页：A 侧标「含未保存草稿」，配置行显示蓝色 `Δ` 与「1 项配置不同」，展开后按 `prefix` 显示 A/B 值；勾选「只看差异」只剩差异行；交换 A/B 后左右互换。

## 清理

```powershell
Get-NetTCPConnection -LocalPort 57390 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Remove-Item -Recurse -Force $dshHome -ErrorAction SilentlyContinue
Remove-Item Env:DSH_HOME
```

不要用桌面 profile 做破坏性检查；不要删除 `~/.dsh/profiles` 下的已有配置。
