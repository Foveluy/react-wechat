const RESERVED_PROPS = {
  ref: true,
  key: true,
  __self: true,
  __source: true
}

class Vnode {
  constructor(type, props, key, ref) {
    this.type = type
    this.props = props
    this.key = key
    this.ref = ref
  }
}

let __type = Object.prototype.toString
var numberMap = {
  //null undefined IE6-8这里会返回[object Object]
  '[object Boolean]': 2,
  '[object Number]': 3,
  '[object String]': 4,
  '[object Function]': 5,
  '[object Symbol]': 6,
  '[object Array]': 7
}

/**
 * undefined: 0, null: 1, boolean:2, number: 3, string: 4, function: 5, symbol:6, array: 7, object:8
 * @param {any} data
 */
function typeNumber(data) {
  if (data === null) {
    return 1
  }
  if (data === undefined) {
    return 0
  }
  var a = numberMap[__type.call(data)]
  return a || 8
}

function CreateWxElement(type, config, ...children) {
  let props = {},
    key = null,
    ref = null,
    childLength = children.length

  if (config != null) {
    //巧妙的将key转化为字符串
    key = config.key === undefined ? null : '' + config.key
    ref = config.ref === undefined ? null : config.ref

    /**这一步讲外部的prop属性放进prop里 */
    for (let propName in config) {
      // 除去一些不需要的属性,key,ref等
      if (RESERVED_PROPS.hasOwnProperty(propName)) continue
      //保证所有的属性都不是undefined
      if (config.hasOwnProperty(propName)) {
        props[propName] = config[propName]
      }
    }
  }

  if (childLength === 1) {
    props.children = typeNumber(children[0]) > 2 ? [children[0]] : []
  } else if (childLength > 1) {
    props.children = children
  }

  /**设置defaultProps */
  let defaultProps = type.defaultProps
  if (defaultProps) {
    for (let propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName]
      }
    }
  }

  return new Vnode(type, props, key, ref)
}

class App {
  constructor() {
    this.state = {
      foo: [1, 3, 4, 5]
    }
  }

  renderSomething() {
    const abc = 1
    return (
      <div>
        {abc}
        {this.state.foo.map(i => {
          return <child>{i}</child>
        })}
      </div>
    )
  }

  render() {
    return (
      <div
        style={() => ({
          black: 'black',
          width: '132'
        })}
      >
        {this.renderSomething()}
      </div>
    )
  }
}

function renderComponent(Vnode) {
  let ComponentConstructor = Vnode.type
  let instance = new ComponentConstructor()

  let renderedVnode = instance.render()

  let string = renderToString(renderedVnode)
  return string
}

function renderNativeTag(Vnode, childrenString) {
  let nativeTag = Vnode.type

  return `<${nativeTag}>${childrenString}</${nativeTag}>\n`
}

function renderMap(Vnodes) {
  let string = ''
  Vnodes.forEach(v => {})
  console.log(Vnodes)
  string = renderChildren(Vnodes)
  console.log('\n---->', string, '<----\n')
  return string
}

function renderChildren(Vnodes) {
  let string = ''
  if (!Vnodes) return string

  Vnodes.forEach(Vnode => {
    if (Vnode instanceof Array) {
      string += renderMap(Vnode)
      return
    }
    if (typeof Vnode !== 'object') {
      string += Vnode
      return
    }

    let { type } = Vnode
    if (typeof type === 'function') {
      string += renderComponent(Vnode)
    }

    if (typeof type === 'string') {
      let { children } = Vnode.props
      const childrenString = renderChildren(children)
      string += renderNativeTag(Vnode, childrenString)
    }
  })
  // console.log('-->', string, '\n')
  return string
}

function renderToString(Vnode) {
  let { type } = Vnode
  let { children } = Vnode.props

  let string
  switch (typeof type) {
    case 'function': {
      string = renderComponent(Vnode)
      break
    }
    case 'string': {
      const childrenString = renderChildren(children)
      string = renderNativeTag(Vnode, childrenString)
      break
    }
  }

  return string
}

function Registry(Vnode) {
  return renderToString(Vnode)
}

const string = Registry(<App />)

console.log(string)
