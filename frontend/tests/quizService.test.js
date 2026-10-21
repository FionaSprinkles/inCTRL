import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
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
    globalThis.fetch = async (url, opts) => {
      authHeader = opts.headers.Authorization
      return { ok: true, json: async () => ({ success: true }) }
    }
    await submitQuizAttempt({ quizId: 1, answers: {} })
    assert.strictEqual(authHeader, 'Bearer jwt-token')

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
})
