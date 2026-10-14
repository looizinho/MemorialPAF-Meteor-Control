# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Project overview

Meteor 3.5 app (Blaze + LESS, plain JS) that is the automation control panel for the **Memorial PAF** exhibition. A tablet/browser UI shows one button per installation ("O Pedro", "Linha do Tempo", "Multiplique-se") plus a Portuguese/English language selector at the bottom; pressing an installation button makes the server send OSC messages over the LAN to the machine that plays that installation. Physical buttons wired to Arduinos trigger the same playback. UI text, logs and identifiers are in Portuguese.

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
- There is no lint or build script. `jsconfig.json` enables `checkJs` for editor type-checking only.

## Architecture

Entry points are explicit (`meteor.mainModule` in `package.json`): `client/main.js` and `server/main.js`. Nothing is eagerly loaded, so files under `imports/` only run if imported from one of those.

**Live control path** — this is what the UI actually uses:

1. `client/main.html` has one button per installation in the `blocks` template (DOM `id` = `pedro`, `linha`, `multi`) and, at the bottom of the page, the `idiomas` template with the two language buttons (`id` = `Pt`, `En`).
2. `client/main.js` keeps the selected language in a `ReactiveVar` (default `Pt`; it is client-side only, so it resets on reload and is per device). A language button only changes that selection; an installation button calls `Meteor.call('sendCmd', id, idioma)`, e.g. `sendCmd('pedro', 'En')`.
   Pressing an installation button turns it "ligado" (class `ligado`, `aria-pressed="true"`, its border-beam lit, its border dimmed, and its `.rotulo` label enlarged 25% and rendered with `montarMetalText`) for `TEMPO_LIGADO[nome]` ms (10 s for all today) and ignores further presses until it is released. Only one installation button can be lit at a time: while one is, the other two get `disabled` (dimmed) through the `bloqueio` helper. The `progresso` template draws a green SVG border around the whole interface that fills linearly over `TEMPO_LIGADO[nome]` while a button is lit (stroke-dashoffset on a `pathLength="100"` rect); the `.content` padding (28px sides, 18px bottom) makes room for it; if `sendCmd` returns an error the button is released at once. This state lives only on that device: other tablets and the Arduino buttons do not see it, and the server does not block repeated commands.
3. The `sendCmd(nome, idioma)` method in `server/main.js` looks both arguments up in the `instalacoes` table (target IP/port plus the OSC message list per language) and sends the messages with `osc-emitter`. An unknown installation or language throws `Meteor.Error('comando-invalido')`.

Adding an installation or language means adding a button with the matching id and an entry in `instalacoes`.

**Arduino path** — `imports/server/arduino.js` opens three Firmata boards on `/dev/ttyACM0..2` (one per installation), reads pin 2 with pull-up, and emits the same OSC messages as the Portuguese entries of `sendCmd`. The whole block is skipped when `os.platform() === 'darwin'`, so it never runs on a Mac dev machine and only executes on the Linux box at the venue. `SerialPortCompat` is a shim adapting `serialport` v13's options-object constructor to the `(path, options, callback)` signature `firmata-io` expects.

OSC targets are duplicated between the `instalacoes` table and `arduino.js`; keep them in sync when an address or message changes:

| Installation   | Target             | Messages                                                     |
| -------------- | ------------------ | ------------------------------------------------------------ |
| O Pedro        | 192.168.2.100:7400 | `/audio 1`, `/lin 1` (PT) or `/lin 0` (EN), `/play 1`         |
| Linha do Tempo | 192.168.2.37:3737  | `/reset 1`, then `/portugues 1` or `/ingles 1`                |
| Multiplique-se | 192.168.2.5:7000   | `/composition/columns/2/connect` (PT) or `.../3/connect` (EN) |

## Code organization

```
client/main.js, client/main.html, client/main.less   # Blaze UI entry
imports/client/styles/                                # horizontal.less, vertical.less (orientation variants)
server/main.js                                        # instalacoes table, sendCmd method, OSC emitters
imports/server/arduino.js                             # Firmata button path (server-only)
tests/main.js                                         # the only test file (testModule)
```

