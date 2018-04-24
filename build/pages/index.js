import { Page } from '../wechat';

class Index extends Page {
  data = {
    foo: [1, 3, 4, 5]
  };

  check() {
    this.setData({
      foo: '213'
    });
  }

  onTaps() {
    this.setData({
      foo: '213'
    });
  }

  render() {
    const {
      foo
    } = this.state;
    return <div style={() => ({
      black: 'black',
      width: '132'
    })}>
        <view>asdas</view>
      </div>;
  }

}