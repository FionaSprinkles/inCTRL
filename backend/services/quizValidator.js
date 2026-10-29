const { checkShortcutMatch } = require('../utils/keyboardUtils');

const BASE_POINTS = 100;
const GRACE_PERIOD_SECONDS = 3;
const MAX_DECAY_SECONDS = 20;
const MIN_TIME_FACTOR = 0.5;

const DIFFICULTY_MULTIPLIERS = {
    beginner: 1.0,
    easy: 1.0,
    intermediate: 1.25,
    advanced: 1.5,
    hard: 1.5
};

/**
 * Returns the difficulty multiplier for a given difficulty level.
 * Beginner/Easy = 1.0, Intermediate = 1.25, Advanced/Hard = 1.5.
 * @param {string} [difficulty='Beginner'] - Difficulty label.
 * @returns {number} Difficulty multiplier.
 */
function getDifficultyMultiplier(difficulty = 'Beginner') {
    const key = String(difficulty || 'Beginner').trim().toLowerCase();
    return DIFFICULTY_MULTIPLIERS[key] ?? 1.0;
}

/**
 * Computes the time decay factor using a grace period and linear decay down to a minimum floor.
 * Within GRACE_PERIOD_SECONDS (3s): 1.0 (full points).
 * Between GRACE_PERIOD_SECONDS (3s) and MAX_DECAY_SECONDS (20s): decays linearly from 1.0 to 0.5.
 * At or above MAX_DECAY_SECONDS (20s): 0.5 (minimum floor).
 * @param {number|null|undefined} timeSpentSeconds - Seconds spent on the question.
 * @returns {number} Time multiplier in [0.5, 1.0].
 */
function calculateTimeFactor(timeSpentSeconds) {
    if (timeSpentSeconds === undefined || timeSpentSeconds === null || typeof timeSpentSeconds !== 'number' || Number.isNaN(timeSpentSeconds)) {
        return 1.0;
    }
    const t = Math.max(0, timeSpentSeconds);
    if (t <= GRACE_PERIOD_SECONDS) {
        return 1.0;
    }
    if (t >= MAX_DECAY_SECONDS) {
        return MIN_TIME_FACTOR;
    }
    const progress = (t - GRACE_PERIOD_SECONDS) / (MAX_DECAY_SECONDS - GRACE_PERIOD_SECONDS);
    return 1.0 - (1.0 - MIN_TIME_FACTOR) * progress;
}

/**
 * Calculates the question score and maximum possible points based on accuracy, difficulty, and time spent.
 * @param {number} accuracyScore - Raw accuracy ratio in [0, 1].
 * @param {string} [difficulty='Beginner'] - Difficulty tier of the question or quiz.
 * @param {number|null} [timeSpentSeconds=null] - Time spent on the question in seconds.
 * @returns {{ points: number, maxPoints: number, difficultyMultiplier: number, timeFactor: number }}
 */
function calculateQuestionPoints(accuracyScore, difficulty = 'Beginner', timeSpentSeconds = null) {
    const difficultyMultiplier = getDifficultyMultiplier(difficulty);
    const maxPoints = Math.round(BASE_POINTS * difficultyMultiplier);
    const clampedAccuracy = Math.max(0, Math.min(1, Number(accuracyScore) || 0));

    if (clampedAccuracy <= 0) {
        return {
            points: 0,
            maxPoints,
            difficultyMultiplier,
            timeFactor: calculateTimeFactor(timeSpentSeconds)
        };
    }

    const timeFactor = calculateTimeFactor(timeSpentSeconds);
    const points = Math.round(maxPoints * clampedAccuracy * timeFactor);

    return {
        points,
        maxPoints,
        difficultyMultiplier,
        timeFactor
    };
}

/**
 * Normalizes client-submitted answers into a { [questionId]: userAnswer } object.
 * @param {object|Array} answers - Raw answers provided by the client.
 * @returns {Record<string, any>} Normalized dictionary mapping question IDs to answers.
 */

/**
 * Normalizes an individual key token (e.g. mapping browser arrow keys to display labels).
 * @param {any} k - Raw key token.
 * @returns {string} Lowercase normalized key name.
 */
