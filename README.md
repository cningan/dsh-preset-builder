# dsh-preset-studio (Preset Workshop)

A DSH profile plugin that adds a left-sidebar workspace for building custom Agent presets — without writing YAML by hand.

## Why

DSH's Web UI can show a preset's configuration (read-only YAML) and make one the default for new tasks, but it cannot create or edit a preset. Today the only way to add one is a Creator-mode session where an Agent writes the YAML, or hand-editing the profile patch layer. Meanwhile the official four presets (Minimal, Standard, PTC, Creator) must stay untouched.

## What it does

- Left-sidebar entry **预设工坊 / Preset Workshop** with a three-column workspace: preset list, composition area, package drawer.
- Two categories only: the four official presets are permanently read-only; every other preset is a **custom** preset with the same management surface.
- Create a preset from blank, from an official preset, or from another custom preset; edit name, description and order.
- Presets declared by other bundles can be **adopted** and then edited like your own; any custom preset can be **locked** to opt out of management.
- Deleting a custom preset takes effect immediately; adopted/foreign declarations leave a disabled tombstone so a bundle update cannot resurrect them.
- Collect packages and their rows into the preset, with automatic package groups for multi-row packages.
- Three row actions: enable, disable (keep the declaration), remove (delete the row).
- Structure view (root / groups / rows) and package view (rows grouped by their package), switchable.
- Platform-conditional rows (`disabled: !!js process.platform === ...`) are read-only and show a platform badge.
- Row `config` editing with common-field forms plus a JSON escape hatch.
- Read-only YAML view with one-click copy.
- `sidebarEntry` plugin setting hides the sidebar entry.

Declarations are written into the profile's user patch layer as a marked managed block (`insert` creations, per-loader-row overrides for adopted presets, `disabled` tombstones, and a `# locks:` list), so the created presets are ordinary `@deepseek-ai/dsh-agent-preset` rows: same registry, same picker, no special handling anywhere else. Saves are hot-applied through HMR; when HMR is unavailable the UI says a restart is required.

## Boundaries

- The four official presets are permanently read-only and can be copied.
- Foreign custom presets must be adopted before editing; presets registered at runtime without a Loader declaration row cannot be adopted.
- Locked presets are never saved, deleted or adopted; they render read-only.
- No "set as default", no "start a session with this preset" (use the official settings page).
- No bundle export/import; the YAML view is the sharing path.
- No Agent tool and no cross-profile sharing.
- The plugin never edits anything around the managed block, and it only rewrites another preset's declaration after an explicit adoption (a tombstone makes that reversible).

Specification: [SPEC.md](SPEC.md). Chinese README: [README.zh.md](README.zh.md).

## Status

v0.2 installable. Verified: Host endpoints, managed-block write/hot-apply/delete, official preset source parsing, pre-save mount validation (rejects host-service conflicts, accepts the official Standard composition), immediate deletion, locking and lock-preserved saves, and pure-function unit checks. The sidebar entry, three-column layout, and the create/collect/save path were confirmed in the desktop window. Adoption needs a foreign declaration and is pending a live check (the current profile has none).

## Verification

- `node test/unit.mjs`: managed-block round trip, empty-root insertion, idempotence, platform expression parsing, `!!js` tags, and the adoption/tombstone/lock model.
- HTTP smoke: `/state`, `/preset-source`, `/save`, `/presets/delete` and `/presets/lock`; deletion removes the preset from the registry immediately, and a locked preset ignores save payloads.

## Development

Requires the DSH desktop app with a profile. Prepare the bundle directory, then install it with `plugin_manager` `install_bundle` against this package directory (`bundle/`). See [SPEC.md](SPEC.md) for the contract and [GLOSSARY.md](GLOSSARY.md) for the domain vocabulary.
