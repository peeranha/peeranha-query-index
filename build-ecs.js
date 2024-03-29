const { build } = require('esbuild');
const ignorePlugin = require('esbuild-plugin-ignore');
const { dependencies } = require('./package.json');

build({
  entryPoints: ['src/handlers/polygon-events-listener.ts'],
  outfile: 'dist/polygon-events-listener.mjs',
  bundle: true,
  plugins: [
    ignorePlugin([
      {
        resourceRegExp: /knex$/,
      },
      {
        resourceRegExp: /knex-serverless-mysql$/,
      },
    ]),
  ],
  external: Object.keys(dependencies),
  platform: 'node',
  format: 'esm',
});

build({
  entryPoints: ['src/handlers/edgeware-events-listener.ts'],
  outfile: 'dist/edgeware-events-listener.mjs',
  bundle: true,
  plugins: [
    ignorePlugin([
      {
        resourceRegExp: /knex$/,
      },
      {
        resourceRegExp: /knex-serverless-mysql$/,
      },
    ]),
  ],
  external: Object.keys(dependencies),
  platform: 'node',
  format: 'esm',
});

build({
  entryPoints: ['src/handlers/sui-events-listener.ts'],
  outfile: 'dist/sui-events-listener.mjs',
  bundle: true,
  plugins: [
    ignorePlugin([
      {
        resourceRegExp: /knex$/,
      },
      {
        resourceRegExp: /knex-serverless-mysql$/,
      },
    ]),
  ],
  external: Object.keys(dependencies),
  platform: 'node',
  format: 'esm',
});
