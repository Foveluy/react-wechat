const rollup = require('rollup')
const path = require('path')
const rollup_babel = require('rollup-plugin-babel')
const chalk = require('chalk').default
const { transform } = require('./convert')
const fs = require('fs-extra')
const rpResolve = require('rollup-plugin-node-resolve')

const srcPath = p => path.resolve(p)

const templePath = path.resolve('./temple')
const outPutPath = path.resolve('./build')

async function loader(src, pageType) {
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

  bundle.modules.forEach(({ id, dependencies, originalCode, code }) => {
    if (/rollup/.test(id) || /wechat.js/.test(id)) return

    const _code = transform(originalCode, pageType)

    const fileId = id.replace(templePath + '/', '')

    let fileOutPth = `${outPutPath}/${fileId}`
    let fileName = fileOutPth.replace('.js', '')
    if (pageType === 'Page') {
      fileOutPth = `${outPutPath}/${fileId}`
      fileName = fileOutPth.replace('.js', '')
    }

    fs.writeFile(fileOutPth, _code.js, () => {})
    if (_code.wxml && _code.wxml.length > 5) fs.writeFile(fileName + '.wxml', _code.wxml, () => {})
    fs.writeFile(fileName + '.json', _code.json, () => {})
  })
}

class CoreParser {
  constructor(Path) {
    this.path = Path
    this.inputOptions = {
      input: srcPath(this.path),
      plugins: [
        rpResolve(),
        rollup_babel({
          exclude: 'node_modules/**',
          babelrc: false,
          presets: ['@babel/preset-react'],
          plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties']
        })
      ]
    }
    this.output = srcPath('./build')
  }

  async parse() {
    const bundle = await rollup.rollup(this.inputOptions)
    const modules = bundle.modules.map(({ id, dependencies, originalCode, code }) => {
      if (/rollup/.test(id)) return //忽略 rollupPluginBabelHelpers
      return {
        id: id,
        code: originalCode,
        babeled: code,
        dependencies: dependencies.filter(d => {
          if (!/rollup/.test(d)) return d
        })
      }
    })
    modules.forEach(m => {
      if (m) this.codegen.call(this, m.id, m.dependencies, m.code, m.babeled)
    })
  }

  codegen(id, dependencies, code, babeled) {
    let srcPath = id.replace(path.resolve('./temple'), '')
    if (/node_modules/.test(srcPath)) {
      srcPath = srcPath.replace(path.resolve('node_modules'), '')
      srcPath = `nodeModules${srcPath}`
    }
    const destPath = path.join(this.output, srcPath)

    if (/wechat.js/.test(destPath)) return

    fs.ensureFile(destPath, () => {
      const _code = transform(code, id, destPath, dependencies,this.output)
      const srcBasePath = id.replace('.js', '')
      const basePath = destPath.replace('.js', '')
      if (/Page|App|Component/.test(_code.pageType)) {
        fs.writeFile(destPath, _code.js, () => {})
        fs.writeFile(basePath + '.json', _code.json, () => {})
      }
      if (/Page|Component/.test(_code.pageType)) {
        fs.writeFile(basePath + '.wxml', _code.wxml, () => {})
        fs.copyFile(srcBasePath + '.css', basePath + '.wxss', () => {})
      }
      if (/template/.test(_code.pageType)) {
        fs.writeFile(basePath + '.wxml', _code.wxml, () => {})
        fs.remove(destPath)
      }
      if (/node_modules/.test(_code.pageType)) {
        fs.writeFile(destPath, _code.js, () => {})
      }
    })
  }

  dump(code) {}
}

async function build() {
  const start = Date.now()
  try {
    const parser = new CoreParser('./temple/app.js')
    await parser.parse()
    parser.dump()
  } catch (e) {
    console.log(chalk.redBright(e))
    console.log(e)
  }
  const time = Date.now() - start
  console.log(`耗费时间:${time / 1000}s`)
}

build()

function mkdirs(dirpath, mode, callback) {
  fs.exists(dirpath, function(exists) {
    if (exists) {
      callback(dirpath)
    } else {
      //尝试创建父目录，然后再创建当前目录
      mkdirs(path.dirname(dirpath), mode, function() {
        fs.mkdir(dirpath, mode, callback)
      })
    }
  })
}
