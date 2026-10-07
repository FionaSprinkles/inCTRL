import { describe, it } from 'node:test'
import assert from 'node:assert'
import { validateAnswer } from '../src/services/quizValidator.js'

describe('frontend/src/services/quizValidator', () => {
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
})
