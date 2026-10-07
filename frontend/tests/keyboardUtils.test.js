import { describe, it } from 'node:test'
import assert from 'node:assert'
import { normalizeShortcutString, checkShortcutMatch, getKeyLabelFromEvent } from '../src/utils/keyboardUtils.js'

describe('frontend keyboardUtils', () => {
  it('normalizes shortcuts', () => {
    assert.strictEqual(normalizeShortcutString('Windows + L'), 'win+l')
    assert.strictEqual(normalizeShortcutString('Ctrl - c'), 'ctrl+c')
    assert.strictEqual(normalizeShortcutString('Alternate + Escape'), 'alt+esc')
    assert.strictEqual(normalizeShortcutString('Delete  PrintScreen'), 'del+prtscn')
    assert.strictEqual(normalizeShortcutString(''), '')
    assert.strictEqual(normalizeShortcutString(null), '')
  })

  it('checks shortcut match', () => {
    assert.strictEqual(checkShortcutMatch('ctrl+c', ['Ctrl+C']), true)
    assert.strictEqual(checkShortcutMatch('c+ctrl', ['ctrl+c']), true)
    assert.strictEqual(checkShortcutMatch('win+e', ['ctrl+c']), false)
    assert.strictEqual(checkShortcutMatch('', ['ctrl+c']), false)
  })

  it('translates keyboard events', () => {
    assert.strictEqual(getKeyLabelFromEvent({ key: 'Control' }), 'Ctrl')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'Shift' }), 'Shift')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'Alt' }), 'Alt')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'Meta' }), 'Win')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'OS' }), 'Win')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'Escape' }), 'Esc')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'Delete' }), 'Del')
    assert.strictEqual(getKeyLabelFromEvent({ key: ' ' }), 'Space')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'a' }), 'A')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'ArrowUp' }), 'ArrowUp')
  })
})
