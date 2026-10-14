# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Meteor 3.5.2 app (Blaze + LESS, plain JS) that works as the automation control panel for the Memorial PAF exhibition. A tablet/browser UI shows one button per installation ("O Pedro", "Linha do Tempo", "Multiplique-se") plus a Portuguese/English language selector at the bottom; pressing an installation button makes the server send OSC messages over the LAN to the machine that plays that installation. Physical buttons wired to Arduinos trigger the same playback. UI text, logs and identifiers are in Portuguese.

## Commands

```sh
meteor npm install        # install npm deps (use meteor's bundled node/npm)
npm start                 # meteor run, http://localhost:3000
npm test                  # one-shot mocha run (meteortesting:mocha), server + client
npm run test-app          # full-app tests in watch mode
npm run visualize         # production build with bundle-visualizer
npm run android           # run on a connected Android device
npm run ios               # run on a connected iOS device
```

- Single test: `MOCHA_GREP="<pattern>" npm test`. All tests live in `tests/main.js` (the `testModule` in `package.json`).
- `android`/`ios` scripts hardcode `--mobile-server=http://192.168.1.34:3000`; change the IP to the dev machine's LAN address before using them. Only `android` is in `.meteor/platforms`.
- The existing tests are only sanity checks (package name, `Meteor.isClient`/`isServer`); nothing exercises `sendCmd` or the OSC output. `meteortesting:mocha` is not listed in `.meteor/packages`; it is pulled in by the `--driver-package` flag.
- There is no lint or build script. `jsconfig.json` enables `checkJs` for editor type-checking only.

## Architecture

Entry points are explicit (`meteor.mainModule` in `package.json`): `client/main.js` and `server/main.js`. No JS is eagerly loaded, so files under `imports/` only run if imported from one of those.

**Live control path** — this is what the UI actually uses:

1. `client/main.html` has one button per installation in the `blocks` template (DOM `id` = `pedro`, `linha`, `multi`) and, at the bottom of the page, the `idiomas` template with the two language buttons (`id` = `Pt`, `En`).
2. `client/main.js` keeps the selected language in a `ReactiveVar` (default `Pt`; it is client-side only, so it resets on reload and is per device). A language button only changes that selection; an installation button calls `Meteor.call('sendCmd', id, idioma)`, e.g. `sendCmd('pedro', 'En')`.
3. The `sendCmd(nome, idioma)` method in `server/main.js` looks both arguments up in the `instalacoes` table (target IP/port plus the OSC message list per language) and sends the messages with `osc-emitter`. An unknown installation or language throws `Meteor.Error('comando-invalido')`.

Adding an installation or language means adding a button with the matching id and an entry in `instalacoes`.

Each installation has its own `OscEmitter`, created once at startup with a single receiver, so a message only reaches its own target. Do not share one emitter between targets: `osc-emitter`'s `add()` appends receivers and never removes them.

**Arduino path** — `imports/server/arduino.js` opens three Firmata boards (`/dev/ttyACM0` = Linha, `ttyACM1` = Multi, `ttyACM2` = Pedro; the mapping depends on USB enumeration order on the venue machine), reads pin 2 with pull-up, and emits the same OSC messages as the Portuguese entries of `sendCmd`. The `digitalRead` callback ignores `value` and has no debounce, so it fires on every pin change (press and release, plus the initial report); the `pinNTime`/`pinNLock` variables are declared but unused. The whole block is skipped when `os.platform() === 'darwin'`, so it never runs on a Mac dev machine and only executes on the Linux box at the venue. `SerialPortCompat` is a shim adapting `serialport` v13's options-object constructor to the `(path, options, callback)` signature `firmata-io` expects.

OSC targets are duplicated between the `instalacoes` table and `arduino.js`; keep them in sync when an address or message changes:

| Installation   | Target             | Messages                                                         |
| -------------- | ------------------ | ---------------------------------------------------------------- |
| O Pedro        | 192.168.2.100:7400 | `/audio 1`, `/lin 1` (PT) or `/lin 0` (EN), `/play 1`             |
| Linha do Tempo | 192.168.2.37:3737  | `/reset 1`, then `/portugues 1` or `/ingles 1`                    |
| Multiplique-se | 192.168.2.5:7000   | `/composition/columns/2/connect` (PT) or `.../3/connect` (EN)     |

## Things to know

- `autopublish` and `insecure` are enabled, and the `jabbslad:basic-auth` protection in `server/main.js` is commented out. The app assumes an isolated exhibition LAN.
- There is no dev/dry-run mode: `sendCmd` always sends to the real installation IPs, so calling it on the exhibition LAN triggers playback.
- The app stores nothing in Mongo. The old config-driven code (`Configs`/`Logs`/`State` collections, `defaultconfig.js`, the `play`/`loop`/`stop`/`getState`/`setState` methods) was removed; the `mongo`, `autopublish` and `insecure` packages are still listed in `.meteor/packages` but unused.
- `client/main.less` is loaded eagerly by Meteor (only JS is governed by `mainModule`) and lays the UI out in a fixed 1004×598 box for the venue tablet. `imports/client/styles/horizontal.less` and `vertical.less` are not imported anywhere.
- `AGENTS.md` carries the same guidance for other coding agents; update both files together.
- The word "PAF" in the header gets a liquid-metal effect from `metal-fx`, a React-only library. `client/paf-metal.js` mounts a small React root (no JSX) on the `.paf-metal` span from `Template.header.onRendered`; this is the only React in the app, everything else is Blaze. It needs WebGL2 and leaves the plain text when unsupported. After adding npm packages, restart `meteor run`: the running server failed to resolve `react` until restarted.
- `client/border-beam.js` (`montarBorderBeam(el, props)`) and `client/thinking-orb.js` (`montarThinkingOrb(el, props)`) are ready-made mount helpers for the React libraries `border-beam` and `thinking-orbs`, following the same pattern as `paf-metal.js`. Nothing imports them yet, so they are not in the bundle; both return `{ atualizar(props), desmontar() }`. The beam is drawn on an overlay inside `el`, which must be positioned.
- The app is installable as a PWA through `public/manifest.json` and the icons in `public/icons` (generated from `logo-white.png` on the `#110011` background), linked from the `<head>` in `client/main.html`. There is deliberately no service worker, so nothing is cached offline.
