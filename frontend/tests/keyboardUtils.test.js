import { describe, it } from 'node:test'
import assert from 'node:assert'
import { normalizeShortcutString, checkShortcutMatch, getKeyLabelFromEvent } from '../src/utils/keyboardUtils.js'

describe('frontend keyboardUtils', () => {
  it('normalizes shortcuts', () => {
    assert.strictEqual(normalizeShortcutString('Windows + L'), 'win+l')
    assert.strictEqual(normalizeShortcutString('Ctrl - c'), 'ctrl+c')
    assert.strictEqual(normalizeShortcutString('Alternate + Escape'), 'alt+esc')
    assert.strictEqual(normalizeShortcutString('Delete  PrintScreen'), 'del+prtscn')
    assert.strictEqual(normalizeShortcutString('Shift + ArrowDown'), 'shift+down+arrow')
    assert.strictEqual(normalizeShortcutString('ArrowUp + ArrowLeft + ArrowRight'), 'up+arrow+left+arrow+right+arrow')
    assert.strictEqual(normalizeShortcutString(''), '')
    assert.strictEqual(normalizeShortcutString(null), '')
  })

  it('checks shortcut match', () => {
    assert.strictEqual(checkShortcutMatch('ctrl+c', ['Ctrl+C']), true)
    assert.strictEqual(checkShortcutMatch('c+ctrl', ['ctrl+c']), true)
    assert.strictEqual(checkShortcutMatch('win+e', ['ctrl+c']), false)
    assert.strictEqual(checkShortcutMatch('', ['ctrl+c']), false)
    assert.strictEqual(checkShortcutMatch('Shift + ArrowDown', ['Shift + Down Arrow']), true)
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
    assert.strictEqual(getKeyLabelFromEvent({ key: 'ArrowUp' }), 'Up Arrow')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'ArrowDown' }), 'Down Arrow')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'ArrowLeft' }), 'Left Arrow')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'ArrowRight' }), 'Right Arrow')
    assert.strictEqual(getKeyLabelFromEvent({ key: 'F5' }), 'F5')
  })
})
