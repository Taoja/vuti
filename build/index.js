const webpack = require('webpack')
const options = require('./webpack.config')

const compiler = webpack(options)

compiler.run()