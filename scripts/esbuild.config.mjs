import { opendir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath, URL } from 'url';
import typescript from 'typescript';
import esbuild from 'esbuild';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const tsConfig = require('@lioness100/ts-config');

async function* scan(path, cb) {
  const dir = await opendir(path);

  for await (const item of dir) {
    const file = join(dir.path, item.name);
    if (item.isFile()) {
      if (cb(file)) {
        yield file;
      }
    } else if (item.isDirectory()) {
      yield* scan(file, cb);
    }
  }
}

export async function build(watch = false) {
  const rootFolder = new URL('../', import.meta.url);
  const distFolder = new URL('dist/', rootFolder);
  const srcFolder = new URL('src/', rootFolder);

  const tsFiles = [];
  const fileRegex = /(?<!\.d)\.ts/;

  for await (const path of scan(srcFolder, (file) => fileRegex.test(file))) {
    tsFiles.push(path);
  }

  const tsconfig = join(fileURLToPath(srcFolder), 'tsconfig.json');
  const outdir = fileURLToPath(distFolder);

  await esbuild.build({
    logLevel: 'info',
    entryPoints: tsFiles,
    format: 'esm',
    resolveExtensions: ['.ts', '.js'],
    write: true,
    outdir,
    platform: 'node',
    tsconfig,
    watch,
    plugins: [{ name: 'tsc', setup: pluginTsc }],
    incremental: watch,
    sourcemap: true,
    external: [],
    minify: process.env.NODE_ENV === 'production',
  });
}

function pluginTsc(build) {
  build.onLoad({ filter: /entities/ }, async (args) => {
    const ts = await readFile(args.path, 'utf8');
    const program = typescript.transpileModule(ts, tsConfig);
    return { contents: program.outputText };
  });
}
