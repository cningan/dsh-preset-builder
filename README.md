# dsh-preset-studio (Preset Workshop)

A DSH profile plugin that adds a left-sidebar workspace for building custom Agent presets — without writing YAML by hand.

## Why

DSH's Web UI can show a preset's configuration (read-only YAML) and make one the default for new tasks, but it cannot create or edit a preset. Today the only way to add one is a Creator-mode session where an Agent writes the YAML, or hand-editing the profile patch layer. Meanwhile the official four presets (Minimal, Standard, PTC, Creator) must stay untouched.

## What it does

- Left-sidebar entry **预设工坊 / Preset Workshop** with a three-column workspace: preset list, composition area, package drawer.
- Create a preset from blank, from a built-in preset, or from another custom preset; edit name, description and order.
- Collect packages and their rows into the preset, with automatic package groups for multi-row packages.
- Three row actions: enable, disable (keep the declaration), remove (delete the row).
- Structure view (root / groups / rows) and package view (rows grouped by their package), switchable.
- Platform-conditional rows (`disabled: !!js process.platform === ...`) are read-only and show a platform badge.
- Row `config` editing with common-field forms plus a JSON escape hatch.
- Read-only YAML view with one-click copy.
- `sidebarEntry` plugin setting hides the sidebar entry.

Declarations are written into the profile's user patch layer as a marked `- insert:` block, so the created presets are ordinary `@deepseek-ai/dsh-agent-preset` rows: same registry, same picker, no special handling anywhere else. Saves are hot-applied through HMR; when HMR is unavailable the UI says a restart is required.

## Boundaries

- Built-in presets and presets declared by others are read-only and can be copied.
- No "set as default", no "start a session with this preset" (use the official settings page).
- No bundle export/import; the YAML view is the sharing path.
- No Agent tool and no cross-profile sharing.
- The plugin never edits anything in the managed block's surroundings and never rewrites another preset's declaration.

Specification: [SPEC.md](SPEC.md). Chinese README: [README.zh.md](README.zh.md).

## Status

v0.1 in development. See [CHANGELOG.md](CHANGELOG.md).

## Development

Requires the DSH desktop app with a profile. Prepare the bundle directory, then install it with `plugin_manager` `install_bundle` against this package directory (`bundle/`). See [SPEC.md](SPEC.md) for the contract and [GLOSSARY.md](GLOSSARY.md) for the domain vocabulary.
