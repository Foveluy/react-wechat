import Index from './pages/index/index'
import { App } from './wechat'

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
