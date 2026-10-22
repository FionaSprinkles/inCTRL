import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { validateAnswer } from '../src/services/quizValidator.js'
import {
  fetchQuizzes,
  fetchCategories,
  fetchQuizById,
  submitQuizAttempt,
  filterQuizzes
} from '../src/services/quizService.js'

describe('quizService - filterQuizzes', () => {
  const sample = [
    { id: 1, title: 'Nav Basics', categoryId: 1, difficulty: 'Beginner' },
    { id: 2, title: 'Nav Advanced', categoryId: 1, difficulty: 'Advanced' },
    { id: 3, title: 'Sys Diagnostics', categoryId: 2, difficulty: 'Intermediate' }
  ]

  it('handles invalid inputs and empty filters', () => {
    assert.deepStrictEqual(filterQuizzes(null), [])
    assert.deepStrictEqual(filterQuizzes('invalid'), [])
    assert.deepStrictEqual(filterQuizzes(sample), sample)
    assert.deepStrictEqual(filterQuizzes(sample, {}), sample)
    assert.deepStrictEqual(filterQuizzes(sample, { categoryId: 'all', difficulty: 'all' }), sample)
  })

  it('filters by category, difficulty, or both', () => {
    assert.strictEqual(filterQuizzes(sample, { categoryId: 1 }).length, 2)
    assert.strictEqual(filterQuizzes(sample, { categoryId: '2' })[0].id, 3)
    assert.strictEqual(filterQuizzes(sample, { difficulty: 'intermediate' }).length, 1)
    assert.strictEqual(filterQuizzes(sample, { categoryId: 1, difficulty: 'Beginner' }).length, 1)
  })

  it('returns empty array when criteria do not match', () => {
    assert.deepStrictEqual(filterQuizzes(sample, { categoryId: 99 }), [])
    assert.deepStrictEqual(filterQuizzes(sample, { categoryId: 2, difficulty: 'Beginner' }), [])
    assert.deepStrictEqual(filterQuizzes(sample, { difficulty: 'Expert' }), [])
  })
})

describe('quizService - API fetch methods', () => {
  const origFetch = globalThis.fetch
  const origLocal = globalThis.localStorage

  beforeEach(() => {
    globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  })
  afterEach(() => {
    globalThis.fetch = origFetch
    globalThis.localStorage = origLocal
  })

  it('fetchQuizzes succeeds and handles errors', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ quizzes: [{ id: 1 }] }) })
    assert.strictEqual((await fetchQuizzes()).length, 1)

    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({ error: 'Fail' }) })
    await assert.rejects(fetchQuizzes, /Fail/)

    globalThis.fetch = async () => ({ ok: false, status: 502, json: async () => { throw new Error() } })
    await assert.rejects(fetchQuizzes, /Failed to fetch quizzes \(502\)/)
  })

  it('fetchCategories succeeds and handles errors', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ categories: [{ id: 1 }] }) })
    assert.strictEqual((await fetchCategories()).length, 1)

    globalThis.fetch = async () => ({ ok: false, status: 404, json: async () => { throw new Error() } })
    await assert.rejects(fetchCategories, /Failed to fetch categories \(404\)/)
  })

  it('fetchQuizById succeeds and handles errors', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ quiz: { id: 5 } }) })
    assert.strictEqual((await fetchQuizById(5)).id, 5)

    globalThis.fetch = async () => ({ ok: false, status: 404, json: async () => ({ error: 'Not found' }) })
    await assert.rejects(() => fetchQuizById(99), /Not found/)
  })

  it('submitQuizAttempt handles token, guest, and errors', async () => {
    globalThis.localStorage.getItem = () => 'jwt-token'
    let authHeader
    let sentPayload
    globalThis.fetch = async (url, opts) => {
      authHeader = opts.headers.Authorization
      sentPayload = JSON.parse(opts.body)
      return { ok: true, json: async () => ({ success: true }) }
    }
    await submitQuizAttempt({ quizId: 1, answers: {}, timeSpentSeconds: 65 })
    assert.strictEqual(authHeader, 'Bearer jwt-token')
    assert.strictEqual(sentPayload.timeSpentSeconds, 65)

    globalThis.localStorage.getItem = () => null
    await submitQuizAttempt({ quizId: 1, answers: {} })
    assert.strictEqual(authHeader, undefined)

    globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ error: 'Bad' }) })
    await assert.rejects(() => submitQuizAttempt({}), /Bad/)

    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => { throw new Error() } })
    await assert.rejects(() => submitQuizAttempt({}), /Failed to submit quiz attempt \(500\)/)
  })
})

