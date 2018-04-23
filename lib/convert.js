const babylon = require('babylon')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const generate = require('@babel/generator').default

function parse(src) {
    const options = {
        babelrc: false,
        sourceType: 'module',
        plugins: ['jsx', 'objectRestSpread', 'classProperties']
    }

    return babylon.parse(src, options)
}

const transform = code => {
    const ast = parse(code)

    // const visitor = {
    //     CallExpression(path) {
    //         console.log('CallExpression', path)
    //     },
    //     ImportDeclaration(path) {},
    //     ExportDefaultDeclaration(path) {},
    //     ClassMethod(path) {},
    //     ClassProperty(path) {}
    // }

    // traverse(ast, Object.assign({}, visitor))
    return code
}

exports.transform = transform
