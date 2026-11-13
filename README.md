# dsh-preset-builder (Preset Workshop)

A DSH profile plugin that adds a left-sidebar workspace for building custom Agent presets — without writing YAML by hand.

## Why

DSH's Web UI can show a preset's configuration (read-only YAML) and make one the default for new tasks, but it cannot create or edit a preset. Today the only way to add one is a Creator-mode session where an Agent writes the YAML, or hand-editing the profile patch layer. Meanwhile the official four presets (Minimal, Standard, PTC, Creator) must stay untouched.

## What it does

- A three-page capsule nav in the top bar: **Simple**, **Standard**, **Compare**. Standard is the three-column workbench; Simple edits only the name and persona prompt; Compare puts any two presets side by side.
- Simple page: pick any preset as the base, then change its name, ID, description and persona prompt and save; an official or foreign base is copied to a custom preset first. The ID is editable until the first save and falls back to an auto-generated one when left blank. Rows, groups, packages and YAML stay hidden to keep the first edit small.
- Left-sidebar entry **预设工坊 / Preset Workshop** with a three-column workspace: preset list, composition area, package drawer.
- Two categories only: the four official presets are permanently read-only; every other preset is a **custom** preset with the same management surface.
- Create a preset from blank, from an official preset, or from another custom preset; edit name, description and order; **rename the preset id before its first save** (lowercase letters, digits, hyphens; duplicates rejected).
- Presets with pending changes show a "unsaved" badge; untouched presets stay quiet.
- Presets declared by other bundles can be **adopted** and then edited like your own; any custom preset can be **locked** to opt out of management.
- Deleting a custom preset takes effect immediately; adopted/foreign declarations leave a disabled tombstone so a bundle update cannot resurrect them.
- Collect packages and their rows into the preset, with automatic package groups for multi-row packages.
- The package drawer only offers **statically disabled** rows (`disabled: true`, i.e. preset-only rows); rows active in the Host or decided by a condition stay uncollectable so a later condition flip cannot register the plugin twice. **A package whose rows are all active is not shown at all** (official and third-party alike; see Design notes); official rows active in the Host remain folded under "Host-managed". Rows already declared in the current preset are filtered out too.
- An inactive bundle gets its own "Community · bundle off" or "Official · bundle off" group and can be collected early; rows are tagged "on/off in bundle", and the editor plus the group header warn that enabling the bundle later may clash with the Host. Enabling the bundle first and checking row state is the recommended path.
- The editor checks preset rows against currently active Host rows by **Loader row id**; a shared id shows a red box listing the exact row ids and modules and the row gets a "Host conflict" badge. The same module under different row ids (Standard's `skill-filesystem` vs the Host's `skill-filesystem-global`) is a scoped use and is not flagged; off-bundle rows stay yellow.
- Compare page: pick any two presets (official, custom, or an unsaved draft) and put them side by side, aligned by **Loader row id**, with every row shown by default. A Git-style gutter marks only-left, only-right, state, field-level config and group-path changes; identical rows stay uncoloured with a green match mark. Each side previews its config values under the module name, and a full-width field-difference bar expands into leaf fields (object keys, array indexes) showing both values. Custom presets are read from the live draft, so a comparison works before saving.
- Package cards show the official Chinese title and description from each package's `locale/zh.json`; non-official packages sort first and official ones last.
- Explanations appear on demand: section headers, order, preset id and save validation use `?` popovers (hover to peek, click to pin); the top-bar "Design notes" explains the Host/preset split and why a third-party package may be absent.
- Only Tool, Skill and Persona keywords are highlighted (including their Chinese labels), so row/package purpose is quick to spot; no full-page colouring.
- Tighter three-column spacing and card padding, wrapping package titles, and a single blue accent for primary actions.
- Titles and descriptions follow the interface language (the in-app language setting or the system language); third-party packages with `locale/*.json` work the same way.
- Preset-only packages (persona, tool presentation, …) are discovered automatically and collectable with the config from their preset declaration; the search box stays fixed while only the cards scroll.
- Inactive bundles are visible too: a direct profile dependency that declares `dsh.bundle.patch` but is absent from `dsh.profile.bundles` gets an off-bundle group and can be collected early; the UI warns about a Host clash if the bundle is enabled later and recommends enabling it first.
- Long string config such as `section`, `prefix`, and `prompt` uses a multiline editor; YAML output uses `|` block scalars.
- "Add row" inserts a module by hand (with a `persona` template), covering preset-only packages; both collection and manual rows land in the selected group.
- The YAML tab previews unsaved drafts (marked as a draft preview) instead of failing for new presets.
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

