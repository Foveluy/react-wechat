import Index from './pages/index/index'
import { App } from './wechat'
import { createStore } from 'redux'

const reducer = state => {
  return state
}
function shit(foo){
    console.log(foo)
    return foo
}

export default class ReactWechatApp extends App {
  window = {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
  globalData = 'I am global data'

  onLaunch() {}
  onShow() {}
  onHide() {}
  onError() {}
  onPageNotFound() {}
}
