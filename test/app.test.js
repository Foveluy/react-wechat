const { transform } = require('../lib/convert')
const assert = require('power-assert')
const fs = require('fs-extra')
const path = require('path')
const logger = require('../lib/logger')

const p = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve('./test/temple/app.js'), (err, src) => {
      if (!err) {
        resolve(src.toString())
      } else {
        reject(err)
      }
    })
  })
}

describe('App.js.test', function() {
  var output = {}
  before(async () => {
    output = await p()
    output = transform(output, 'filePath', 'destPath', [], 'ouput')
  })

  it('写在类外部的 箭头函数 依然会被编译', done => {
    assert.equal(/const reducer = state =>/.test(output.js), true)
    done()
  })

  it('写在类外部的 function 依然会被编译', done => {
    assert.equal(/function shit\(foo\)/.test(output.js), true)
    done()
  })
  it('将 window 抽离出来到 json / 测试 json中的属性', done => {
    const r = new RegExp(output.json)
    assert.equal(r.test(output.js), false)
    assert.equal(/window/.test(output.json), true)
    assert.equal(/pages/.test(output.json), true)
    
    done()
  })
  it('生成 react_wechat_obj',(done)=>{
    assert.equal(/App\(react_wechat_obj\)/.test(output.js), true)
    done()

  })
  it('生成 onLoad 方法，重写 onLoad',(done)=>{
    assert.equal(/const onLoad = react_wechat_obj.onLoad/.test(output.js), true)
    done()
    // console.log(output.js)
  })
  it('测试 logger 方法',(done)=>{
    // assert.equal(/const onLoad = react_wechat_obj.onLoad/.test(output.js), true)
    logger.warn('警告')
    logger.error('错误')
    logger.greate('正常')
    done()
  })


})

