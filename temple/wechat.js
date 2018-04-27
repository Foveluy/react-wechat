export class Page {
  window = {}

  onLoad() {}

  render() {}
}

export class App {
  onLaunch() {}
  onShow() {}
  onHide() {}
  onError() {}
  onPageNotFound() {}
}

export class ComponentBase {
  /**
   * 设置state并执行视图层渲染
   */
  setState() {}

  /**
   * 检查组件是否具有 behavior
   * （检查时会递归检查被直接或间接引入的所有behavior）
   */
  hasBehavior() {}

  /**
   * 触发事件，参见
   * https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/events.html
   */
  triggerEvent() {}

  /**
   * 创建一个 SelectorQuery 对象，选择器选取范围为这个组件实例内
   */
  createSelectorQuery() {}

  /**
   * 使用选择器选择组件实例节点，返回匹配到的第一个组件实例对象
   */
  selectComponent() {}

  /**
   * 使用选择器选择组件实例节点，返回匹配到的全部组件实例对象组成的数组
   */
  selectAllComponents() {}

  /**
   * https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/relations.html
   * 获取所有这个关系对应的所有关联节点，参见 组件间关系
   */
  getRelationNodes() {}

  props = {}
  state = {}
  behaviors = []
}

export class Behavior extends ComponentBase {}

export class Component extends ComponentBase {
  render() {}
}

class store {
  constructor(reducer) {
    this.store = {}
    this.listener = []
    this.reducer = reducer
  }

  subscribe = fn => {
    this.listener.push(fn)
  }

  dispatch = action => {
    const store = this.reducer(this.store, action)
    if (store !== this.store) {
      this.store = store
      this.listener.forEach(fn => {
        fn(this.store)
      })
    }
  }
}

function createStore(reducer) {
  return new store(reducer)
}

function reducer(state, action) {
  if (!state.foo) {
    state.foo = 0
  }

  return { ...state, foo: state.foo + 1 }
}
