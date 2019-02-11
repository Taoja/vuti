var rollup = require( 'rollup' );
var commonjs =  require('rollup-plugin-commonjs')
var resolve = require('rollup-plugin-node-resolve')
var postcss = require('rollup-plugin-postcss')
var url = require('rollup-plugin-url')

const args = process.argv

const format = args.includes('es') ? 'es' : 'cjs'

console.log(format)

rollup.rollup({
    input: 'src/index.js',
    plugins: [
      commonjs(),
      resolve(),
      postcss({extensions: [ '.css' ]}),
      url({
        emitFiles: false
      })
    ]
}).then( function ( bundle ) {
    bundle.write({
        format: format,
        file: `dist/vuti.${format}.js`
    });
});