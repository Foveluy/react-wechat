
const react_wechat_obj = {
  onLoad: function () {}
}
const onLoad = react_wechat_obj.onLoad
react_wechat_obj.onLoad = function(args){
    if(onLoad !== void 666)
        onLoad.call(this,args)
}
Page(react_wechat_obj)