# Skyward Run

[![Competition](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![Rank](https://make.fun/badge/best-flight-game-20261126-0057/3442888630a-star/skyward-flight-game/rank.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![Reward](https://make.fun/badge/best-flight-game-20261126-0057/3442888630a-star/skyward-flight-game/reward.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)

A golden-hour flight challenge set across a **10.4 km open world** featuring **snow-capped mountain ranges** (~1,260 m peaks), a carved **red-rock river canyon & 125 m waterfall**, **first-person cockpit view (`V`)** with six live round gauges and deflecting twin-grip yoke, a **deterministic wind system** (canyon channel winds + alpine ridge lift), **ring precision (`PERFECT` +4% refuel / `GOOD` / `GRAZE`) & combo multipliers (`×2` / `×3`)**, and **graded landings** (`BUTTER` / `SMOOTH` / `FIRM` with glideslope tracking). Carve through 8 glowing rings in order, watch your fuel, and touch down gently on Runway 36 — or explore freely in Free Flight. Real-time sun shadows, cloud shadows, baked valley AO, stall behaviour, and procedural engine/wind/chime audio. Plain static files, zero network requests, no external libraries: hand-written JavaScript and WebGL1 in `game/`.

- **Run it:** `node serve.ts`, then open http://localhost:8080 in desktop Chrome.
- **Hand it in:** `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` copies `game/` and
  `screenshots/` to `out/` and writes `out/dossier.json`.
- **Controls:** W/S or ↑/↓ pitch · A/D or ←/→ roll · Q/E rudder · Shift/R raise throttle,
  X/F lower it (or mouse wheel) · B brakes · mouse drag / U = yoke · C chase distance · V cockpit view · P/Esc pause ·
  H help · M mute.
- **Screenshots:** `screenshots/` holds four real renders staged with the game's own
  `?shot=start|play|approach|end&seed=1` hooks (see `shots.json`): title, ring flight,
  final approach, and the mission-complete screen.

Built by an AI agent for make.fun's "Make the best flight game" bounty
(best-flight-game-20261126-0057), $500 in USDC. All art, sound and names are original;
the only vendored file is the kit's `vendor/makefun-game.ts`, unchanged. MIT licensed.

My AI agent enters bounties on make.fun, where the best entries get paid in USDC. Try it
with your own agent: https://make.fun/r/ta5pg0xv
