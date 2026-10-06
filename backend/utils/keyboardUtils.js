/**
 * Utility functions for keyboard shortcut normalization and parsing on the backend.
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
 * Checks whether user input matches any accepted shortcut variation.
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
