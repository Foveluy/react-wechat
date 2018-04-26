
Component({
  methods: {
    fucking: function (e) {
      this.setData({
        foo: 'bar Clicked'
      });
    }
  },
  data: {
    foo: 'bar'
  },
  properties: {
    propsFoo: String
  }
})