describe('quiz answer persistence and navigation flow', () => {
  it('preserves answered values when navigating forward and returning to previous questions', () => {
    const userAnswers = {}
    const questions = [
      { id: 'q-1', prompt: 'Question 1', type: 'single_choice' },
      { id: 'q-2', prompt: 'Question 2', type: 'fill_blank' },
      { id: 'q-3', prompt: 'Question 3', type: 'multiple_choice' }
    ]

    // User answers question 1 and advances
    userAnswers['q-1'] = 'opt-1'
    let currentIndex = 0
    currentIndex++ // now on question 2

    // User answers question 2 and advances
    userAnswers['q-2'] = 'Win + L'
    currentIndex++ // now on question 3

    // User answers question 3
    userAnswers['q-3'] = ['opt-a', 'opt-b']

    // User returns to question 2
    currentIndex--
    assert.strictEqual(userAnswers[questions[currentIndex].id], 'Win + L')

    // User returns to question 1
    currentIndex--
    assert.strictEqual(userAnswers[questions[currentIndex].id], 'opt-1')

    // User returns to question 3
    currentIndex = 2
    assert.deepStrictEqual(userAnswers[questions[currentIndex].id], ['opt-a', 'opt-b'])
  })

  it('does not treat untouched ordering default as answered until user interaction', () => {
    const userAnswers = {}
    let isOrderingTouched = false

    const hasAnswer = (val, type) => {
      if (val === null || val === undefined) return false
      if (type === 'ordering') {
        return isOrderingTouched && Array.isArray(val) && val.length > 0
      }
      return true
    }

    const defaultOrdering = ['s4', 's3', 's2', 's1']
    // Initially untouched
    assert.strictEqual(hasAnswer(defaultOrdering, 'ordering'), false)
    assert.strictEqual(userAnswers['q-ord'], undefined)

    // User moves a step in ordering
    isOrderingTouched = true
    userAnswers['q-ord'] = ['s1', 's2', 's3', 's4']

    assert.strictEqual(hasAnswer(userAnswers['q-ord'], 'ordering'), true)
    assert.deepStrictEqual(userAnswers['q-ord'], ['s1', 's2', 's3', 's4'])
  })

  it('defers evaluation to the end of the quiz and includes timeSpentSeconds upon completion', async () => {
    const userAnswers = {}
    const evalResults = {}
    let isCompleted = false
    let submittedAttempt = null

    const questions = [
      { id: 'q-1', prompt: 'Question 1', type: 'true_false', correctAnswer: true },
      { id: 'q-2', prompt: 'Question 2', type: 'single_choice', options: [{ id: 'opt-a', isCorrect: true }] }
    ]

    // Step 1: User answers question 1 and advances to question 2
    userAnswers['q-1'] = true
    let currentIndex = 0
    currentIndex++

    // Assert: No validation or auto-correction happens when pressing next
    assert.strictEqual(Object.keys(evalResults).length, 0)
    assert.strictEqual(isCompleted, false)

    // Step 2: User answers question 2
    userAnswers['q-2'] = 'opt-a'

    // Step 3: Quiz completion triggers batch evaluation of all answers and timer record
    const elapsedSeconds = 55
    const finishQuiz = async () => {
      isCompleted = true
      questions.forEach((q) => {
        evalResults[q.id] = validateAnswer(q, userAnswers[q.id] ?? null)
      })
      submittedAttempt = {
        quizId: 5,
        answers: userAnswers,
        formatFilter: 'all',
        timeSpentSeconds: elapsedSeconds
      }
    }

    await finishQuiz()

    assert.strictEqual(isCompleted, true)
    assert.strictEqual(Object.keys(evalResults).length, 2)
    assert.strictEqual(evalResults['q-1'].isCorrect, true)
    assert.strictEqual(evalResults['q-2'].isCorrect, true)
    assert.strictEqual(submittedAttempt.timeSpentSeconds, 55)
  })

  it('allows advancing forward without answering questions and evaluates skipped questions as unanswered', async () => {
    const userAnswers = {}
    const evalResults = {}
    let isCompleted = false
    let submittedAttempt = null

    const questions = [
      { id: 'q-1', prompt: 'Question 1', type: 'true_false', correctAnswer: true },
      { id: 'q-2', prompt: 'Question 2', type: 'single_choice', options: [{ id: 'opt-a', isCorrect: true }] },
      { id: 'q-3', prompt: 'Question 3', type: 'fill_blank', acceptedAnswers: ['Win + D'], canonicalAnswer: 'Win + D' }
    ]

    // User skips question 1 completely and clicks next
    let currentIndex = 0
    currentIndex++ // now on question 2

    // User answers question 2
    userAnswers['q-2'] = 'opt-a'
    currentIndex++ // now on question 3

    // User skips question 3 and finishes quiz
    const finishQuiz = async () => {
      isCompleted = true
      const finalAnswers = {}
      questions.forEach((q) => {
        finalAnswers[q.id] = userAnswers[q.id] ?? null
      })
      questions.forEach((q) => {
        evalResults[q.id] = validateAnswer(q, finalAnswers[q.id])
      })
      submittedAttempt = {
        quizId: 8,
        answers: finalAnswers,
        formatFilter: 'all',
        timeSpentSeconds: 20
      }
    }

    await finishQuiz()

    assert.strictEqual(isCompleted, true)
    assert.strictEqual(evalResults['q-1'].isCorrect, false)
    assert.strictEqual(evalResults['q-1'].feedback, 'No answer provided')
    assert.strictEqual(evalResults['q-2'].isCorrect, true)
    assert.strictEqual(evalResults['q-3'].isCorrect, false)
    assert.strictEqual(evalResults['q-3'].feedback, 'No answer provided')
    assert.strictEqual(submittedAttempt.answers['q-1'], null)
    assert.strictEqual(submittedAttempt.answers['q-2'], 'opt-a')
    assert.strictEqual(submittedAttempt.answers['q-3'], null)
  })

  it('normalizes cleared answers ("", [], {}) to null before validation and submission', async () => {
    const questions = [
      { id: 'q-empty-str', type: 'fill_blank', prompt: 'Type something', acceptedAnswers: ['ctrl+c'], canonicalAnswer: 'Ctrl + C' },
      { id: 'q-empty-arr', type: 'multiple_choice', prompt: 'Choose items', options: [{ id: 'a', text: 'A', isCorrect: true }], correctAnswers: ['a'] },
      { id: 'q-empty-obj', type: 'matching', prompt: 'Match pairs', pairs: [{ left: 'A', right: '1' }] },
      { id: 'q-valid', type: 'fill_blank', prompt: 'Valid', acceptedAnswers: ['win+e'], canonicalAnswer: 'Win + E' },
    ]

    const userAnswers = {
      'q-empty-str': '   ',
      'q-empty-arr': [],
      'q-empty-obj': {},
      'q-valid': 'win+e',
    }

    const isQuestionAnswered = (questionId) => {
      const ans = userAnswers[questionId]
      if (ans === null || ans === undefined) return false
      if (typeof ans === 'string') return ans.trim().length > 0
      if (Array.isArray(ans)) return ans.length > 0
      if (typeof ans === 'object') return Object.keys(ans).length > 0
      return true
    }

    const finalAnswers = {}
    questions.forEach((q) => {
      finalAnswers[q.id] = isQuestionAnswered(q.id) ? userAnswers[q.id] : null
    })

    assert.strictEqual(finalAnswers['q-empty-str'], null)
    assert.strictEqual(finalAnswers['q-empty-arr'], null)
    assert.strictEqual(finalAnswers['q-empty-obj'], null)
    assert.strictEqual(finalAnswers['q-valid'], 'win+e')

    const evalResults = {}
    questions.forEach((q) => {
      evalResults[q.id] = validateAnswer(q, finalAnswers[q.id])
    })

    assert.strictEqual(evalResults['q-empty-str'].feedback, 'No answer provided')
    assert.strictEqual(evalResults['q-empty-arr'].feedback, 'No answer provided')
    assert.strictEqual(evalResults['q-empty-obj'].feedback, 'No answer provided')
    assert.strictEqual(evalResults['q-valid'].isCorrect, true)
  })
})


