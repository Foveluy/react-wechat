import { Component } from '../../wechat'

export default class Tabs extends Component {
    state = {
        current: 0
    }
    props = {
        propsFoo: String,
        source: Array
    }

    onSwiperChange(e) {
        this.triggerEvent('swiperchange', e.detail)
    }

    render() {
        return (
            <view>
                <view class="rw-design-swiper-container">
                    {source.map((item, i) => {
                        return <view key={i}>{i}</view>
                    })}
                </view>
                <swiper bindchange={this.onSwiperChange}>
                    <swiper-item>
                        <view class="rw-design-swiper-item">213</view>
                    </swiper-item>
                    <swiper-item>
                        <view class="rw-design-swiper-item">213</view>
                    </swiper-item>
                    <swiper-item>
                        <view class="rw-design-swiper-item">213</view>
                    </swiper-item>
                </swiper>
            </view>
        )
    }
}
