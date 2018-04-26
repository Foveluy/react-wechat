import { Page } from '../../wechat'
import Modal from '../../components/modal/modal'

const i = 'shit'

function Second() {
  return (
    <view>
      <view> {foo} </view>
      <view> 无状态组件 </view>
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
      <view class="container" bindTap={this.onTaps}>
        <view>你好 react-wechat</view>
        <button>+1</button>
        <view>{foo}</view>
        <Modal />
        <Second data="{{foo,bar}}" />
      </view>
    )
  }
}
