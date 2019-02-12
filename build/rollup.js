const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const postcss = require('rollup-plugin-postcss')
const url = require('rollup-plugin-url')
const uglify = require('rollup-plugin-uglify-es')
const babel = require('rollup-plugin-babel')

const args = process.argv

const format = args.includes('es') ? 'es' : 'umd'

rollup.rollup({
  input: 'src/index.js',
  plugins: [
    commonjs(),
    resolve(),
    postcss({
      extensions: ['.css']
    }),
    url({
      emitFiles: false
    }),
    uglify(),
    babel({
      plugins: ['external-helpers'],
      babelrc: false,
      presets: [
        ['env', {
          modules: false
        }]
      ],
    })
  ]
}).then(function (bundle) {
  bundle.write({
    name: 'Vuti',
    format: format,
    file: `dist/vuti.${format == 'umd' ? 'min' : format}.js`
  });
});