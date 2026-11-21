# ADR 0005：托管块标记改为 dsh-preset-builder，旧标记只读兼容

- 状态：已接受
- 日期：2026-11-22

## 背景

托管块首尾注释标记自 0.2.x 起使用 `dsh-preset-studio`。包名在 0.2.7 已改为 `dsh-preset-builder`，当时为了兼容已有 profile 保留旧标记（见 CHANGELOG 0.5.1）。用户可见的「备注」与当前插件名不一致，容易被误认为另一个插件。

## 决策

标记改为 `dsh-preset-builder`。旧标记保留读取路径：

- `locateBlock()` 同时匹配新旧 BEGIN/END，返回 `legacy` 表示当前仍是旧标记。
- `replaceBlock()` 总是写新标记，因此下一次保存完成迁移；块内容与顺序不变。
- `findOrphanBlock()` / `insertBeginMarker()` 识别旧 END，修复时同时写入新 BEGIN 和新 END。

## 理由

- 标记是用户可见注释，改名是纯展示收益，但旧 profile 必须无损迁移。
- 保存路径本来就是整块重写，迁移不需要额外一步。
- 只读兼容旧标记的成本是两个常量与一个配对函数，远低于「先扫描全盘 profile 批量迁移」的运维成本。

## 代价

- 0.6.x 页面（client bundle 尚未刷新）与新 Host 同时存在时，页面文案可能仍显示旧标记；不影响读写。
- 行 id 前缀 `preset-studio-<id>` 保持不变。它决定已有预设声明的 Loader 行 id，改名等于让所有已保存预设换行 id，产生重复声明或「外部声明」，没有展示收益。

## 备选

- 同时改行 id 前缀：破坏已有 profile，拒绝。
- 不改标记：用户明确要求，且旧包名已废弃多年。
