// Renderiza stills de revision: node scripts/stills.mjs <Composicion> <f1,f2,...> [outDir]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [comp = 'Bankz16x9', frames = '0', outDir = 'out/review'] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
for (const f of frames.split(',').map(Number)) {
  const output = path.resolve(outDir, `${comp}-${String(f).padStart(3, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame: f, browserExecutable, overwrite: true, chromiumOptions: {gl: process.env.REMOTION_GL || 'swangle'}});
  console.log(output);
}
