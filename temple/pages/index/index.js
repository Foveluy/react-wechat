import { Page } from '../../wechat'

function Button({ title }) {
    return (
        <view class="rw-button">
            <view>{title}</view>
        </view>
    )
}
export default class Index extends Page {
    window = {
        navigationBarTitleText: 'React Wechat',
        navigationBarBackgroundColor: '#282c34',
        navigationBarTextStyle: 'white'
    }
    render() {
        return (
            <view class="container">
                <image class="logo" src="../../res/reaction.svg" />
                <view class="title">你好，React 小程序</view>
                <view class="sub-title">使用 React 写法书写小程序</view>
                <Button data="{{title:'快速开始'}}" />
            </view>
        )
    }
}
