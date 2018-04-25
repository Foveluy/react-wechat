const babylon = require('babylon')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const generate = require('@babel/generator').default
const chalk = require('chalk').default
const WXML_event = require('./WXML')
const prettifyXml = require('prettify-xml')
const registeTpl = require('./tag')

const PrettifyXml = wxml => {
    return prettifyXml(wxml, { indent: 2 })
}

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
    let isPage = false
    let isApp = false
    let isComponent = false
    let isStatelessComponent = false
    let isTemplate = false

    const visitor = {
        ArrowFunctionExpression: {
            enter(path) {
                // console.log(generate(path.node).code)
            }
        },
        FunctionDeclaration: {
            enter(path) {
                const p = path.node.body.body.find(n => n.type === 'ReturnStatement')
                if (p.argument.type === 'JSXElement') {
                    isTemplate = true
                }
            },
            exit(path) {
                if (isTemplate) {
                    isTemplate = false
                    const templateWxml = path.node.body.body.find(n => n.type === 'ReturnStatement')
                    const funName = path.node.id.name
                    const openning = t.jsxOpeningElement(t.jSXIdentifier('template'), [
                        t.jSXAttribute(t.jSXIdentifier('name'), t.stringLiteral(`${funName}`))
                    ])
                    const closing = t.jsxClosingElement(t.jSXIdentifier('template'))

                    const tpl = t.jsxElement(openning, closing, [templateWxml.argument])
                    outPut.wxml += PrettifyXml(generate(tpl).code) + '\n' //一个页面中的wxml相加
                }
            }
        },
        ClassDeclaration: {
            enter(path) {
                const superClass = path.node.superClass && path.node.superClass.name
                if (superClass !== null) {
                    switch (superClass) {
                        case 'App': {
                            isApp = true
                            break
                        }
                        case 'Page': {
                            isPage = true
                            break
                        }
                    }
                } else {
                }
            },
            exit(path) {
                path.remove()
            }
        },
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
                    outPut.wxml += wxml_ast && PrettifyXml(wxml)
                    // console.log(outPut.wxml)
                    path.remove()
                }
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
        JSXOpeningElement: {
            exit(path) {
                const wxmlTag = path.node.name.name
                if (!registeTpl[wxmlTag]) {
                    //如果页面中是模版的话，则替换
                    path.parent.openingElement = t.jsxOpeningElement(
                        t.jsxIdentifier('template'),
                        [t.jSXAttribute(t.jSXIdentifier('is'), t.stringLiteral(`${wxmlTag}`))],
                        true
                    )
                }
            },
            enter(path) {
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
    }
    traverse(ast, Object.assign({}, visitor, visitJSX))

    const i = t.objectExpression(Methods)

    // console.log()
    if (isApp) {
        outPut.js = generate(ast).code + `\nApp(${generate(i).code})`
    } else if (isPage) {
        outPut.js = generate(ast).code + `\nPage(${generate(i).code})`
    }

    console.log(outPut.wxml)
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
