import { Page } from '../../wechat'
import Modal from '../../components/modal/modal'
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
    foo: 100
  }
  window = {
    navigationBarTitleText: 'react-wechat'
  }

  onLoad() {}

  onTaps() {
    this.setState({
      foo: this.state.foo + 10
    })
  }
  render() {
    const { foo } = this.state
    return (
      <view
        class="container"
        bindtap={this.onTaps}
        style={{ height: `200px`, background: `rgba(${foo + 20},3,${foo + 20},1)` }}
      >
        <image class="logo" src="../../res/reaction.svg" />
      </view>
    )
  }
}
