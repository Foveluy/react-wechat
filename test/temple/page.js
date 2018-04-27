import First from './outside'

function Second() {
    return (
        <view>
            <view> {foo} </view>
            <view> second无状态组件 </view>
        </view>
    )
}
const Third = () => {
    return (
        <view>
            <view> {foo} </view>
            <view> Third无状态组件 </view>
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

    onLoad() {}

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
                <view style={{ height: `${foo}px`, width: `${foo + 1 - 3 - 4 + 2 + foo}px` }}>你好 react-wechat</view>
                <view style={{ height: `${bar}px`, background: `rgba(${bar},3,3,1)` }}>你好 react-wechat</view>
                <view style={{ height: '300px', background: `rgba(${foo + 100},3,3,1)` }} />
                <First />
                <Second />
                <Third shit={foo} />
            </view>
        )
    }
}
