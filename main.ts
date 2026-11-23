// The Clockwork Spire hand-in program (Node 22, standard library only).
//
// It assembles the entry the grader reads, in three steps:
//   1. Resolve the repository root (this file's directory) and the output
//      directory: /output in the grader, or $MAKEFUN_OUTPUT_DIR outside it.
//   2. Copy game/ and screenshots/ into the output directory, replacing any
//      stale copy so a rerun never mixes old files with new ones.
//   3. Write dossier.json with buildDossier from the vendored make.fun
//      library, passing the bounty's own caps so this program fails exactly
//      where the scorer would.
//
// Usage from the repository root:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice: both runs must write byte-identical output.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function refreshCopy(name) {
  const from = join(repoDir, name);
  const to = join(targetDir, name);
  if (!existsSync(from)) return 0;
  if (existsSync(to)) rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  return countEntries(to);
}

function countEntries(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    n += 1;
    if (entry.isDirectory()) n += countEntries(join(dir, entry.name));
  }
  return n;
}

mkdirSync(targetDir, { recursive: true });
const gameEntries = refreshCopy('game');
const shotEntries = refreshCopy('screenshots');

const dossier = buildDossier(targetDir, CAPS);
const dossierPath = join(targetDir, 'dossier.json');
writeFileSync(dossierPath, dossier);
console.log(`copied game/ (${gameEntries} entries) and screenshots/ (${shotEntries} entries)`);
console.log(`dossier written: ${dossierPath} (${dossier.length} bytes)`);
