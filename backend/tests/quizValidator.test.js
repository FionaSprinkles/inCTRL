const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
    normalizeAnswers,
    validateAnswer,
    getDifficultyMultiplier,
    calculateTimeFactor,
    calculateQuestionPoints
} = require('../services/quizValidator');

describe('backend/services/quizValidator', () => {
    describe('normalizeAnswers', () => {
        it('handles null, undefined, and non-object inputs', () => {
            assert.deepStrictEqual(normalizeAnswers(null), {});
            assert.deepStrictEqual(normalizeAnswers(undefined), {});
            assert.deepStrictEqual(normalizeAnswers('invalid'), {});
            assert.deepStrictEqual(normalizeAnswers(123), {});
        });

        it('normalizes object inputs', () => {
            const input = { q1: 'a', q2: 'b' };
            assert.deepStrictEqual(normalizeAnswers(input), input);
        });

        it('normalizes array of answer objects with questionId/id and answer/userAnswer', () => {
            const arr = [
                { questionId: 'q1', answer: 'win+l' },
                { id: 'q2', userAnswer: 'ctrl+c' },
                { id: 'q3' }, // missing answer
                null,
                'invalid-entry'
            ];
            assert.deepStrictEqual(normalizeAnswers(arr), {
                q1: 'win+l',
                q2: 'ctrl+c',
                q3: null
            });
        });
    });

    describe('validateAnswer - base guards', () => {
        it('returns false when question is missing or userAnswer is null/undefined', () => {
            assert.deepStrictEqual(validateAnswer(null, 'test'), {
                isCorrect: false,
                score: 0,
                maxScore: 1,
                feedback: 'No answer provided'
            });
            assert.deepStrictEqual(validateAnswer({ type: 'single_choice' }, null), {
                isCorrect: false,
                score: 0,
                maxScore: 1,
                feedback: 'No answer provided'
            });
            assert.deepStrictEqual(validateAnswer({ type: 'single_choice' }, undefined), {
                isCorrect: false,
                score: 0,
                maxScore: 1,
                feedback: 'No answer provided'
            });
        });

        it('returns error result for unknown question type', () => {
            const res = validateAnswer({ type: 'unsupported_type' }, 'answer');
            assert.strictEqual(res.isCorrect, false);
            assert.strictEqual(res.feedback, 'Unknown question type: unsupported_type');
        });
    });

    describe('validateAnswer - single_choice', () => {
        const q = {
            type: 'single_choice',
            options: [
                { id: 'opt1', text: 'Ctrl + C', isCorrect: false },
                { id: 'opt2', text: 'Ctrl + V', isCorrect: true }
            ]
        };

        it('validates correct answer', () => {
            const res = validateAnswer(q, 'opt2');
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
            assert.strictEqual(res.feedback, 'Correct!');
        });

        it('validates incorrect answer with fallback text', () => {
            const res = validateAnswer(q, 'opt1');
            assert.strictEqual(res.isCorrect, false);
            assert.strictEqual(res.score, 0);
            assert.ok(res.feedback.includes('Ctrl + V'));
        });

        it('handles question without options array', () => {
            const res = validateAnswer({ type: 'single_choice' }, 'opt1');
            assert.strictEqual(res.isCorrect, false);
        });
    });

    describe('validateAnswer - multiple_choice', () => {
        const q = {
            type: 'multiple_choice',
            options: [
                { id: 'opt1', label: 'Ctrl + C', isCorrect: true },
                { id: 'opt2', label: 'Ctrl + V', isCorrect: true },
                { id: 'opt3', label: 'Ctrl + X', isCorrect: false }
            ]
        };

        it('awards full points for completely correct selection', () => {
            const res = validateAnswer(q, ['opt1', 'opt2']);
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
            assert.strictEqual(res.feedback, 'Great job! You identified all correct shortcuts.');
        });

        it('computes partial score when some correct options are selected without wrong ones', () => {
            const res = validateAnswer(q, ['opt1']);
            assert.strictEqual(res.isCorrect, false);
            assert.strictEqual(res.score, 0.5);
            assert.ok(res.feedback.includes('Not quite. Expected:'));
        });

        it('penalizes incorrect selections and caps minimum score at 0', () => {
            const res = validateAnswer(q, ['opt3']);
            assert.strictEqual(res.isCorrect, false);
            assert.strictEqual(res.score, 0);
        });

        it('handles non-array answers and questions with empty options', () => {
            const res = validateAnswer(q, 'opt1');
            assert.strictEqual(res.isCorrect, false);

            const resEmpty = validateAnswer({ type: 'multiple_choice', options: [] }, ['opt1']);
            assert.strictEqual(resEmpty.isCorrect, false);
            assert.strictEqual(resEmpty.score, 0);
        });
    });

    describe('validateAnswer - fill_blank', () => {
        const qWithList = {
            type: 'fill_blank',
            acceptedAnswers: ['win+l', 'windows+l'],
            canonicalAnswer: 'Win + L'
        };

        const qWithCanonicalOnly = {
            type: 'fill_blank',
            canonicalAnswer: 'Ctrl + C'
        };

        it('validates against acceptedAnswers list', () => {
            const res = validateAnswer(qWithList, 'Windows + L');
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
            assert.strictEqual(res.feedback, 'Spot on! Correct shortcut.');
        });

        it('validates against canonicalAnswer fallback when acceptedAnswers is missing', () => {
            const res = validateAnswer(qWithCanonicalOnly, 'ctrl+c');
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
        });

        it('rejects incorrect shortcut string or non-string input', () => {
            const res = validateAnswer(qWithList, 'ctrl+z');
            assert.strictEqual(res.isCorrect, false);
            assert.ok(res.feedback.includes('Win + L'));

            const resNonString = validateAnswer(qWithList, 123);
            assert.strictEqual(resNonString.isCorrect, false);
        });

        it('handles question without acceptedAnswers and canonicalAnswer', () => {
            const res = validateAnswer({ type: 'fill_blank' }, 'anything');
            assert.strictEqual(res.isCorrect, false);
        });
    });

    describe('validateAnswer - key_builder', () => {
        const qUnordered = {
            type: 'key_builder',
            targetCombo: ['Ctrl', 'Shift', 'Esc'],
            orderMatters: false
        };

        const qOrdered = {
            type: 'key_builder',
            targetCombo: ['Alt', 'Tab'],
            orderMatters: true
        };

        it('validates unordered target combination successfully', () => {
            const res = validateAnswer(qUnordered, ['esc', 'ctrl', 'shift']);
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
            assert.strictEqual(res.feedback, 'Combination built perfectly!');
        });

        it('rejects incorrect unordered combination', () => {
            const res = validateAnswer(qUnordered, ['ctrl', 'esc']);
            assert.strictEqual(res.isCorrect, false);
            assert.ok(res.feedback.includes('Ctrl + Shift + Esc'));
        });

        it('validates ordered target combination successfully', () => {
            const res = validateAnswer(qOrdered, ['Alt', 'Tab']);
            assert.strictEqual(res.isCorrect, true);
        });

        it('rejects reversed ordered combination', () => {
            const res = validateAnswer(qOrdered, ['Tab', 'Alt']);
            assert.strictEqual(res.isCorrect, false);
        });

        it('handles non-array user answers', () => {
            const res = validateAnswer(qUnordered, 'ctrl+alt');
            assert.strictEqual(res.isCorrect, false);
        });

        it('normalizes browser ArrowDown/ArrowUp/ArrowLeft/ArrowRight in key_builder', () => {
            const arrowQ = {
                type: 'key_builder',
                targetCombo: ['Alt', 'Up Arrow'],
                orderMatters: false
            };
            const res = validateAnswer(arrowQ, ['Alt', 'ArrowUp']);
            assert.strictEqual(res.isCorrect, true);

            const arrowOrdered = {
                type: 'key_builder',
                targetCombo: ['Shift', 'Down Arrow'],
                orderMatters: true
            };
            const resOrdered = validateAnswer(arrowOrdered, ['Shift', 'ArrowDown']);
            assert.strictEqual(resOrdered.isCorrect, true);
        });

        it('normalizes short arrow targets such as Left in key_builder (e.g. q-txt2-033)', () => {
            const textEditingQuestions = require('../data/quizQuestions/textEditingPart2.json');
            const qTxt2033 = textEditingQuestions.find(q => q.id === 'q-txt2-033');
            assert.ok(qTxt2033, 'Question q-txt2-033 must exist in seeded data');

            const res = validateAnswer(qTxt2033, ['Shift', 'Ctrl', 'ArrowLeft']);
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);

            const resVirtual = validateAnswer(qTxt2033, ['Shift', 'Ctrl', 'Left']);
            assert.strictEqual(resVirtual.isCorrect, true);

            const resDisplay = validateAnswer(qTxt2033, ['Shift', 'Ctrl', 'Left Arrow']);
            assert.strictEqual(resDisplay.isCorrect, true);
        });
    });

    describe('validateAnswer - matching', () => {
        const q = {
            type: 'matching',
            pairs: [
                { id: '1', leftText: 'Copy', rightText: 'Ctrl+C' },
                { id: '2', leftText: 'Paste', rightText: 'Ctrl+V' }
            ]
        };

        it('validates matching pairs from dictionary object', () => {
            const res = validateAnswer(q, { 1: 1, 2: 2 });
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
            assert.strictEqual(res.feedback, 'All pairs matched successfully!');
        });

        it('validates matching pairs from array of pairs', () => {
            const res = validateAnswer(q, [
                { leftId: '1', rightId: '1' },
                { leftId: '2', rightId: '2' },
                null
            ]);
            assert.strictEqual(res.isCorrect, true);
        });

        it('evaluates partial matching score', () => {
            const res = validateAnswer(q, { 1: 1, 2: 'wrong' });
            assert.strictEqual(res.isCorrect, false);
            assert.strictEqual(res.score, 0.5);
            assert.strictEqual(res.feedback, 'You matched 1 out of 2 pairs correctly.');
        });

        it('handles question with empty pairs', () => {
            const res = validateAnswer({ type: 'matching', pairs: [] }, {});
            assert.strictEqual(res.isCorrect, false);
            assert.strictEqual(res.score, 0);
        });
    });

    describe('validateAnswer - ordering', () => {
        const q = {
            type: 'ordering',
            correctOrder: ['step1', 'step2', 'step3']
        };

        it('validates correct sequence', () => {
            const res = validateAnswer(q, ['step1', 'step2', 'step3']);
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
            assert.strictEqual(res.feedback, 'Steps ordered in the correct sequence!');
        });

        it('rejects incorrect sequence', () => {
            const res = validateAnswer(q, ['step2', 'step1', 'step3']);
            assert.strictEqual(res.isCorrect, false);
            assert.strictEqual(res.score, 0);
        });

        it('handles non-array user answers', () => {
            const res = validateAnswer(q, null);
            assert.strictEqual(res.isCorrect, false);
        });
    });

    describe('validateAnswer - true_false', () => {
        const q = {
            type: 'true_false',
            correctAnswer: true
        };

        it('validates correct boolean answer', () => {
            const res = validateAnswer(q, true);
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
            assert.strictEqual(res.feedback, 'Correct! The statement is True.');
        });

        it('rejects incorrect boolean answer', () => {
            const res = validateAnswer(q, false);
            assert.strictEqual(res.isCorrect, false);
            assert.strictEqual(res.feedback, 'Incorrect. The statement is actually True.');
        });

        it('rejects non-boolean types like strings', () => {
            const res = validateAnswer(q, 'true');
            assert.strictEqual(res.isCorrect, false);
        });
    });

    describe('validateAnswer - live_press', () => {
        const q = {
            type: 'live_press',
            targetKeys: ['Win', 'E'],
            displayCombo: 'Win + E'
        };

        it('validates pressed keys regardless of casing and order', () => {
            const res = validateAnswer(q, ['e', 'WIN']);
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
            assert.ok(res.feedback.includes('Keyboard combo captured! (Win + E)'));
        });

        it('rejects incorrect keys or missing keys', () => {
            const res = validateAnswer(q, ['Win']);
            assert.strictEqual(res.isCorrect, false);
            assert.ok(res.feedback.includes('Combination did not match. Target was: Win + E'));
        });

        it('handles non-array inputs', () => {
            const res = validateAnswer(q, 'Win+E');
            assert.strictEqual(res.isCorrect, false);
        });

        it('normalizes browser ArrowDown/ArrowUp/ArrowLeft/ArrowRight in live_press', () => {
            const arrowQ = {
                type: 'live_press',
                targetKeys: ['Shift', 'Down Arrow'],
                displayCombo: 'Shift + Down Arrow'
            };
            const res = validateAnswer(arrowQ, ['Shift', 'ArrowDown']);
            assert.strictEqual(res.isCorrect, true);
            assert.ok(res.feedback.includes('Keyboard combo captured! (Shift + Down Arrow)'));
        });

        it('normalizes short arrow targets such as Right/Left/Up/Down in live_press', () => {
            const shortArrowQ = {
                type: 'live_press',
                targetKeys: ['Ctrl', 'Right'],
                displayCombo: 'Ctrl + Right'
            };
            const res = validateAnswer(shortArrowQ, ['Ctrl', 'ArrowRight']);
            assert.strictEqual(res.isCorrect, true);
        });
    });

    describe('validateAnswer - odd_one_out', () => {
        const q = {
            type: 'odd_one_out',
            imposterId: 'opt4',
            imposterReason: 'Ctrl+P prints documents while others manage browser tabs'
        };

        it('validates correct imposter selection', () => {
            const res = validateAnswer(q, 'opt4');
            assert.strictEqual(res.isCorrect, true);
            assert.strictEqual(res.score, 1);
            assert.ok(res.feedback.includes('Well spotted!'));
        });

        it('rejects incorrect selection', () => {
            const res = validateAnswer(q, 'opt1');
            assert.strictEqual(res.isCorrect, false);
            assert.ok(res.feedback.includes('Incorrect.'));
        });
    });

    describe('point system - difficulty & time decay', () => {
        it('computes difficulty multipliers for Beginner/Easy, Intermediate, and Advanced/Hard', () => {
            assert.strictEqual(getDifficultyMultiplier('Beginner'), 1.0);
            assert.strictEqual(getDifficultyMultiplier('easy'), 1.0);
            assert.strictEqual(getDifficultyMultiplier('Intermediate'), 1.25);
            assert.strictEqual(getDifficultyMultiplier('Advanced'), 1.5);
            assert.strictEqual(getDifficultyMultiplier('hard'), 1.5);
            assert.strictEqual(getDifficultyMultiplier('unknown'), 1.0);
            assert.strictEqual(getDifficultyMultiplier(), 1.0);
        });

        it('computes time factor with 3s grace period and linear decay up to 20s', () => {
            assert.strictEqual(calculateTimeFactor(null), 1.0);
            assert.strictEqual(calculateTimeFactor(undefined), 1.0);
            assert.strictEqual(calculateTimeFactor(NaN), 1.0);
            assert.strictEqual(calculateTimeFactor(0), 1.0);
            assert.strictEqual(calculateTimeFactor(3), 1.0);
            assert.strictEqual(calculateTimeFactor(11.5), 0.75); // midpoint between 3s and 20s
            assert.strictEqual(calculateTimeFactor(20), 0.5);
            assert.strictEqual(calculateTimeFactor(45), 0.5);
        });

        it('calculates points across difficulties and response speeds', () => {
            // Fast within grace period (<= 3s)
            assert.deepStrictEqual(calculateQuestionPoints(1, 'Beginner', 2), {
                points: 100,
                maxPoints: 100,
                difficultyMultiplier: 1.0,
                timeFactor: 1.0
            });
            assert.strictEqual(calculateQuestionPoints(1, 'Intermediate', 3).points, 125);
            assert.strictEqual(calculateQuestionPoints(1, 'Advanced', 1).points, 150);

            // Midpoint (11.5s -> 0.75 factor)
            assert.strictEqual(calculateQuestionPoints(1, 'Beginner', 11.5).points, 75);
            assert.strictEqual(calculateQuestionPoints(1, 'Intermediate', 11.5).points, 94);
            assert.strictEqual(calculateQuestionPoints(1, 'Advanced', 11.5).points, 113);

            // Slow (>= 20s -> 0.5 floor)
            assert.strictEqual(calculateQuestionPoints(1, 'Beginner', 25).points, 50);
            assert.strictEqual(calculateQuestionPoints(1, 'Intermediate', 20).points, 63);
            assert.strictEqual(calculateQuestionPoints(1, 'Advanced', 30).points, 75);

            // Wrong answer (0 accuracy)
            const wrong = calculateQuestionPoints(0, 'Advanced', 1);
            assert.strictEqual(wrong.points, 0);
            assert.strictEqual(wrong.maxPoints, 150);
        });
    });
});
