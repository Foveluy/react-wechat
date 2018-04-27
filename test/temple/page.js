import First from './outside'

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
        <view>你好 react-wechat</view>
        <First />
        <Second />
      </view>
    )
  }
}
