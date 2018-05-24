import { Page } from '../../wechat'
import Tabs from '../../components/tabs/tabs'

export default class Demo extends Page {
    window = {
        navigationBarTitleText: 'React Wechat',
        navigationBarBackgroundColor: '#282c34',
        navigationBarTextStyle: 'white'
    }

    onLoad() {}

    onSwiperChange(e) {
        console.log(e.detail.current, e.detail.source)
    }

    render() {
        return (
            <view class="container">
                <Tabs bindswiperchange={this.onSwiperChange} source={[1, 2, 3, 4]} />
            </view>
        )
    }
}
