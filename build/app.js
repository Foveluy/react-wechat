class store {
  constructor(reducer) {
    this.store = {}
    this.listener = []
    this.reducer = reducer
  }

  subscribe = (fn) => {
    this.listener.push(fn)
  }

  dispatch = (action) => {
    const store = this.reducer(this.store, action)
    if (store !== this.store) {
      this.store = store
      this.listener.forEach((fn) => {
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

App({
  globalData: {
    store: {}
  },
  onLaunch: function () { },
  onShow: function () {
    console.log('app onshow', this)
    this.globalData.store = createStore(reducer)
  },
  onHide: function () { },
  onError: function () { },
  onPageNotFound: function () { }
})