## Install

Repository: <https://github.com/cningan/dsh-preset-builder>; npm package: `dsh-preset-builder`.

Install this repository's `bundle/` as a bundle through DSH's `plugin_manager` (`install_bundle`), or install the npm package by name `dsh-preset-builder`. For local development point a `link:` dependency at `bundle/`. Host-side changes need a DSH restart; UI-only changes need a page refresh.

> Migrating from the old name: since 0.2.7 the package is `dsh-preset-builder` (the old `dsh-preset-studio` name on npm belongs to a different plugin). A profile that linked the old name must remove it, install `dsh-preset-builder`, and restart; presets in the managed block are unaffected.

## Status

v0.6.0 installable. Verified in an **isolated DSH instance** (separate `DSH_HOME` and a temporary profile) through the UI: the centred three-page capsule nav and per-page subtitles, the Simple page (copy an official preset, edit name, ID, description and persona, clear the ID to see the auto placeholder, save, reload and confirm persistence), the Standard three-column layout, blank-preset creation, id rename, package collection, save, lock/unlock, immediate deletion, automatic preset-only package discovery (persona), and the YAML draft preview. The Compare page verified side-by-side alignment between official Standard and PTC with all rows shown (29 vs 30), the Git-style diff colours and legend, inline config previews, a full-width field-difference bar with expandable `prefix` values, an unsaved-draft comparison (draft badge plus a field-level difference), "differences only", and the A/B swap, at a 1366px viewport with no horizontal overflow. A manually inserted foreign declaration in that profile also verified adoption → edit → delete-with-tombstone. Pre-save mount validation, acceptance of the official Standard composition, rejection of host-service conflicts, and 20 unit checks all pass.

## Verification

- `node test/unit.mjs`: managed-block round trip, empty-root insertion, idempotence, platform expression parsing, `!!js` tags, the adoption/tombstone/lock model, multiline block scalars, preset-only package merging, and the comparison contract (group-state inheritance, row-id alignment, state/config/path classification, field-level config flattening, duplicate ids, key-order-independent configs).
- `ci.yml`: install, ESLint + syntax checks, 20 unit checks, and `npm pack --dry-run` on push/PR.
- `pwsh test/ui-smoke.ps1`: isolated UI smoke (temporary `DSH_HOME` + profile) asserting the 1366px layout, compare previews/diffbar, and the Simple-page ID empty-state/validation/save path. Add `-Screenshots` for the visual review.
- HTTP smoke: `/state`, `/preset-source`, `/save`, `/presets/delete` and `/presets/lock`; deletion removes the preset from the registry immediately, and a locked preset ignores save payloads.

## Release

Day-to-day releases run in GitHub Actions; do not publish by hand:

- `ci.yml`: install, ESLint + syntax checks, 20 unit checks, and `npm pack --dry-run` on push/PR.
- `publish.yml`: a `v*` tag publishes through GitHub OIDC (Trusted Publishing) and opens a GitHub Release with the tgz; the tag must equal `bundle/package.json`'s version or the run fails first.
- Release flow: change code → `npm version patch|minor|major` inside `bundle/` → `git push --follow-tags`.
- Only the very first publish of a new package is allowed to run `npm publish` manually.
- **After a repository rename**, npm's trusted-publisher relationship still points at the old owner/repo. Run `npm trust list dsh-preset-builder` and re-point it (or publish a `vX.Y.Z-rc.1` first); a pushed tag that failed must not be reused. Keep `bundle/package.json`'s `repository.url` on the current repository.

## Development

Requires the DSH desktop app with a profile. Prepare the bundle directory, then install it with `plugin_manager` `install_bundle` against this package directory (`bundle/`).

Commands run inside `bundle/`: `npm install`, `npm run check` (ESLint + syntax), `npm test` (20 unit checks). The UI smoke runs from the repository root: `pwsh test/ui-smoke.ps1` (needs `dsh`, `pnpm`, `ego-browser`, and a full-access shell). See [SPEC.md](SPEC.md) for the contract, [GLOSSARY.md](GLOSSARY.md) for the domain vocabulary, and [test/ui-smoke.md](test/ui-smoke.md) for the isolated UI smoke procedure.