function normalizeKeyToken(k) {
    const s = String(k).trim().toLowerCase();
    if (s === 'arrowup' || s === 'up' || s === 'up arrow') return 'up arrow';
    if (s === 'arrowdown' || s === 'down' || s === 'down arrow') return 'down arrow';
    if (s === 'arrowleft' || s === 'left' || s === 'left arrow') return 'left arrow';
    if (s === 'arrowright' || s === 'right' || s === 'right arrow') return 'right arrow';
    return s;
}

function normalizeAnswers(answers) {
    if (!answers || typeof answers !== 'object') {
        return {};
    }

    if (Array.isArray(answers)) {
        const normalized = {};
        for (const item of answers) {
            if (item && typeof item === 'object') {
                const qId = item.questionId || item.id;
                if (qId) {
                    normalized[qId] = item.answer !== undefined 
                        ? item.answer 
                        : (item.userAnswer !== undefined ? item.userAnswer : null);
                }
            }
        }
        return normalized;
    }

    return { ...answers };
}

/**
 * Validates a single user answer against stored question data.
 * @param {object} question - Question schema definition from database.
 * @param {any} userAnswer - Raw answer provided by the user.
 * @returns {{ isCorrect: boolean, score: number, maxScore: number, feedback: string }} Validation evaluation result.
 */
