import { describe, it } from 'node:test'
import assert from 'node:assert'
import { quizQuestions } from '../src/data/quizQuestions.js'
import { validateAnswer } from '../src/services/quizValidator.js'

describe('frontend/src/data/quizQuestions', () => {
  it('loads quiz questions across all 9 formats', () => {
    assert.ok(quizQuestions.length > 0)
    const formats = new Set(quizQuestions.map(q => q.type))
    assert.ok(formats.has('single_choice'))
    assert.ok(formats.has('multiple_choice'))
    assert.ok(formats.has('fill_blank'))
    assert.ok(formats.has('key_builder'))
    assert.ok(formats.has('matching'))
    assert.ok(formats.has('ordering'))
    assert.ok(formats.has('true_false'))
    assert.ok(formats.has('live_press'))
    assert.ok(formats.has('odd_one_out'))
  })

  it('validates every question with its expected correct answer', () => {
    for (const q of quizQuestions) {
      let answer
      switch (q.type) {
        case 'single_choice':
          answer = q.options.find(o => o.isCorrect).id
          break
        case 'multiple_choice':
          answer = q.options.filter(o => o.isCorrect).map(o => o.id)
          break
        case 'fill_blank':
          answer = q.acceptedAnswers[0]
          break
        case 'key_builder':
          answer = q.targetCombo
          break
        case 'matching':
          answer = {}
          q.pairs.forEach(p => { answer[p.id] = p.id })
          break
        case 'ordering':
          answer = q.correctOrder
          break
        case 'true_false':
          answer = q.correctAnswer
          break
        case 'live_press':
          answer = q.targetKeys
          break
        case 'odd_one_out':
          answer = q.imposterId
          break
      }

      const result = validateAnswer(q, answer)
      assert.strictEqual(
        result.isCorrect,
        true,
        `Question ${q.id} (${q.type}) should evaluate to correct`
      )
    }
  })

  it('verifies that submitting empty answers marks each question incorrect', () => {
    for (const q of quizQuestions) {
      const result = validateAnswer(q, null)
      assert.strictEqual(result.isCorrect, false)
      assert.strictEqual(result.score, 0)
    }
  })
})
