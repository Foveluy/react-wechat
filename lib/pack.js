const rollup = require('rollup')
const path = require('path')
const rollup_babel = require('rollup-plugin-babel')
const chalk = require('chalk').default
const { transform } = require('./convert')
const fs = require('fs')

const srcPath = p => path.resolve(p)

// see below for details on the options
const inputOptions = {
  input: srcPath('./temple/index.js'),
  plugins: [
    rollup_babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: ['@babel/preset-react'],
      plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties']
    })
  ]
}
const outputOptions = {
  file: path.resolve('./build/bundle.js'),
  format: 'cjs'
}

const templePath = path.resolve('./temple')
const outPutPath = path.resolve('./build')

async function loader(src) {
  const inputOptions = {
    input: srcPath(src),
    plugins: [
      rollup_babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: ['@babel/preset-react'],
        plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties']
      })
    ]
  }

  const bundle = await rollup.rollup(inputOptions)

  //   console.log(bundle.imports) // an array of external dependencies
  //   console.log(bundle.exports) // an array of names exported by the entry point
  //   console.log(bundle.modules) // an array of module objects

  bundle.modules.forEach(({ id, dependencies, originalCode, code }) => {
    const _code = transform(originalCode)

    const fileId = id.replace(templePath + '/', '')
    const fileOutPth = outPutPath + '/' + fileId

    fs.writeFile(fileOutPth, _code, () => {})
  })
}

async function build() {
  try {
    //创建文件夹
    if (!fs.existsSync('./build/pages')) fs.mkdirSync(srcPath('./build/pages'))

    //pages
    const dir = fs.readdirSync(srcPath('./temple/pages'))
    const pages = dir.map(file => {
      return loader('./temple/pages/' + file)
    })
    await Promise.all(pages)

    //app
    await loader('./temple/app.js')
  } catch (e) {
    console.log(chalk.redBright(e))
    console.log(e)
  }
}

build()
