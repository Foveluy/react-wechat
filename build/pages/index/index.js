const i = 'shit';
Page({
  data: {
    foo: [1, 3, 4, 5]
  },
  check: function () {
    const a = i + 'hahah';
    this.setData({
      foo: '213'
    });
  },
  onTaps: function () {
    this.setData({
      foo: '213'
    });
  }
})