
Component({
  methods: {
    onSwiperChange: function (e) {
      this.triggerEvent('swiperchange', e.detail);
    }
  },
  data: {
    current: 0
  },
  properties: {
    propsFoo: String,
    source: Array
  }
})