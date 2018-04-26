import { Page } from '../../wechat'
import Modal from '../../components/modal/modal'
import First from './outside'
import { createStore } from 'redux'

const i = 'shit'

function Second() {
    return (
        <view>
            <view> {foo} </view>
            <view> second无状态组件 </view>
        </view>
    )
}
export default class Index extends Page {
    state = {
        foo: 1
    }
    window = {
        navigationBarTitleText: 'react-wechat'
    }
    check() {
        const a = i + 'hahah'
        this.setState({
            foo: '213'
        })
    }
    onTaps() {
        this.setState({
            foo: this.state.foo + 1
        })
    }
    render() {
        const { foo } = this.state
        return (
            <view class="container">
                <view>你好 react-wechat</view>
                <button bindTap={this.onTaps}>+1</button>
                <view>{foo}</view>
                <Modal propsFoo={foo} />
                <Second data="{{foo,bar}}" />
                <First />
            </view>
        )
    }
}
