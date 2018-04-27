
const i = 'shit';
const react_wechat_obj = {
  data: {
    foo: 1
  },
  onLoad: function () {},
  check: function () {
    const a = i + 'hahah';
    this.setData({
      foo: '213'
    });
  },
  onTaps: function () {
    this.setData({
      foo: this.data.foo + 1
    });
  }
}
const onLoad = react_wechat_obj.onLoad
react_wechat_obj.onLoad = function(args){
    onLoad.call(this,args)
}
Page(react_wechat_obj)