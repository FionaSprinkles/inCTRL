import { describe, it } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import {
  validateAnswer,
  isAnswerProvided,
  getDifficultyMultiplier,
  calculateTimeFactor,
  calculateQuestionPoints,
  evaluateQuestionWithPoints
} from '../src/services/quizValidator.js'

describe('frontend/src/services/quizValidator', () => {
  describe('isAnswerProvided', () => {
    it('returns false for null, undefined, empty/whitespace strings, empty arrays, and empty objects', () => {
      assert.strictEqual(isAnswerProvided(null), false)
      assert.strictEqual(isAnswerProvided(undefined), false)
      assert.strictEqual(isAnswerProvided(''), false)
      assert.strictEqual(isAnswerProvided('   '), false)
      assert.strictEqual(isAnswerProvided([]), false)
      assert.strictEqual(isAnswerProvided({}), false)
    })

    it('returns true for non-empty answers of various types', () => {
      assert.strictEqual(isAnswerProvided('ctrl+c'), true)
      assert.strictEqual(isAnswerProvided(['ctrl', 'c']), true)
      assert.strictEqual(isAnswerProvided({ left: 'right' }), true)
      assert.strictEqual(isAnswerProvided(true), true)
      assert.strictEqual(isAnswerProvided(false), true)
      assert.strictEqual(isAnswerProvided(0), true)
    })
  })

  describe('base guards', () => {
    it('returns error when question or userAnswer is missing', () => {
      assert.deepStrictEqual(validateAnswer(null, 'ans'), {
        isCorrect: false,
        feedback: 'No answer provided',
        score: 0,
        maxScore: 1
      })
      assert.deepStrictEqual(validateAnswer({ type: 'single_choice' }, null), {
        isCorrect: false,
        feedback: 'No answer provided',
        score: 0,
        maxScore: 1
      })
      assert.deepStrictEqual(validateAnswer({ type: 'single_choice' }, undefined), {
        isCorrect: false,
        feedback: 'No answer provided',
        score: 0,
        maxScore: 1
      })
    })

    it('returns error for unknown question type', () => {
      const res = validateAnswer({ type: 'unknown_type' }, 'ans')
      assert.strictEqual(res.isCorrect, false)
      assert.strictEqual(res.feedback, 'Unknown question type: unknown_type')
    })
  })

  describe('single_choice', () => {
    const q = {
      type: 'single_choice',
      options: [
        { id: 'opt1', label: 'Ctrl + C', isCorrect: false },
        { id: 'opt2', text: 'Ctrl + V', isCorrect: true }
      ]
    }

    it('validates correct answer', () => {
      const res = validateAnswer(q, 'opt2')
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.score, 1)
      assert.strictEqual(res.feedback, 'Correct!')
    })

    it('validates incorrect answer', () => {
      const res = validateAnswer(q, 'opt1')
      assert.strictEqual(res.isCorrect, false)
      assert.strictEqual(res.score, 0)
      assert.ok(res.feedback.includes('Ctrl + V'))
    })
  })

  describe('multiple_choice', () => {
    const q = {
      type: 'multiple_choice',
      options: [
        { id: 'opt1', label: 'Win+L', isCorrect: true },
        { id: 'opt2', label: 'Win+D', isCorrect: true },
        { id: 'opt3', label: 'Alt+F4', isCorrect: false }
      ]
    }

    it('evaluates completely correct selection', () => {
      const res = validateAnswer(q, ['opt1', 'opt2'])
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.score, 1)
    })

    it('evaluates partial scoring', () => {
      const res = validateAnswer(q, ['opt1'])
      assert.strictEqual(res.isCorrect, false)
      assert.strictEqual(res.score, 0.5)
      assert.ok(res.feedback.includes('Not quite. Expected:'))
    })

    it('penalizes wrong selections down to 0', () => {
      const res = validateAnswer(q, ['opt3'])
      assert.strictEqual(res.isCorrect, false)
      assert.strictEqual(res.score, 0)
    })

    it('handles non-array inputs', () => {
      const res = validateAnswer(q, 'opt1')
      assert.strictEqual(res.isCorrect, false)
    })
  })

  describe('fill_blank', () => {
    const q = {
      type: 'fill_blank',
      acceptedAnswers: ['win+l', 'windows+l'],
      canonicalAnswer: 'Win + L'
    }

    it('validates accepted variation', () => {
      const res = validateAnswer(q, 'Windows + L')
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.score, 1)
      assert.strictEqual(res.feedback, 'Spot on! Correct shortcut.')
    })

    it('rejects wrong answer or non-string input', () => {
      const res = validateAnswer(q, 'ctrl+c')
      assert.strictEqual(res.isCorrect, false)
      assert.ok(res.feedback.includes('Win + L'))

      const resNonString = validateAnswer(q, 1234)
      assert.strictEqual(resNonString.isCorrect, false)
    })
  })

  describe('key_builder', () => {
    const qOrdered = {
      type: 'key_builder',
      targetCombo: ['Ctrl', 'Shift', 'Esc'],
      orderMatters: true
    }

    const qUnordered = {
      type: 'key_builder',
      targetCombo: ['Win', 'D'],
      orderMatters: false
    }

    it('validates ordered builder', () => {
      const res = validateAnswer(qOrdered, ['Ctrl', 'Shift', 'Esc'])
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.feedback, 'Combination built perfectly!')

      const resWrongOrder = validateAnswer(qOrdered, ['Esc', 'Shift', 'Ctrl'])
      assert.strictEqual(resWrongOrder.isCorrect, false)
    })

    it('validates unordered builder', () => {
      const res = validateAnswer(qUnordered, ['d', 'win'])
      assert.strictEqual(res.isCorrect, true)

      const resWrong = validateAnswer(qUnordered, ['win'])
      assert.strictEqual(resWrong.isCorrect, false)
    })

    it('handles non-array input', () => {
      const res = validateAnswer(qOrdered, 'Ctrl+Shift+Esc')
      assert.strictEqual(res.isCorrect, false)
    })

    it('normalizes browser ArrowDown/ArrowUp/ArrowLeft/ArrowRight in key_builder', () => {
      const arrowQ = {
        type: 'key_builder',
        targetCombo: ['Alt', 'Up Arrow'],
        orderMatters: false
      }
      const res = validateAnswer(arrowQ, ['Alt', 'ArrowUp'])
      assert.strictEqual(res.isCorrect, true)

      const arrowOrdered = {
        type: 'key_builder',
        targetCombo: ['Shift', 'Down Arrow'],
        orderMatters: true
      }
      const resOrdered = validateAnswer(arrowOrdered, ['Shift', 'ArrowDown'])
      assert.strictEqual(resOrdered.isCorrect, true)
    })

    it('normalizes short arrow targets such as Left in key_builder (e.g. q-txt2-033)', () => {
      const textEditingQuestions = JSON.parse(
        fs.readFileSync(new URL('../../backend/data/quizQuestions/textEditingPart2.json', import.meta.url), 'utf8')
      )
      const qTxt2033 = textEditingQuestions.find(q => q.id === 'q-txt2-033')
      assert.ok(qTxt2033, 'Question q-txt2-033 must exist in seeded data')

      const res = validateAnswer(qTxt2033, ['Shift', 'Ctrl', 'ArrowLeft'])
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.score, 1)

      const resVirtual = validateAnswer(qTxt2033, ['Shift', 'Ctrl', 'Left'])
      assert.strictEqual(resVirtual.isCorrect, true)

      const resDisplay = validateAnswer(qTxt2033, ['Shift', 'Ctrl', 'Left Arrow'])
      assert.strictEqual(resDisplay.isCorrect, true)
    })
  })

  describe('matching', () => {
    const q = {
      type: 'matching',
      pairs: [
        { id: '1', leftText: 'Copy', rightText: 'Ctrl+C' },
        { id: '2', leftText: 'Paste', rightText: 'Ctrl+V' }
      ]
    }

    it('validates object matching answer', () => {
      const res = validateAnswer(q, { 1: '1', 2: '2' })
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.score, 1)
      assert.strictEqual(res.feedback, 'All pairs matched successfully!')
    })

    it('validates array matching answer', () => {
      const res = validateAnswer(q, [
        { leftId: '1', rightId: '1' },
        { leftId: '2', rightId: '2' },
        null
      ])
      assert.strictEqual(res.isCorrect, true)
    })

    it('evaluates partial matching score', () => {
      const res = validateAnswer(q, { 1: '1', 2: 'wrong' })
      assert.strictEqual(res.isCorrect, false)
      assert.strictEqual(res.score, 0.5)
      assert.strictEqual(res.feedback, 'You matched 1 out of 2 pairs correctly.')
    })
  })

  describe('ordering', () => {
    const q = {
      type: 'ordering',
      correctOrder: ['s1', 's2', 's3']
    }

    it('validates correct sequence', () => {
      const res = validateAnswer(q, ['s1', 's2', 's3'])
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.score, 1)
      assert.strictEqual(res.feedback, 'Steps ordered in the correct sequence!')
    })

    it('rejects wrong sequence or non-array input', () => {
      const res = validateAnswer(q, ['s2', 's1', 's3'])
      assert.strictEqual(res.isCorrect, false)

      const resNonArr = validateAnswer(q, 's1,s2,s3')
      assert.strictEqual(resNonArr.isCorrect, false)
    })
  })

  describe('true_false', () => {
    const q = {
      type: 'true_false',
      correctAnswer: true
    }

    it('validates true answer', () => {
      const res = validateAnswer(q, true)
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.score, 1)
      assert.strictEqual(res.feedback, 'Correct! The statement is True.')
    })

    it('rejects false answer or non-boolean', () => {
      const res = validateAnswer(q, false)
      assert.strictEqual(res.isCorrect, false)
      assert.strictEqual(res.feedback, 'Incorrect. The statement is actually True.')

      const resStr = validateAnswer(q, 'true')
      assert.strictEqual(resStr.isCorrect, false)
    })
  })

  describe('live_press', () => {
    const q = {
      type: 'live_press',
      targetKeys: ['Win', 'E'],
      displayCombo: 'Win + E'
    }

    it('validates pressed keys regardless of casing and order', () => {
      const res = validateAnswer(q, ['e', 'WIN'])
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.feedback, 'Keyboard combo captured! (Win + E)')
    })

    it('rejects wrong keys or non-array input', () => {
      const res = validateAnswer(q, ['Ctrl', 'E'])
      assert.strictEqual(res.isCorrect, false)
      assert.ok(res.feedback.includes('Combination did not match. Target was: Win + E'))

      const resNonArr = validateAnswer(q, 'Win+E')
      assert.strictEqual(resNonArr.isCorrect, false)
    })

    it('normalizes browser ArrowDown/ArrowUp/ArrowLeft/ArrowRight in live_press', () => {
      const arrowQ = {
        type: 'live_press',
        targetKeys: ['Shift', 'Down Arrow'],
        displayCombo: 'Shift + Down Arrow'
      }
      const res = validateAnswer(arrowQ, ['Shift', 'ArrowDown'])
      assert.strictEqual(res.isCorrect, true)
      assert.ok(res.feedback.includes('Keyboard combo captured! (Shift + Down Arrow)'))
    })

    it('normalizes short arrow targets such as Right/Left/Up/Down in live_press', () => {
      const shortArrowQ = {
        type: 'live_press',
        targetKeys: ['Ctrl', 'Right'],
        displayCombo: 'Ctrl + Right'
      }
      const res = validateAnswer(shortArrowQ, ['Ctrl', 'ArrowRight'])
      assert.strictEqual(res.isCorrect, true)
    })
  })

  describe('odd_one_out', () => {
    const q = {
      type: 'odd_one_out',
      imposterId: 'opt3',
      imposterReason: 'Does not manage windows',
      options: [
        { id: 'opt1', text: 'Win+Left' },
        { id: 'opt2', text: 'Win+Right' },
        { id: 'opt3', text: 'Ctrl+P' }
      ]
    }

    it('validates correct imposter choice', () => {
      const res = validateAnswer(q, 'opt3')
      assert.strictEqual(res.isCorrect, true)
      assert.strictEqual(res.score, 1)
      assert.ok(res.feedback.includes('Well spotted!'))
    })

    it('rejects wrong imposter choice', () => {
      const res = validateAnswer(q, 'opt1')
      assert.strictEqual(res.isCorrect, false)
      assert.strictEqual(res.score, 0)
      assert.ok(res.feedback.includes('Incorrect. The odd one out is: Ctrl+P'))
    })
  })

  describe('point system - difficulty & time decay', () => {
    it('computes difficulty multipliers for Beginner/Easy, Intermediate, and Advanced/Hard', () => {
      assert.strictEqual(getDifficultyMultiplier('Beginner'), 1.0)
      assert.strictEqual(getDifficultyMultiplier('easy'), 1.0)
      assert.strictEqual(getDifficultyMultiplier('Intermediate'), 1.25)
      assert.strictEqual(getDifficultyMultiplier('Advanced'), 1.5)
      assert.strictEqual(getDifficultyMultiplier('hard'), 1.5)
      assert.strictEqual(getDifficultyMultiplier('unknown'), 1.0)
      assert.strictEqual(getDifficultyMultiplier(), 1.0)
    })

    it('computes time factor with 3s grace period and linear decay up to 20s', () => {
      assert.strictEqual(calculateTimeFactor(null), 1.0)
      assert.strictEqual(calculateTimeFactor(undefined), 1.0)
      assert.strictEqual(calculateTimeFactor(NaN), 1.0)
      assert.strictEqual(calculateTimeFactor(0), 1.0)
      assert.strictEqual(calculateTimeFactor(3), 1.0)
      assert.strictEqual(calculateTimeFactor(11.5), 0.75)
      assert.strictEqual(calculateTimeFactor(20), 0.5)
      assert.strictEqual(calculateTimeFactor(45), 0.5)
    })

    it('calculates question points and evaluates questions with points', () => {
      assert.strictEqual(calculateQuestionPoints(1, 'Beginner', 2).points, 100)
      assert.strictEqual(calculateQuestionPoints(1, 'Intermediate', 2).points, 125)
      assert.strictEqual(calculateQuestionPoints(1, 'Advanced', 2).points, 150)
      assert.strictEqual(calculateQuestionPoints(0, 'Advanced', 2).points, 0)

      const q = {
        type: 'single_choice',
        difficulty: 'Intermediate',
        options: [{ id: 'opt1', text: 'Ctrl+C', isCorrect: true }]
      }

      const fastEval = evaluateQuestionWithPoints(q, 'opt1', { timeSpentSeconds: 2 })
      assert.strictEqual(fastEval.isCorrect, true)
      assert.strictEqual(fastEval.score, 125)
      assert.strictEqual(fastEval.maxScore, 125)
      assert.strictEqual(fastEval.accuracyScore, 1)

      const slowEval = evaluateQuestionWithPoints(q, 'opt1', { timeSpentSeconds: 20 })
      assert.strictEqual(slowEval.score, 63)
      assert.strictEqual(slowEval.maxScore, 125)

      const fallbackEval = evaluateQuestionWithPoints({ type: 'true_false', correctAnswer: true }, true)
      assert.strictEqual(fallbackEval.score, 100)
      assert.strictEqual(fallbackEval.maxScore, 100)
    })
  })
})
