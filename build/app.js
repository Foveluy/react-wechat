import { createStore } from "nodeModules/redux/es/redux.js";

const reducer = state => {
  return state;
};
const react_wechat_obj = {
  globalData: 'I am global data',
  onLaunch: function () {},
  onShow: function () {},
  onHide: function () {},
  onError: function () {},
  onPageNotFound: function () {}
}
const onLoad = react_wechat_obj.onLoad
react_wechat_obj.onLoad = function(args){
    onLoad.call(this,args)
}
App(react_wechat_obj)