const i = 'shit';
const react_wechat_obj = {
  data: {
    foo: 100
  },
  onLoad: function () {},
  onTaps: function () {
    this.setData({
      foo: this.data.foo + 10
    });
  }
}
const onLoad = react_wechat_obj.onLoad
react_wechat_obj.onLoad = function(args){
    onLoad.call(this,args)
}
Page(react_wechat_obj)