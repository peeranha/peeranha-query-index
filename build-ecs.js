const { build } = require('esbuild');
const { dependencies } = require('./package.json');

build({
  entryPoints: ['src/handlers/sui-events-listener.ts'],
  outfile: 'dist/sui-events-listener.mjs',
  bundle: true,
  external: Object.keys(dependencies),
  platform: 'node',
  format: 'esm',
});
