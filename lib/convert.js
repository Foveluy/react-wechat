const babylon = require('babylon')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const generate = require('@babel/generator').default
const chalk = require('chalk').default
const WXML_event = require('./WXML')
const prettifyXml = require('prettify-xml')
const registeTpl = require('./tag')
const { transformSync: transformFrom } = require('@babel/core')
const _path = require('path')

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

const componentLiftMethods = {
    created: 1,
    attached: 1,
    ready: 1,
    moved: 1,
    detached: 1,
    relations: 1,
    externalClasses: 1,
    options: 1,
    data: 1,
    properties: 1
}

const transform = (code, filePath, destPath) => {
    const ast = parse(code)
    let Methods = []
    let Pages = []
    let outPut = {
        wxml: '',
        json: '',
        js: '',
        wxss: '',
        pageType: ''
    }
    let isPage = false
    let isApp = false
    let isComponent = false
    let isStatelessComponent = false
    let isTemplate = false
    let importComponents = {}
    let componentMethods = []
    let unKnownImportSource = {}

    const visitor = {
        ArrowFunctionExpression: {
            enter(path) {
                // console.log(generate(path.node).code)
            }
        },
        MemberExpression(path) {
            const code = generate(path.node).code
            if (code === 'this.state') {
                path.node.property.name = 'data'
            }
        },
        FunctionDeclaration: {
            enter(path) {
                const p = path.node.body.body.find(n => n.type === 'ReturnStatement')
                if (p && p.argument.type === 'JSXElement') {
                    isTemplate = true
                }
            },
            exit(path) {
                if (isTemplate) {
                    //   isTemplate = false
                    const templateWxml = path.node.body.body.find(n => n.type === 'ReturnStatement')
                    const funName = path.node.id.name
                    const openning = t.jsxOpeningElement(t.jSXIdentifier('template'), [
                        makeJSXAttribute('name', `${funName}`)
                    ])
                    const closing = t.jsxClosingElement(t.jSXIdentifier('template'))

                    const tpl = t.jsxElement(openning, closing, [templateWxml.argument])
                    outPut.wxml += PrettifyXml(generate(tpl).code) + '\n' //一个页面中的wxml相加

                    path.remove()
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
                        case 'Component': {
                            isComponent = true
                            break
                        }
                    }
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
            } else if (/pages/.test(source)) {
                const pagePath = source.replace('./', '')
                Pages.push(pagePath)

                path.remove()
            } else if (/components/.test(source)) {
                //给页面绑定组件
                const { specifiers } = path.node
                specifiers.forEach(sp => {
                    const componentName = sp.local.name
                    importComponents[componentName] = source
                })
                path.remove()
            } else {
                const { specifiers } = path.node
                specifiers.forEach(sp => {
                    const componentName = sp.local.name

                    if (source.indexOf('./') >= 0) {
                        //local modules
                    }else{
                        console.log(destPath,'-->',generate(path.node).code )
                    }
                    unKnownImportSource[componentName] = { source: source, code: generate(path.node).code }
                })
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
                if (isComponent) {
                    if (!componentLiftMethods[methodName]) {
                        //如果都不匹配，则说明是methods
                        componentMethods.push(fn)
                    } else {
                        Methods.push(fn)
                    }
                } else {
                    Methods.push(fn)
                }
            },
            exit(path) {
                const methodName = path.node.key.name
                if (methodName === 'render') {
                    for (let i in unKnownImportSource) {
                        //输入外部引用模版
                        if (unKnownImportSource[i].used) {
                            //模版被引用
                            const openning = t.jsxOpeningElement(
                                t.jSXIdentifier('import'),
                                [makeJSXAttribute('src', `${unKnownImportSource[i].source}.wxml`)],
                                true
                            )
                            const closing = t.jsxClosingElement(t.jSXIdentifier('import'))

                            const tplImport = t.jsxElement(openning, closing, [])
                            const importCode = generate(tplImport).code
                            outPut.wxml += importCode + '\n'
                        }
                    }

                    const wxml_ast = path.node.body.body.find(i => i.type === 'ReturnStatement')
                    const wxml = wxml_ast && generate(wxml_ast.argument).code
                    outPut.wxml += wxml_ast && PrettifyXml(wxml)

                    //   console.log(outPut.wxml)
                    path.remove()
                }
            }
        },
        ClassProperty(path) {
            const propsName = path.node.key.name
            if (/state|data/.test(propsName)) {
                Methods.push(t.objectProperty(t.identifier('data'), path.node.value))
            } else if (!/window|props/.test(propsName)) {
                Methods.push(t.objectProperty(t.identifier(propsName), path.node.value))
            }

            if (/props/.test(propsName)) {
                Methods.push(t.objectProperty(t.identifier('properties'), path.node.value))
            }

            if (/window/.test(propsName)) {
                let obj = {}
                path.node.value.properties.forEach(prop => {
                    obj[prop.key.name] = prop.value.value
                })
                if (isApp) {
                    obj = {
                        window: obj,
                        pages: Pages
                    }
                }
                outPut.json = obj
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

                if (unKnownImportSource[wxmlTag]) {
                    //如果使用了无状态组件（模版）
                    unKnownImportSource[wxmlTag].used = true
                }
                if (!registeTpl[wxmlTag] && !importComponents[wxmlTag]) {
                    //如果页面中是模版、并且不是组件的话，则替换
                    path.parent.openingElement = t.jsxOpeningElement(
                        t.jsxIdentifier('template'),
                        [makeJSXAttribute('is', `${wxmlTag}`), ...path.parent.openingElement.attributes],
                        true
                    )
                }
            },
            enter(path) {
                ConverJSXOpeningElement(path)
            }
        }
    }
    traverse(ast, Object.assign({}, visitor, visitJSX))

    if (isApp) {
        const i = t.objectExpression(Methods)
        outPut.js = generate(ast).code + `\nApp(${generate(i).code})`
        outPut.pageType = 'App'
    } else if (isPage) {
        const i = t.objectExpression(Methods)
        outPut.js = generate(ast).code + `\nPage(${generate(i).code})`
        outPut.pageType = 'Page'
        if (Object.keys(importComponents).length !== 0) {
            outPut.json = { ...outPut.json, usingComponents: { ...importComponents } }
        }
    } else if (isComponent) {
        const mts = t.objectExpression(componentMethods)
        const _componentMethods = t.objectExpression([t.objectProperty(t.identifier('methods'), mts), ...Methods])

        outPut.js = generate(ast).code + `\nComponent(${generate(_componentMethods).code})`
        outPut.pageType = 'Component'
        outPut.json = { ...outPut.json, component: true }
    } else if (isTemplate && outPut.pageType === '') {
        // console.log(outPut, isTemplate)
        outPut.pageType = 'template'
    } else if (/node_modules/.test(filePath)) {
        outPut.js = transformFrom(generate(ast).code, {
            babelrc: false,
            plugins: [
                '@babel/plugin-proposal-object-rest-spread',
                [
                    '@babel/plugin-transform-modules-commonjs',
                    {
                        loose: true,
                        noInterop: true
                    }
                ]
            ]
        }).code.replace('"use strict";\n\n', '')
        outPut.pageType = 'node_modules'
    }
    for (let i in unKnownImportSource) {
        if (unKnownImportSource[i].used === true) {
            // outPut.js += unKnownImportSource[i].code
            outPut.js = outPut.js.replace(unKnownImportSource[i].code, '')
        }
    }

    outPut.json = JSON.stringify(outPut.json, null, 4)

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
            JSXOpeningElement: {
                enter(path) {
                    //给jsx添加属性
                    const tag = path.parent.openingElement.name.name
                    let key = void 666
                    const atrs = path.parent.openingElement.attributes.filter(atr => {
                        if (atr.name.name !== 'key') {
                            return atr
                        }
                        key = atr
                    })

                    if (key) {
                        const value = generate(key.value.expression).code
                        atrs.push(makeJSXAttribute('wx:key', `{{${value}}}`))
                    }
                    const jsx = t.jsxOpeningElement(t.jSXIdentifier(tag), [
                        makeJSXAttribute('wx:for', `{{${that.object}}}`),
                        makeJSXAttribute('wx:for-item', `${that.item}`),
                        makeJSXAttribute('wx:for-index', `${that.index}`),
                        ...atrs //继承父亲的属性
                    ])

                    path.parent.openingElement = jsx
                },
                exit(path) {
                    ConverJSXOpeningElement(path)
                }
            },
            JSXExpressionContainer(path) {
                ConverJSXExpressionContainer(path)
            }
        }
    }
}