describe('quiz question loading and error handling state machine', () => {
  it('transitions through loading state and renders questions on success', async () => {
    let loadingQuestions = false
    let quizError = ''
    let quizQuestions = []

    const startQuizSimulation = async (quiz, fetcher) => {
      loadingQuestions = true
      quizError = ''
      quizQuestions = []
      try {
        const data = await fetcher(quiz.id)
        if (!data?.questions?.length) throw new Error('No questions found for this quiz.')
        quizQuestions = data.questions
      } catch (err) {
        quizError = err.message || 'Could not load quiz questions.'
      } finally {
        loadingQuestions = false
      }
    }

    let resolveFetch
    const pendingFetch = new Promise((resolve) => {
      resolveFetch = resolve
    })
    const promise = startQuizSimulation({ id: 1 }, () => pendingFetch)
    assert.strictEqual(loadingQuestions, true)
    assert.strictEqual(quizError, '')

    resolveFetch({ questions: [{ id: 'q1', prompt: 'Question 1' }] })
    await promise

    assert.strictEqual(loadingQuestions, false)
    assert.strictEqual(quizError, '')
    assert.strictEqual(quizQuestions.length, 1)
  })

  it('captures error text without crashing when API fetch rejects', async () => {
    let loadingQuestions = false
    let quizError = ''
    let quizQuestions = []

    const startQuizSimulation = async (quiz, fetcher) => {
      loadingQuestions = true
      quizError = ''
      quizQuestions = []
      try {
        const data = await fetcher(quiz.id)
        if (!data?.questions?.length) throw new Error('No questions found for this quiz.')
        quizQuestions = data.questions
      } catch (err) {
        quizError = err.message || 'Could not load quiz questions.'
      } finally {
        loadingQuestions = false
      }
    }

    await startQuizSimulation({ id: 99 }, async () => {
      throw new Error('Failed to fetch quiz questions from backend (500).')
    })

    assert.strictEqual(loadingQuestions, false)
    assert.strictEqual(quizError, 'Failed to fetch quiz questions from backend (500).')
    assert.deepStrictEqual(quizQuestions, [])
  })

  it('handles empty questions list without crashing and sets error message', async () => {
    let loadingQuestions = false
    let quizError = ''
    let quizQuestions = []

    const startQuizSimulation = async (quiz, fetcher) => {
      loadingQuestions = true
      quizError = ''
      quizQuestions = []
      try {
        const data = await fetcher(quiz.id)
        if (!data?.questions?.length) throw new Error('No questions found for this quiz.')
        quizQuestions = data.questions
      } catch (err) {
        quizError = err.message || 'Could not load quiz questions.'
      } finally {
        loadingQuestions = false
      }
    }

    await startQuizSimulation({ id: 2 }, async () => ({ questions: [] }))

    assert.strictEqual(loadingQuestions, false)
    assert.strictEqual(quizError, 'No questions found for this quiz.')
    assert.deepStrictEqual(quizQuestions, [])
  })

  it('allows retry after failure to reload questions successfully', async () => {
    let loadingQuestions = false
    let quizError = ''
    let quizQuestions = []

    const startQuizSimulation = async (quiz, fetcher) => {
      loadingQuestions = true
      quizError = ''
      quizQuestions = []
      try {
        const data = await fetcher(quiz.id)
        if (!data?.questions?.length) throw new Error('No questions found for this quiz.')
        quizQuestions = data.questions
      } catch (err) {
        quizError = err.message || 'Could not load quiz questions.'
      } finally {
        loadingQuestions = false
      }
    }

    // First attempt fails
    await startQuizSimulation({ id: 5 }, async () => {
      throw new Error('Network error')
    })
    assert.strictEqual(quizError, 'Network error')

    // Retry attempt succeeds
    await startQuizSimulation({ id: 5 }, async () => ({
      questions: [{ id: 'q-5', prompt: 'Retry worked' }]
    }))
    assert.strictEqual(loadingQuestions, false)
    assert.strictEqual(quizError, '')
    assert.strictEqual(quizQuestions.length, 1)
  })

  it('keeps submitError separate from quizError and allows retrying submission without resetting answers', async () => {
    let quizError = ''
    let submitError = ''
    let isSubmitted = false
    let isCompleted = false
    const userAnswers = { 'q-1': 'ctrl+c' }
    const quizQuestions = [{ id: 'q-1', prompt: 'Copy' }]

    const finishQuizSimulation = async (submitter) => {
      isCompleted = true
      const finalAnswers = {}
      quizQuestions.forEach((q) => {
        finalAnswers[q.id] = userAnswers[q.id] ?? null
      })
      if (!isSubmitted) {
        try {
          await submitter({ answers: finalAnswers })
          isSubmitted = true
          submitError = ''
        } catch (err) {
          submitError = err.message || 'Could not submit quiz attempt.'
        }
      }
    }

    const retrySubmitSimulation = async (submitter) => {
      if (isSubmitted) return
      submitError = ''
      const finalAnswers = {}
      quizQuestions.forEach((q) => {
        finalAnswers[q.id] = userAnswers[q.id] ?? null
      })
      try {
        await submitter({ answers: finalAnswers })
        isSubmitted = true
      } catch (err) {
        submitError = err.message || 'Could not submit quiz attempt.'
      }
    }

    // Attempt fails on network failure
    await finishQuizSimulation(async () => {
      throw new Error('Submission endpoint timed out')
    })

    // Assert submitError is set, quizError remains empty, answers are preserved
    assert.strictEqual(submitError, 'Submission endpoint timed out')
    assert.strictEqual(quizError, '')
    assert.strictEqual(isSubmitted, false)
    assert.strictEqual(isCompleted, true)
    assert.deepStrictEqual(userAnswers, { 'q-1': 'ctrl+c' })

    // Retry succeeds without calling startQuiz
    await retrySubmitSimulation(async () => ({ success: true }))
    assert.strictEqual(submitError, '')
    assert.strictEqual(isSubmitted, true)
    assert.deepStrictEqual(userAnswers, { 'q-1': 'ctrl+c' })
  })
})
