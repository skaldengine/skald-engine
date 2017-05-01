describe('sk/utils/enumeration.js', () => {
  let enumeration = require('./enumeration.js').default

  it('should create correctly', () => {
    let result = enumeration({
      key: 'value',
      num: 3
    })

    assert.equal(result.key, 'value')
    assert.equal(result.num, 3)
    assert.equal(result('value'), 'key')
    assert.equal(result(3), 'num')
    assert.isNotExtensible(result)
  })

  it('should return a list of values', () => {
    let result = enumeration({
      key: 'value',
      num: 3
    })

    assert.deepEqual(result.values(), ['value', 3])
  })
})