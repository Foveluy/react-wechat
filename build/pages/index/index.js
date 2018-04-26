
// import { createStore } from 'redux';
const { createStore } = require('../../nodeModules/redux/es/redux.js')
const i = 'shit';
Page({
  data: {
    foo: 1
  },
  check: function () {
    const a = i + 'hahah';
    this.setData({
      foo: '213'
    });
  },
  onTaps: function () {
    this.setData({
      foo: this.data.foo + 1
    });
  }
})