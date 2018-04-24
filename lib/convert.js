const babylon = require('babylon')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const generate = require('@babel/generator').default
const chalk = require('chalk').default
const WXML_event = require('./WXML')
const prettifyXml = require('prettify-xml')

function parse(src) {
    const options = {
        babelrc: false,
        sourceType: 'module',
        plugins: ['jsx', 'objectRestSpread', 'classProperties']
    }

    return babylon.parse(src, options)
}

const transform = (code, pageType) => {
    const ast = parse(code)
    let Methods = []
    let outPut = {
        wxml: '',
        json: '',
        js: '',
        wxss: ''
    }

    const visitor = {
        CallExpression(path) {
            //   console.log('CallExpression', path)
            if (t.isMemberExpression(path.node.callee) && path.node.callee.property.name === 'setState') {
                path.node.callee.property.name = 'setData'
            }
        },
        ImportDeclaration(path) {
            const source = path.node.source.value
            if (/wechat/.test(source)) {
                path.remove()
            }
        },
        ExportDefaultDeclaration(path) {},
        ClassMethod: {
            enter(path) {
                const methodName = path.node.key.name
                if (methodName === 'render') return

                const fn = t.objectProperty(
                    t.identifier(methodName),
                    t.functionExpression(null, path.node.params, path.node.body, path.node.generator, path.node.async)
                )
                Methods.push(fn)
            },
            exit(path) {
                const methodName = path.node.key.name
                if (methodName === 'render') {
                    const wxml_ast = path.node.body.body.find(i => i.type === 'ReturnStatement')
                    const wxml = wxml_ast && generate(wxml_ast.argument).code
                    outPut.wxml = wxml_ast && prettifyXml(wxml, { indent: 2 })
                    // console.log(outPut.wxml)
                    path.remove()
                }
            }
        },
        ClassDeclaration: {
            exit(path) {
                path.remove()
            }
        },
        ClassProperty(path) {
            const propsName = path.node.key.name
            if (/state/.test(propsName) || /data/.test(propsName)) {
                Methods.push(t.objectProperty(t.identifier('data'), path.node.value))
            }
            if (/window/.test(propsName)) {
                let obj = {}
                path.node.value.properties.forEach(prop => {
                    obj[prop.key.name] = prop.value.value
                })
                outPut.json = JSON.stringify(obj, null, 4)
            }
        }
    }
    const visitJSX = {
        JSXExpressionContainer(path) {
            ConverJSXExpressionContainer(path)
        },
        JSXOpeningElement(path) {
            path.node.attributes.forEach(arrt => {
                const attrName = arrt.name.name.toLowerCase()
                arrt.name = t.identifier(attrName)

                if (WXML_event[attrName]) {
                    //mapping事件
                    const funName = generate(arrt.value.expression.property).code
                    arrt.value = t.stringLiteral(`${funName}`)
                }
                if (attrName === 'style') {
                    //mapping style
                    let tempArrts = ''
                    arrt.value.expression.properties.forEach(styleProp => {
                        const key = generate(styleProp.key).code
                        const isNumber = t.isNumericLiteral(styleProp.value)
                        const value = isNumber ? generate(styleProp.value).code + 'px' : styleProp.value.value
                        tempArrts += `${key}:${value}; `
                    })
                    arrt.value = t.stringLiteral(`${tempArrts}`)
                }
            })
        }
    }
    traverse(ast, Object.assign({}, visitor, visitJSX))

    const i = t.objectExpression(Methods)

    // console.log()
    outPut.js = generate(ast).code + `\n${pageType}(${generate(i).code})`

    return outPut
}

class map {
    visitor() {
        var that = this
        return {
            CallExpression: {
                enter(path) {
                    that.object = generate(path.node.callee.object).code
                }
            },
            ArrowFunctionExpression(path) {
                path.node.params.forEach((arg, index) => {
                    if (index === 0) that.item = generate(arg).code
                    if (index === 1) that.index = generate(arg).code
                })
            },
            ReturnStatement: {
                exit(path) {
                    if (path.node) {
                        const result = generate(path.node.argument).code
                        that.return = result
                    }
                }
            },
            JSXOpeningElement(path) {
                //给jsx添加属性
                const tag = path.parent.openingElement.name.name
                const jsx = t.jsxOpeningElement(t.jSXIdentifier(tag), [
                    t.jSXAttribute(t.jSXIdentifier('for'), t.stringLiteral(`{{${that.object}}}`)),
                    t.jSXAttribute(t.jSXIdentifier('for-item'), t.stringLiteral(`${that.item}`)),
                    t.jSXAttribute(t.jSXIdentifier('for-index'), t.stringLiteral(`${that.index}`)),
                    ...path.parent.openingElement.attributes //继承父亲的属性
                ])

                path.parent.openingElement = jsx
            },

            JSXExpressionContainer(path) {
                ConverJSXExpressionContainer(path)
            }
        }
    }
}

const ConverJSXExpressionContainer = path => {
    //递归替换map
    if (
        t.isMemberExpression(path.node.expression) ||
        t.isIdentifier(path.node.expression) ||
        t.isBinaryExpression(path.node.expression)
    ) {
        path.node.expression = t.identifier(`{${generate(path.node.expression).code}}`)
    }

    if (t.isCallExpression(path.node.expression)) {
        if (path.node.expression.callee.property.name === 'map') {
            const mapAst = parse(generate(path.node.expression).code)
            const mapInstance = new map()

            traverse(mapAst, { ...mapInstance.visitor.call(mapInstance) })
            path.replaceWith(t.identifier(mapInstance.return))
        } else {
            console.warn(
                chalk.yellowBright(
                    `warn:暂时不支持在jsx中调用函数, '${generate(path.node.expression).code}' 将不会被编译`
                )
            )
            path.remove()
        }
    }
}

exports.transform = transform
