const i = 'shit';
const store = getApp().globalData.store

Page({
  data: {
    foo: 1
  },
  onLoad() {
    console.log(this)
    store.subscribe((state) => {
      console.log(state)
      this.setData({ ...state })
    })
  },
  onShow() {
  },
  check: function () {
    const a = i + 'hahah';
    this.setData({
      foo: '213'
    });
  },
  onTaps: function () {
    store.dispatch({ type: 'add' })
  }
})