function validateAnswer(question, userAnswer) {
    if (!question || userAnswer === undefined || userAnswer === null) {
        return { isCorrect: false, score: 0, maxScore: 1, feedback: 'No answer provided' };
    }

    switch (question.type) {
        case 'single_choice': {
            const correctOpt = Array.isArray(question.options)
                ? question.options.find(o => o.isCorrect)
                : null;
            const isCorrect = userAnswer === correctOpt?.id;
            return {
                isCorrect,
                score: isCorrect ? 1 : 0,
                maxScore: 1,
                feedback: isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${correctOpt?.label || correctOpt?.text}`
            };
        }

        case 'multiple_choice': {
            const selected = Array.isArray(userAnswer) ? userAnswer : [];
            const correctIds = (question.options || []).filter(o => o.isCorrect).map(o => o.id);

            const hasAllCorrect = correctIds.every(id => selected.includes(id));
            const hasNoExtras = selected.every(id => correctIds.includes(id));
            const isCorrect = hasAllCorrect && hasNoExtras && selected.length > 0;

            const correctSelectedCount = selected.filter(id => correctIds.includes(id)).length;
            const incorrectSelectedCount = selected.filter(id => !correctIds.includes(id)).length;
            const score = isCorrect
                ? 1
                : (correctIds.length > 0
                    ? Math.max(0, Math.round(((correctSelectedCount - incorrectSelectedCount) / correctIds.length) * 100) / 100)
                    : 0);

            return {
                isCorrect,
                score,
                maxScore: 1,
                feedback: isCorrect
                    ? 'Great job! You identified all correct shortcuts.'
                    : `Not quite. Expected: ${question.options.filter(o => o.isCorrect).map(o => o.label || o.text).join(', ')}`
            };
        }

        case 'fill_blank': {
            const text = typeof userAnswer === 'string' ? userAnswer : '';
            const accepted = Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.length > 0
                ? question.acceptedAnswers
                : (question.canonicalAnswer ? [question.canonicalAnswer] : []);
            const isCorrect = checkShortcutMatch(text, accepted);
            return {
                isCorrect,
                score: isCorrect ? 1 : 0,
                maxScore: 1,
                feedback: isCorrect
                    ? 'Spot on! Correct shortcut.'
                    : `Incorrect. The accepted answer is: ${question.canonicalAnswer}`
            };
        }

        case 'key_builder': {
            const keys = Array.isArray(userAnswer) ? userAnswer : [];
            const target = question.targetCombo || (question.payload && question.payload.targetCombo) || [];
            const orderMatters = question.orderMatters ?? (question.payload && question.payload.orderMatters) ?? false;

            let isCorrect = false;
            if (orderMatters) {
                isCorrect = keys.length === target.length && keys.every((k, i) => normalizeKeyToken(k) === normalizeKeyToken(target[i]));
            } else {
                const sortedUser = [...keys].map(normalizeKeyToken).sort();
                const sortedTarget = [...target].map(normalizeKeyToken).sort();
                isCorrect = sortedUser.length === sortedTarget.length && sortedUser.every((k, i) => k === sortedTarget[i]);
            }

            return {
                isCorrect,
                score: isCorrect ? 1 : 0,
                maxScore: 1,
                feedback: isCorrect
                    ? 'Combination built perfectly!'
                    : `Incorrect combo. Target: ${target.join(' + ')}`
            };
        }

        case 'matching': {
            let normalizedAnswer = userAnswer;
            if (Array.isArray(userAnswer)) {
                normalizedAnswer = {};
                userAnswer.forEach(item => {
                    if (item && item.leftId !== undefined && item.rightId !== undefined) {
                        normalizedAnswer[item.leftId] = item.rightId;
                    }
                });
            }

            const pairs = question.pairs || [];
            let correctMatches = 0;

            pairs.forEach(pair => {
                if (normalizedAnswer && String(normalizedAnswer[pair.id]) === String(pair.id)) {
                    correctMatches++;
                }
            });

            const isCorrect = pairs.length > 0 && correctMatches === pairs.length;
            const score = pairs.length > 0 ? Math.round((correctMatches / pairs.length) * 100) / 100 : 0;

            return {
                isCorrect,
                score,
                maxScore: 1,
                feedback: isCorrect
                    ? 'All pairs matched successfully!'
                    : `You matched ${correctMatches} out of ${pairs.length} pairs correctly.`
            };
        }

        case 'ordering': {
            const userOrder = Array.isArray(userAnswer) ? userAnswer : [];
            const correctOrder = question.correctOrder || [];

            const isCorrect =
                userOrder.length === correctOrder.length &&
                userOrder.every((id, idx) => id === correctOrder[idx]);

            return {
                isCorrect,
                score: isCorrect ? 1 : 0,
                maxScore: 1,
                feedback: isCorrect
                    ? 'Steps ordered in the correct sequence!'
                    : 'The order is not quite right. Check the sequence and try again.'
            };
        }

        case 'true_false': {
            const isCorrect = typeof userAnswer === 'boolean' && userAnswer === question.correctAnswer;
            return {
                isCorrect,
                score: isCorrect ? 1 : 0,
                maxScore: 1,
                feedback: isCorrect
                    ? `Correct! The statement is ${question.correctAnswer ? 'True' : 'False'}.`
                    : `Incorrect. The statement is actually ${question.correctAnswer ? 'True' : 'False'}.`
            };
        }

        case 'live_press': {
            const pressed = Array.isArray(userAnswer) ? userAnswer : [];
            const target = question.targetKeys || (question.payload && question.payload.targetKeys) || [];

            const normPressed = pressed.map(normalizeKeyToken).sort();
            const normTarget = target.map(normalizeKeyToken).sort();

            const isCorrect =
                normPressed.length === normTarget.length &&
                normPressed.every((k, idx) => k === normTarget[idx]);

            return {
                isCorrect,
                score: isCorrect ? 1 : 0,
                maxScore: 1,
                feedback: isCorrect
                    ? `Keyboard combo captured! (${question.displayCombo})`
                    : `Combination did not match. Target was: ${question.displayCombo}`
            };
        }

        case 'odd_one_out': {
            const isCorrect = String(userAnswer) === String(question.imposterId);
            return {
                isCorrect,
                score: isCorrect ? 1 : 0,
                maxScore: 1,
                feedback: isCorrect
                    ? `Well spotted! ${question.imposterReason}`
                    : `Incorrect. ${question.imposterReason}`
            };
        }

        default:
            return {
                isCorrect: false,
                score: 0,
                maxScore: 1,
                feedback: `Unknown question type: ${question.type}`
            };
    }
}

module.exports = {
    BASE_POINTS,
    GRACE_PERIOD_SECONDS,
    MAX_DECAY_SECONDS,
    MIN_TIME_FACTOR,
    getDifficultyMultiplier,
    calculateTimeFactor,
    calculateQuestionPoints,
    normalizeAnswers,
    validateAnswer
};
