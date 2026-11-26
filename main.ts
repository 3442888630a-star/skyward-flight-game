// A working best-game-01 entry (Node 22, standard library only): the game is this directory's
// game/ folder, plain static files a desktop browser loads offline (game/index.html and its ES
// modules, no library and no network request), and the program hands it in. It copies game/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library. A starting point, not a winner: Block Dodger, a
// plain 2D canvas game where a paddle dodges falling blocks and catches coins, with a title screen,
// score, lives and levels, game over and restart, flat colours and no sound. Build your own game
// (any genre, any library you vendor under game/, or none), put your 3 or 4 PNG or JPEG screenshots
// in screenshots/ (the first by name is the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const MAX_GAME_ENTRIES = 993;
const MAX_SCREENSHOT_BYTES = 262144;

function walkOutputTree(rootDir) {
  const files = [];
  let entries = 0;
  const pending = [''];

  while (pending.length > 0) {
    const relDir = pending.pop();
    const absDir = relDir === '' ? rootDir : join(rootDir, relDir);
    for (const dirent of readdirSync(absDir, { withFileTypes: true })) {
      const relPath = relDir === '' ? dirent.name : `${relDir}/${dirent.name}`;
      const stat = lstatSync(join(rootDir, relPath));
      entries += 1;
      if (stat.isDirectory()) {
        pending.push(relPath);
      } else if (stat.isFile()) {
        files.push({ relPath, bytes: stat.size });
      }
    }
  }

  return { entries, files };
}

function loadExpectedScreenshots(shotsPath) {
  const parsed = JSON.parse(readFileSync(shotsPath, 'utf8'));
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('shots.json must be a non-empty JSON array');
  }
  return parsed.map((item, index) => {
    if (typeof item !== 'object' || item === null || typeof item.name !== 'string') {
      throw new Error(`shots.json entry at index ${index} is missing a string "name"`);
    }
    return item.name;
  });
}

function verifyCopiedOutput(outDir, shotsPath) {
  const gameTree = walkOutputTree(join(outDir, 'game'));
  const shotTree = walkOutputTree(join(outDir, 'screenshots'));
  const expectedShots = loadExpectedScreenshots(shotsPath);

  const failures = [];
  if (gameTree.entries > MAX_GAME_ENTRIES) {
    failures.push(`game/ has ${gameTree.entries} entries (limit is ${MAX_GAME_ENTRIES})`);
  }

  let maxShotBytes = 0;
  const presentShots = new Set();
  for (const file of shotTree.files) {
    presentShots.add(file.relPath);
    if (file.bytes > maxShotBytes) maxShotBytes = file.bytes;
    if (file.bytes > MAX_SCREENSHOT_BYTES) {
      failures.push(`screenshots/${file.relPath} is ${file.bytes} bytes (limit is ${MAX_SCREENSHOT_BYTES})`);
    }
  }

  const missingShots = expectedShots.filter((name) => !presentShots.has(name));
  if (missingShots.length > 0) {
    failures.push(`missing expected screenshot(s) from shots.json: ${missingShots.join(', ')}`);
  }

  if (failures.length > 0) {
    throw new Error(failures.join('; '));
  }

  return `Verified output: ${gameTree.entries} game entries (${gameTree.files.length} files), ${shotTree.files.length} screenshots (${expectedShots.length} expected from shots.json, max ${maxShotBytes} bytes).`;
}

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

let verificationSummary;
try {
  verificationSummary = verifyCopiedOutput(out, join(here, 'shots.json'));
} catch (err) {
  console.error(`Output verification failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
console.log(verificationSummary);

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
