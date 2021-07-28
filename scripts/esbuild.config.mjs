import esbuild from 'esbuild';
import { opendir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath, URL } from 'url';

/**
 * scan a directory recursively and return the file names
 * @param {string} path - the directory path to scan
 * @param {(file: string) => boolean} cb - the callback to validate file names
 * @returns {AsyncGenerator<string, void, undefined>}
 */
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

/**
 * build ts files into esm js files in /dist (with various settings)
 * @param [watch=false] - whether to rebuild on save
 */
export async function build(watch = false) {
  const rootFolder = new URL('../', import.meta.url);
  const distFolder = new URL('dist/', rootFolder);
  const srcFolder = new URL('src/', rootFolder);

  const tsFiles = [];
  const fileRegex = /(?<!\.d)\.ts/;

  for await (const path of scan(srcFolder, (file) => fileRegex.test(file))) {
    tsFiles.push(path);
  }

  await esbuild.build({
    logLevel: 'info',
    entryPoints: tsFiles,
    format: 'esm',
    resolveExtensions: ['.ts', '.js'],
    write: true,
    outdir: fileURLToPath(distFolder),
    platform: 'node',
    tsconfig: join(fileURLToPath(srcFolder), 'tsconfig.json'),
    watch,
    incremental: watch,
    sourcemap: true,
    external: [],
    minify: process.env.NODE_ENV === 'production',
  });
}
