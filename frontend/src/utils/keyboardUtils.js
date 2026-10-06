/**
 * Utility functions for keyboard shortcut normalization and parsing.
 */

/**
 * Normalizes a shortcut string into standard lowercase plus-separated tokens.
 * @param {string} input - Raw shortcut string.
 * @returns {string} Normalized string with lowercase tokens separated by plus signs.
 */
export function normalizeShortcutString(input) {
  if (!input || typeof input !== 'string') return ''

  return input
    .trim()
    .toLowerCase()
    .replace(/\bwindows\b/g, 'win')
    .replace(/\bcontrol\b/g, 'ctrl')
    .replace(/\balternate\b/g, 'alt')
    .replace(/\bescape\b/g, 'esc')
    .replace(/\bdelete\b/g, 'del')
    .replace(/\bprintscreen\b/g, 'prtscn')
    .replace(/\s*\+\s*/g, '+')
    .replace(/\s*-\s*/g, '+')
    .replace(/\s+/g, '+')
}

/**
 * Checks whether user input matches any accepted shortcut variation.
 * @param {string} userInput - Shortcut combination submitted by user.
 * @param {Array<string>} acceptedList - List of accepted shortcut combinations.
 * @returns {boolean} True if input matches any accepted shortcut.
 */
export function checkShortcutMatch(userInput, acceptedList) {
  const normUser = normalizeShortcutString(userInput)
  if (!normUser) return false

  // Break user input into set of tokens
  const userTokens = normUser.split('+').sort().join('+')

  for (const acc of acceptedList) {
    const normAcc = normalizeShortcutString(acc)
    const accTokens = normAcc.split('+').sort().join('+')
    if (normUser === normAcc || userTokens === accTokens) {
      return true
    }
  }

  return false
}

/**
 * Translates a KeyboardEvent into a normalized key name representation.
 * @param {KeyboardEvent} e - Native browser keyboard event.
 * @returns {string} Standardized key label (e.g. 'Ctrl', 'Win', 'Esc').
 */
export function getKeyLabelFromEvent(e) {
  if (e.key === 'Control') return 'Ctrl'
  if (e.key === 'Shift') return 'Shift'
  if (e.key === 'Alt') return 'Alt'
  if (e.key === 'Meta' || e.key === 'OS') return 'Win'
  if (e.key === 'Escape') return 'Esc'
  if (e.key === 'Delete') return 'Del'
  if (e.key === ' ') return 'Space'
  if (e.key.length === 1) return e.key.toUpperCase()
  return e.key
}
