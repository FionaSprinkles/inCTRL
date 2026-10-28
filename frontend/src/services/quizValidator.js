import { checkShortcutMatch } from '../utils/keyboardUtils.js'

export const BASE_POINTS = 100
export const GRACE_PERIOD_SECONDS = 3
export const MAX_DECAY_SECONDS = 20
export const MIN_TIME_FACTOR = 0.5

const DIFFICULTY_MULTIPLIERS = {
  beginner: 1.0,
  easy: 1.0,
  intermediate: 1.25,
  advanced: 1.5,
  hard: 1.5
}

/**
 * Returns the difficulty multiplier for a given difficulty level.
 * Beginner/Easy = 1.0, Intermediate = 1.25, Advanced/Hard = 1.5.
 * @param {string} [difficulty='Beginner'] - Difficulty label.
 * @returns {number} Difficulty multiplier.
 */
export function getDifficultyMultiplier(difficulty = 'Beginner') {
  const key = String(difficulty || 'Beginner').trim().toLowerCase()
  return DIFFICULTY_MULTIPLIERS[key] ?? 1.0
}

/**
 * Computes the time decay factor using a grace period and linear decay down to a minimum floor.
 * Within GRACE_PERIOD_SECONDS (3s): 1.0 (full points).
 * Between GRACE_PERIOD_SECONDS (3s) and MAX_DECAY_SECONDS (20s): decays linearly from 1.0 to 0.5.
 * At or above MAX_DECAY_SECONDS (20s): 0.5 (minimum floor).
 * @param {number|null|undefined} timeSpentSeconds - Seconds spent on the question.
 * @returns {number} Time multiplier in [0.5, 1.0].
 */
export function calculateTimeFactor(timeSpentSeconds) {
  if (timeSpentSeconds === undefined || timeSpentSeconds === null || typeof timeSpentSeconds !== 'number' || Number.isNaN(timeSpentSeconds)) {
    return 1.0
  }
  const t = Math.max(0, timeSpentSeconds)
  if (t <= GRACE_PERIOD_SECONDS) {
    return 1.0
  }
  if (t >= MAX_DECAY_SECONDS) {
    return MIN_TIME_FACTOR
  }
  const progress = (t - GRACE_PERIOD_SECONDS) / (MAX_DECAY_SECONDS - GRACE_PERIOD_SECONDS)
  return 1.0 - (1.0 - MIN_TIME_FACTOR) * progress
}

/**
 * Calculates the question score and maximum possible points based on accuracy, difficulty, and time spent.
 * @param {number} accuracyScore - Raw accuracy ratio in [0, 1].
 * @param {string} [difficulty='Beginner'] - Difficulty tier of the question or quiz.
 * @param {number|null} [timeSpentSeconds=null] - Time spent on the question in seconds.
 * @returns {{ points: number, maxPoints: number, difficultyMultiplier: number, timeFactor: number }}
 */
export function calculateQuestionPoints(accuracyScore, difficulty = 'Beginner', timeSpentSeconds = null) {
  const difficultyMultiplier = getDifficultyMultiplier(difficulty)
  const maxPoints = Math.round(BASE_POINTS * difficultyMultiplier)
  const clampedAccuracy = Math.max(0, Math.min(1, Number(accuracyScore) || 0))

  if (clampedAccuracy <= 0) {
    return {
      points: 0,
      maxPoints,
      difficultyMultiplier,
      timeFactor: calculateTimeFactor(timeSpentSeconds)
    }
  }

  const timeFactor = calculateTimeFactor(timeSpentSeconds)
  const points = Math.round(maxPoints * clampedAccuracy * timeFactor)

  return {
    points,
    maxPoints,
    difficultyMultiplier,
    timeFactor
  }
}

/**
 * Evaluates a user's answer and computes time-and-difficulty-scaled points.
 * @param {object} question - Question definition object.
 * @param {any} userAnswer - Answer provided by the user.
 * @param {object} [options={}] - Optional scoring context.
 * @param {number|null} [options.timeSpentSeconds=null] - Seconds spent on this question.
 * @param {string|null} [options.difficulty=null] - Difficulty override if question has none.
 * @returns {{ isCorrect: boolean, feedback: string, score: number, maxScore: number, accuracyScore: number, timeSpentSeconds: number|null }}
 */
export function evaluateQuestionWithPoints(question, userAnswer, options = {}) {
  const baseResult = validateAnswer(question, userAnswer)
  const difficulty = question?.difficulty || options.difficulty || 'Beginner'
  const timeSpentSeconds = options.timeSpentSeconds ?? null
  const { points, maxPoints } = calculateQuestionPoints(baseResult.score, difficulty, timeSpentSeconds)

  return {
    ...baseResult,
    accuracyScore: baseResult.score,
    score: points,
    maxScore: maxPoints,
    timeSpentSeconds
  }
}

/**
 * Determines whether a given user answer value is non-empty.
 * Returns false for null, undefined, empty/whitespace strings, empty arrays, or empty objects.
 * @param {any} answer - The user answer value to check.
 * @returns {boolean} True if the answer contains actual input, false otherwise.
 */
export function isAnswerProvided(answer) {
  if (answer === null || answer === undefined) return false
  if (typeof answer === 'string') return answer.trim().length > 0
  if (Array.isArray(answer)) return answer.length > 0
  if (typeof answer === 'object') return Object.keys(answer).length > 0
  return true
}

/**
 * Validates a user's answer against a question definition.
 * @param {object} question - Question definition object.
 * @param {any} userAnswer - Answer provided by the user.
 * @returns {{ isCorrect: boolean, feedback: string, score: number, maxScore: number }} Evaluation result object.
 */

/**
 * Normalizes an individual key token (e.g. mapping browser arrow keys to display labels).
 * @param {any} k - Raw key token.
 * @returns {string} Lowercase normalized key name.
 */
function normalizeKeyToken(k) {
  const s = String(k).trim().toLowerCase()
  if (s === 'arrowup' || s === 'up' || s === 'up arrow') return 'up arrow'
  if (s === 'arrowdown' || s === 'down' || s === 'down arrow') return 'down arrow'
  if (s === 'arrowleft' || s === 'left' || s === 'left arrow') return 'left arrow'
  if (s === 'arrowright' || s === 'right' || s === 'right arrow') return 'right arrow'
  return s
}

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
      const target = question.targetCombo || question.payload?.targetCombo || []
      const orderMatters = question.orderMatters ?? question.payload?.orderMatters ?? false

      // If order matters or doesn't matter:
      let isCorrect = false
      if (orderMatters) {
        isCorrect = keys.length === target.length && keys.every((k, i) => normalizeKeyToken(k) === normalizeKeyToken(target[i]))
      } else {
        const sortedUser = [...keys].map(normalizeKeyToken).sort()
        const sortedTarget = [...target].map(normalizeKeyToken).sort()
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
      const target = question.targetKeys || question.payload?.targetKeys || []

      const normPressed = pressed.map(normalizeKeyToken).sort()
      const normTarget = target.map(normalizeKeyToken).sort()

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
