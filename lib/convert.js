const babylon = require('babylon')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const generate = require('@babel/generator').default
const chalk = require('chalk').default

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
  let Methods = []

  const visitor = {
    CallExpression(path) {
      //   console.log('CallExpression', path)
      if (t.isMemberExpression(path.node.callee) && path.node.callee.property.name === 'setState') {
        path.node.callee.property.name = 'setData'
      }
    },
    ImportDeclaration(path) {},
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
      exit(path) {}
    },
    ClassProperty(path) {
      if (/state/.test(path.node.key.name)) {
        path.node.key = t.identifier('data')
      }
    }
  }
  const visitJSX = {
    JSXExpressionContainer(path) {
      ConverJSXExpressionContainer(path)
    }
  }
  traverse(ast, Object.assign({}, visitor, visitJSX))

  const i = t.objectExpression(Methods)

  console.log(`page(${generate(i).code})`)

  return generate(ast).code
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
          //   const result = path.node.body.find(x => x.type === 'ReturnStatement')
          const result = generate(path.node).code
          that.return = result.replace('return', '')
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
  //递归替换
  if (
    t.isMemberExpression(path.node.expression) ||
    t.isIdentifier(path.node.expression) ||
    t.isBinaryExpression(path.node.expression)
  ) {
    console.log(generate(path.node.expression).code)
    path.node.expression = t.identifier(`{${generate(path.node.expression).code}}`)
  }
  if (t.isCallExpression(path.node.expression)) {
    if (path.node.expression.callee.property.name === 'map') {
      const mapAst = parse(generate(path.node.expression).code)
      const mapInstance = new map()

      traverse(mapAst, { ...mapInstance.visitor.call(mapInstance) })
      path.replaceWith(t.identifier(mapInstance.return || ''))
    } else {
      console.warn(
        chalk.yellowBright(`warn:暂时不支持在jsx中调用函数, '${generate(path.node.expression).code}' 将不会被编译`)
      )
      path.remove()
    }
  }
}

exports.transform = transform
