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
            plugins: [
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-class-properties',
                [
                    '@babel/plugin-transform-react-jsx',
                    {
                        pragma: 'dom'
                    }
                ]
            ]
        })
    ]
}
const outputOptions = {
    file: path.resolve('./build/bundle.js'),
    format: 'cjs'
}

async function build() {
    try {
        // create a bundle

        const bundle = await rollup.rollup(inputOptions)

        // console.log(bundle.imports) // an array of external dependencies
        // console.log(bundle.exports) // an array of names exported by the entry point
        console.log(bundle.modules) // an array of module objects

        bundle.modules.forEach(({ id, dependencies, originalCode, code }) => {
            const _code = transform(code)
            fs.writeFile(path.resolve('./build/bundle.js'), _code, () => {})
        })
    } catch (e) {
        console.log(chalk.redBright(e))
    }
}

build()
