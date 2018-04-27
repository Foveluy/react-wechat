const rollup = require('rollup')
const path = require('path')
const rollup_babel = require('rollup-plugin-babel')
const chalk = require('chalk').default
const { transform } = require('./convert')
const fs = require('fs-extra')
const rpResolve = require('rollup-plugin-node-resolve')
const wt = require('wt')
const logger = require('./logger')

const srcPath = p => path.resolve(p)

const templePath = path.resolve('./temple')
const outPutPath = path.resolve('./build')

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
        this.needToWatch = []
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
        const p = modules.map(m => {
            if (m) {
                return this.codegen.call(this, m.id, m.dependencies, m.code, m.babeled)
            }
        })

        const start = Date.now()
        await Promise.all(p)
        const time = Date.now() - start
        logger.greate(`编译耗时:${time / 1000}s`)
    }

    async codegen(id, dependencies, code, babeled) {
        let srcPath = id.replace(path.resolve('./temple'), '')
        if (/node_modules/.test(srcPath)) {
            srcPath = srcPath.replace(path.resolve('node_modules'), '')
            srcPath = `nodeModules${srcPath}`
        }
        const destPath = path.join(this.output, srcPath)

        if (/wechat.js/.test(destPath)) return

        await fs.ensureFile(destPath)

        const _code = transform(code, id, destPath, dependencies, this.output)
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
    }

    watch(dir) {
        const watcher = wt.watch([dir])
        watcher.on('all', info => {
            logger.warn(`文件变化: ${info.path} 重新编译`)
            const p = info.path
            if (!/.css/.test(p)) {
                //暂时不编译css
                this.inputOptions = { ...this.inputOptions, input: p }
            }
            this.parse()
        })
    }
}

async function build() {
    try {
        const parser = new CoreParser('./temple/app.js')
        await parser.parse()
        parser.watch('./temple')
    } catch (e) {
        console.log(chalk.redBright(e))
        console.log(e)
    }
}

build()
