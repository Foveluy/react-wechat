import { Component } from '../../wechat'

export default class Foo extends Component {
  state = {
    foo: 'bar'
  }
  props = {
    propsFoo: String
  }

  fucking(e) {
    this.setState({
      foo: 'bar Clicked'
    })
  }
  render() {
    return (
      <view bindTap={this.fucking}>
        <view>{foo}</view>
        <view>I am Component</view>
        <view>{propsFoo}</view>
        {children}
      </view>
    )
  }
}
