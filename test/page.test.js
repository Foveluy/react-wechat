const { transform } = require('../lib/convert')
const assert = require('power-assert')
const fs = require('fs-extra')
const path = require('path')
const logger = require('../lib/logger')

const p = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve('./test/temple/page.js'), (err, src) => {
            if (!err) {
                resolve(src.toString())
            } else {
                reject(err)
            }
        })
    })
}

describe('Page.js.test wxml', function() {
    var output = {}
    before(async () => {
        output = await p()
        output = transform(output, 'filePath', 'destPath', [], 'ouput')
    })

    it('jsx 变量 {foo} => {{foo}}', done => {
        const r = new RegExp('<view> {{foo}} </view>')
        assert.equal(r.test(output.wxml), true)

        done()
    })

    it('能够生成模版，并且名字正确', done => {
        const r = new RegExp('<template name="Second">')
        assert.equal(r.test(output.wxml), true)

        done()
    })

    it('使用模版时，能够正确编译', done => {
        const r = new RegExp('<template is="Second" />')
        assert.equal(r.test(output.wxml), true)
        done()
    })

    it('引用外部模版时，能够正确编译，并且删除import', done => {
        const r = new RegExp('<import src="./outside.wxml" />')
        const r2 = new RegExp("import First from './outside'")
        const r3 = new RegExp('<template is="First" />')
        assert.equal(r.test(output.wxml), true)
        assert.equal(r2.test(output.wxml), false)
        assert.equal(r3.test(output.wxml), true)
        done()
    })

    it('连续相加字符串能够成功 width:{{foo+1-3-4+2+foo}}px;', done => {
        assert.equal(/{{foo\+1-3-4\+2\+foo}}px/.test(output.wxml), true)
        done()
    })

    it('字符串中{{}} background:rgba({{bar}},3,3,1);', done => {
        console.log(output.wxml)
        assert.equal(/background:rgba\({{bar}},3,3,1\);/.test(output.wxml), true)
        done()
    })

    it('字符串中 做加法 rgba({{foo+100}},3,3,1)', done => {
        assert.equal(/rgba\({{foo\+100}},3,3,1\)/.test(output.wxml), true)
        done()
    })

    it('页面内箭头函数的无状态函数', done => {
        const index = output.wxml.indexOf('<view> Third无状态组件 </view>')
        assert.equal(index >= 0, true)
        done()
    })
})
