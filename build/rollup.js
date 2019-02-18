const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const postcss = require('rollup-plugin-postcss')
const url = require('rollup-plugin-url')
const uglify = require('rollup-plugin-uglify-es')
const babel = require('rollup-plugin-babel')
const license = require('rollup-plugin-license')
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
    license({
      banner: `
        Vuti v<%= pkg.version %>
        (c) 2018-<%= moment().format('YYYY') %> huangwutao
        Released under the MIT @License.
        document -> https://taoja.github.io/vuti
        github -> https://github.com/Taoja/vuti
      `
    }),
    uglify({
      output: {
        comments: 'some'
      }
    }),
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
    file: `dist/vuti.${format == 'umd' ? 'min' : format}.js`,
  })
})