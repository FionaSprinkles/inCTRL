const { checkShortcutMatch } = require('../utils/keyboardUtils');

/**
 * Normalizes client-submitted answers into a { [questionId]: userAnswer } object.
 */
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
 * Returns: { isCorrect: boolean, score: number, maxScore: number, feedback: string }
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
            const target = question.targetCombo || [];

            let isCorrect = false;
            if (question.orderMatters) {
                isCorrect = keys.length === target.length && keys.every((k, i) => String(k).toLowerCase() === String(target[i]).toLowerCase());
            } else {
                const sortedUser = [...keys].map(k => String(k).toLowerCase()).sort();
                const sortedTarget = [...target].map(k => String(k).toLowerCase()).sort();
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
            const isCorrect = Boolean(userAnswer) === Boolean(question.correctAnswer);
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
            const target = question.targetKeys || [];

            const normPressed = pressed.map(k => String(k).toLowerCase()).sort();
            const normTarget = target.map(k => String(k).toLowerCase()).sort();

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
    normalizeAnswers,
    validateAnswer
};
