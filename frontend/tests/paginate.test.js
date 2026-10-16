import { describe, it } from 'node:test'
import assert from 'node:assert'
import { paginate } from '../src/utils/paginate.js'

describe('paginate', () => {
  const items = ['a', 'b', 'c', 'd', 'e']

  it('returns the first page', () => {
    const result = paginate(items, 1, 2)
    assert.deepStrictEqual(result.items, ['a', 'b'])
    assert.strictEqual(result.page, 1)
    assert.strictEqual(result.pageCount, 3)
    assert.strictEqual(result.total, 5)
  })

  it('returns a short last page', () => {
    const result = paginate(items, 3, 2)
    assert.deepStrictEqual(result.items, ['e'])
    assert.strictEqual(result.page, 3)
  })

  it('clamps a page past the end', () => {
    const result = paginate(items, 9, 2)
    assert.strictEqual(result.page, 3)
    assert.deepStrictEqual(result.items, ['e'])
  })

  it('clamps a page below 1 and ignores a bad page size', () => {
    const result = paginate(items, 0, 0)
    assert.strictEqual(result.page, 1)
    assert.strictEqual(result.pageCount, 5)
    assert.deepStrictEqual(result.items, ['a'])
  })

  it('treats an empty or invalid list as one empty page', () => {
    assert.deepStrictEqual(paginate([], 1, 10), {
      page: 1,
      pageCount: 1,
      total: 0,
      items: [],
    })
    assert.deepStrictEqual(paginate(null, 1, 10).items, [])
  })
})
