
const react_wechat_obj = {
  onLoad: function () {},
  onSwiperChange: function (e) {
    console.log(e.detail.current, e.detail.source);
  }
}
const onLoad = react_wechat_obj.onLoad
react_wechat_obj.onLoad = function(args){
    if(onLoad !== void 666)
        onLoad.call(this,args)
}
Page(react_wechat_obj)