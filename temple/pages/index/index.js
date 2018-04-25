import { Page } from '../../wechat'
import { avatar } from './avatar'

const i = 'shit'

function Second() {
    return (
        <view>
            <text> {fuck} </text>
            <text> B template </text>
            <text> B template </text>
            <text> B template </text>
        </view>
    )
}
export default class Index extends Page {
    state = {
        foo: [1, 3, 4, 5]
    }
    window = {
        navigationBarTitleText: '第一个页面'
    }
    check() {
        const a = i + 'hahah'
        this.setState({
            foo: '213'
        })
    }
    onTaps() {
        this.setState({
            foo: '213'
        })
    }
    render() {
        const { foo } = this.state
        return (
            <view bindTap={this.onTaps} style={{ background: 'black', width: '123px' }}>
                <Second />
                <view>
                    {foo.map((item, index) => {
                        return (
                            <view>
                                {c.map((i, idx) => {
                                    return <view>1</view>
                                })}
                            </view>
                        )
                    })}
                </view>
            </view>
        )
    }
}