## Testing instructions

`npm test` runs `meteor test --once --driver-package meteortesting:mocha`. The existing tests in `tests/main.js` are minimal sanity checks (package name, `Meteor.isClient`/`isServer` flags). There is no CI, no coverage, and no lint step.

## Security considerations

- `autopublish` and `insecure` are enabled, and the `jabbslad:basic-auth` protection in `server/main.js` is commented out. The app assumes an isolated exhibition LAN — do not deploy it to the open internet without re-enabling auth and removing `insecure`/`autopublish`.
- There is no dev/dry-run mode: `sendCmd` always sends to the real installation IPs, so calling it on the exhibition LAN triggers playback.

## Things to know

- The app stores nothing in Mongo. The old config-driven code (`Configs`/`Logs`/`State` collections, `defaultconfig.js`, the `play`/`loop`/`stop`/`getState`/`setState` methods) was removed; the `mongo`, `autopublish` and `insecure` packages are still listed in `.meteor/packages` but unused.
- The word "PAF" in the header gets a liquid-metal effect from `metal-fx`, a React-only library. `client/metal-text.js` (`montarMetalText(el)`, returns `{ desmontar() }`) mounts a small React root (no JSX) on a text-only element; it is used on the `.paf-metal` span from `Template.header.onRendered` and on the label of a lit installation button. React is used only through these helper modules; everything else is Blaze. It needs WebGL2 and leaves the plain text when unsupported. After adding npm packages, restart `meteor run`: the running server failed to resolve `react` until restarted.
- `client/border-beam.js` (`montarBorderBeam(el, props)`) and `client/thinking-orb.js` (`montarThinkingOrb(el, props)`) are ready-made mount helpers for the React libraries `border-beam` and `thinking-orbs`, following the same pattern as `metal-text.js`. `montarBorderBeam` is used on the installation buttons (`Template.blocks.onRendered`); `montarThinkingOrb` is not imported anywhere yet. Both return `{ atualizar(props), desmontar() }`. The beam is drawn on an overlay inside `el`, which must be positioned.
- `client/main.less` is loaded eagerly by Meteor (only JS is governed by `mainModule`) and fills the whole viewport (no max width). In landscape the installation buttons are centred squares sized from the free area (`.blocks` is a size container; width `min(100cqh, (100cqw - 2 gaps) / 3)`, written as one escaped LESS string because LESS otherwise evaluates `min()` itself and drops the `cqw` term); they become full-width stacked bars when the screen is narrower than 720px or in portrait. Font sizes, button radius, gaps and the language row height scale with `vmin`, anchored to the venue tablet (vmin = 8px) with min/max clamps. `imports/client/styles/horizontal.less` and `vertical.less` are not imported anywhere.
- The official venue tablet is a TCL Tab A1 Plus 12.2" (2400×1600, 3:2; about 1200×800 CSS px in landscape at 2× scale). `public/mockup.html` (served at `/mockup.html`) shows the panel inside that tablet's frame, with landscape/portrait and 2×/1.5× scale toggles. It loads the app with `?simulacao`, which makes the client skip `sendCmd` so the buttons can be pressed without triggering the installations.
- The app is installable as a PWA through `public/manifest.json` and the icons in `public/icons` (PNGs generated from `logo-white.png` on the `#110011` background; iOS needs PNG). The header logo uses `public/icons/logo-vector-red.svg`, and browsers get `public/favicon.svg` (the same path on the dark rounded background, since the logo is white), linked from the `<head>` in `client/main.html`. The iOS icon lives at the site root (`public/apple-touch-icon.png`, plus a `-precomposed` copy) because iOS also probes those fixed paths, and Meteor would otherwise answer them with the app HTML; the `<link rel="apple-touch-icon">` itself embeds that PNG as a base64 `data:` URI, because on iOS 27 the Add to Home Screen sheet does not fetch the icon by URL and falls back to a letter tile. After changing the PNG, run `npm run icone-ios` (`scripts/gerar-icone-ios.js`) to regenerate the embedded link; iOS keeps the icon captured when the shortcut was added, so re-add it. There is deliberately no service worker, so nothing is cached offline.
