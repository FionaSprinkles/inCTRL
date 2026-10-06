import { checkShortcutMatch } from '../utils/keyboardUtils.js'

/**
 * Validates a user's answer against a question definition.
 * @param {object} question - Question definition object.
 * @param {any} userAnswer - Answer provided by the user.
 * @returns {{ isCorrect: boolean, feedback: string, score: number, maxScore: number }} Evaluation result object.
 */
export function validateAnswer(question, userAnswer) {
  if (!question || userAnswer === undefined || userAnswer === null) {
    return { isCorrect: false, feedback: 'No answer provided', score: 0, maxScore: 1 }
  }

  switch (question.type) {
    case 'single_choice': {
      const correctOpt = question.options.find(o => o.isCorrect)
      const isCorrect = userAnswer === correctOpt?.id
      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        feedback: isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${correctOpt?.label || correctOpt?.text}`
      }
    }

    case 'multiple_choice': {
      const selected = Array.isArray(userAnswer) ? userAnswer : []
      const correctIds = question.options.filter(o => o.isCorrect).map(o => o.id)

      const hasAllCorrect = correctIds.every(id => selected.includes(id))
      const hasNoExtras = selected.every(id => correctIds.includes(id))
      const isCorrect = hasAllCorrect && hasNoExtras && selected.length > 0

      // Partial scoring logic
      const correctSelectedCount = selected.filter(id => correctIds.includes(id)).length
      const incorrectSelectedCount = selected.filter(id => !correctIds.includes(id)).length
      const score = Math.max(0, Math.round(((correctSelectedCount - incorrectSelectedCount) / correctIds.length) * 100) / 100)

      return {
        isCorrect,
        score: isCorrect ? 1 : (score > 0 ? score : 0),
        maxScore: 1,
        feedback: isCorrect
          ? 'Great job! You identified all correct shortcuts.'
          : `Not quite. Expected: ${question.options.filter(o => o.isCorrect).map(o => o.label || o.text).join(', ')}`
      }
    }

    case 'fill_blank': {
      const text = typeof userAnswer === 'string' ? userAnswer : ''
      const isCorrect = checkShortcutMatch(text, question.acceptedAnswers)
      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        feedback: isCorrect
          ? 'Spot on! Correct shortcut.'
          : `Incorrect. The accepted answer is: ${question.canonicalAnswer}`
      }
    }

    case 'key_builder': {
      const keys = Array.isArray(userAnswer) ? userAnswer : []
      const target = question.targetCombo || []

      // If order matters or doesn't matter:
      let isCorrect = false
      if (question.orderMatters) {
        isCorrect = keys.length === target.length && keys.every((k, i) => k.toLowerCase() === target[i].toLowerCase())
      } else {
        const sortedUser = [...keys].map(k => k.toLowerCase()).sort()
        const sortedTarget = [...target].map(k => k.toLowerCase()).sort()
        isCorrect = sortedUser.length === sortedTarget.length && sortedUser.every((k, i) => k === sortedTarget[i])
      }

      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        feedback: isCorrect
          ? 'Combination built perfectly!'
          : `Incorrect combo. Target: ${target.join(' + ')}`
      }
    }

    case 'matching': {
    // Normalizing userAnswer to being an object
      let normalizedAnswer = userAnswer
      if (Array.isArray(userAnswer)) {
        normalizedAnswer = {}
        userAnswer.forEach(item => {
          if (item && item.leftId !== undefined && item.rightId !== undefined) {
            normalizedAnswer[item.leftId] = item.rightId
          }
        })
      }

      // userAnswer: Record<pairId, rightId> or array of { leftId, rightId }
      const pairs = question.pairs || []
      let correctMatches = 0

      pairs.forEach(pair => {
        if (normalizedAnswer && normalizedAnswer[pair.id] === pair.id) {
          correctMatches++
        }
      })

      const isCorrect = correctMatches === pairs.length
      const score = pairs.length > 0 ? Math.round((correctMatches / pairs.length) * 100) / 100 : 0

      return {
        isCorrect,
        score,
        maxScore: 1,
        feedback: isCorrect
          ? 'All pairs matched successfully!'
          : `You matched ${correctMatches} out of ${pairs.length} pairs correctly.`
      }
    }

    case 'ordering': {
      // userAnswer: array of item IDs in order
      const userOrder = Array.isArray(userAnswer) ? userAnswer : []
      const correctOrder = question.correctOrder || []

      const isCorrect =
        userOrder.length === correctOrder.length &&
        userOrder.every((id, idx) => id === correctOrder[idx])

      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        feedback: isCorrect
          ? 'Steps ordered in the correct sequence!'
          : 'The order is not quite right. Check the sequence and try again.'
      }
    }

    case 'true_false': {
      const isCorrect = typeof userAnswer === 'boolean' && userAnswer === question.correctAnswer
      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        feedback: isCorrect
          ? `Correct! The statement is ${question.correctAnswer ? 'True' : 'False'}.`
          : `Incorrect. The statement is actually ${question.correctAnswer ? 'True' : 'False'}.`
      }
    }

    case 'live_press': {
      // userAnswer: array of pressed key names, e.g. ['Win', 'E']
      const pressed = Array.isArray(userAnswer) ? userAnswer : []
      const target = question.targetKeys || []

      const normPressed = pressed.map(k => k.toLowerCase()).sort()
      const normTarget = target.map(k => k.toLowerCase()).sort()

      const isCorrect =
        normPressed.length === normTarget.length &&
        normPressed.every((k, idx) => k === normTarget[idx])

      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        feedback: isCorrect
          ? `Keyboard combo captured! (${question.displayCombo})`
          : `Combination did not match. Target was: ${question.displayCombo}`
      }
    }

    case 'odd_one_out': {
      const isCorrect = userAnswer === question.imposterId
      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        feedback: isCorrect
          ? `Well spotted! ${question.imposterReason}`
          : `Incorrect. The odd one out is: ${question.options.find(o => o.id === question.imposterId)?.text}. ${question.imposterReason}`
      }
    }

    default:
      return {
        isCorrect: false,
        score: 0,
        maxScore: 1,
        feedback: `Unknown question type: ${question.type}`
      }
  }
}
