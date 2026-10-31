// Fails when the committed dist/ no longer matches a fresh tsc build (jsDelivr serves dist from git tags).
import { execFileSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(PKG, 'dist');
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');

const fresh = await mkdtemp(path.join(os.tmpdir(), 'gx-utils-'));
try {
  execFileSync(process.execPath, [tsc, '-p', path.join(PKG, 'tsconfig.json'), '--outDir', fresh], { stdio: 'inherit' });
  const expected = (await readdir(fresh)).sort();
  const actual = (await readdir(DIST).catch(() => [])).sort();
  const stale = expected.filter((f) => !actual.includes(f));
  for (const file of expected) {
    if (stale.includes(file)) continue;
    const [a, b] = await Promise.all([readFile(path.join(fresh, file), 'utf8'), readFile(path.join(DIST, file), 'utf8')]);
    if (a !== b) stale.push(file);
  }
  stale.push(...actual.filter((f) => !expected.includes(f)));
  if (stale.length) {
    console.error(`[gamifiedui-utils] stale dist: ${stale.join(', ')}. Run npm run build --workspace=gamifiedui-utils.`);
    process.exit(1);
  }
  console.log('[gamifiedui-utils] dist is up to date');
} finally {
  await rm(fresh, { recursive: true, force: true });
}
