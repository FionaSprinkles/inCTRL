const { describe, it } = require('node:test');
const assert = require('node:assert');
const { normalizeShortcutString, checkShortcutMatch } = require('../utils/keyboardUtils');

describe('backend/utils/keyboardUtils', () => {
    describe('normalizeShortcutString', () => {
        it('returns empty string for falsy or non-string input', () => {
            assert.strictEqual(normalizeShortcutString(null), '');
            assert.strictEqual(normalizeShortcutString(undefined), '');
            assert.strictEqual(normalizeShortcutString(''), '');
            assert.strictEqual(normalizeShortcutString(123), '');
            assert.strictEqual(normalizeShortcutString({}), '');
        });

        it('normalizes key names and aliases', () => {
            assert.strictEqual(normalizeShortcutString('Windows + L'), 'win+l');
            assert.strictEqual(normalizeShortcutString('Control + c'), 'ctrl+c');
            assert.strictEqual(normalizeShortcutString('Alternate + Tab'), 'alt+tab');
            assert.strictEqual(normalizeShortcutString('Escape'), 'esc');
            assert.strictEqual(normalizeShortcutString('Delete'), 'del');
            assert.strictEqual(normalizeShortcutString('PrintScreen'), 'prtscn');
        });

        it('normalizes various separators (plus, dash, spaces)', () => {
            assert.strictEqual(normalizeShortcutString('ctrl - shift - esc'), 'ctrl+shift+esc');
            assert.strictEqual(normalizeShortcutString('win r'), 'win+r');
            assert.strictEqual(normalizeShortcutString('  ctrl   +   alt   +   del  '), 'ctrl+alt+del');
        });
    });

    describe('checkShortcutMatch', () => {
        it('returns false for empty or invalid user input', () => {
            assert.strictEqual(checkShortcutMatch('', ['ctrl+c']), false);
            assert.strictEqual(checkShortcutMatch(null, ['ctrl+c']), false);
            assert.strictEqual(checkShortcutMatch(undefined, ['ctrl+c']), false);
        });

        it('returns false when accepted list is empty or omitted', () => {
            assert.strictEqual(checkShortcutMatch('ctrl+c'), false);
            assert.strictEqual(checkShortcutMatch('ctrl+c', []), false);
        });

        it('matches identical shortcuts and token permutations', () => {
            assert.strictEqual(checkShortcutMatch('Ctrl+C', ['ctrl+c']), true);
            assert.strictEqual(checkShortcutMatch('c + ctrl', ['ctrl+c']), true);
            assert.strictEqual(checkShortcutMatch('Windows + Shift + S', ['win+shift+s']), true);
            assert.strictEqual(checkShortcutMatch('s + win + shift', ['win+shift+s']), true);
        });

        it('returns false when no variation matches', () => {
            assert.strictEqual(checkShortcutMatch('ctrl+v', ['ctrl+c', 'ctrl+x']), false);
        });
    });
});
