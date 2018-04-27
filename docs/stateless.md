# 小程序无状态组件

在小程序中，无状态组件较为特殊，其使用方法和 react 无状态组件有所出入

```jsx
const First = ({ bar }) => {
    return <view>{bar}</view>
}
//这是一个简单的无状态组件
class Demo extends Page {
    state = {
        foo: 1
    }

    render() {
        return (
            <view>
                <First data="{{foo}}" />
                <First data="{{bar:'我是bar'}}" />
            </view>
        )
    }
}
```
