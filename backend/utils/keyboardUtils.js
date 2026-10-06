/**
 * Utility functions for keyboard shortcut normalization and parsing on the backend.
 */

/**
 * Normalizes a shortcut string into standard lowercase plus-separated tokens.
 * @param {string} input - Raw shortcut string (e.g. "Windows + L" or "ctrl-c").
 * @returns {string} Normalized string with lowercase tokens separated by plus signs.
 */
function normalizeShortcutString(input) {
    if (!input || typeof input !== 'string') return '';

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
        .replace(/\s+/g, '+');
}

/**
 * Checks whether user input matches any accepted shortcut variation regardless of key order.
 * @param {string} userInput - Shortcut combination submitted by user.
 * @param {Array<string>} [acceptedList=[]] - List of accepted shortcut variations.
 * @returns {boolean} True if user input matches any accepted shortcut variation.
 */
function checkShortcutMatch(userInput, acceptedList = []) {
    const normUser = normalizeShortcutString(userInput);
    if (!normUser) return false;

    // Break user input into sorted tokens
    const userTokens = normUser.split('+').sort().join('+');

    for (const acc of acceptedList) {
        const normAcc = normalizeShortcutString(acc);
        const accTokens = normAcc.split('+').sort().join('+');
        if (normUser === normAcc || userTokens === accTokens) {
            return true;
        }
    }

    return false;
}

module.exports = {
    normalizeShortcutString,
    checkShortcutMatch
};