const makeJSXAttribute = (key, value) => {
    return t.jSXAttribute(t.jSXIdentifier(key), t.stringLiteral(value))
}

const ConverJSXOpeningElement = path => {
    path.node.attributes.forEach(arrt => {
        const originName = arrt.name.name
        const attrName = arrt.name.name.toLowerCase()
        arrt.name = t.identifier(originName)

        if (WXML_event[attrName]) {
            arrt.name = t.identifier(attrName)
            //mapping事件
            const funName = generate(arrt.value.expression.property).code
            if (t.isCallExpression(arrt.value.expression) || t.isArrowFunctionExpression(arrt.value.expression)) {
                const warningCode = generate(arrt.value.expression).code
                console.log(
                    chalk.yellowBright(
                        `警告：小程序官方目前不支持事件中使用function/arrow function，因此 '${warningCode}' 不会被编译`
                    )
                )
            }
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

const ConverJSXExpressionContainer = path => {
    if (t.isJSXAttribute(path.parent)) {
        path.replaceWith(t.stringLiteral(`{{${generate(path.node.expression).code}}}`))
        return
    }

    if (
        t.isMemberExpression(path.node.expression) ||
        t.isIdentifier(path.node.expression) ||
        t.isBinaryExpression(path.node.expression)
    ) {
        const code = generate(path.node.expression).code
        if (code === 'children') {
            const openning = t.jsxOpeningElement(t.jSXIdentifier('slot'), [], true)
            const closing = t.jsxClosingElement(t.jSXIdentifier('slot'))

            const tpl = t.jsxElement(openning, closing, [])
            path.replaceWith(tpl)
        } else {
            path.node.expression = t.identifier(`{${code}}`)
        }
    }

    if (t.isCallExpression(path.node.expression)) {
        //递归替换map
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
