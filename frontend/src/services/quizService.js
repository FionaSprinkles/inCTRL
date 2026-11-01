import { getToken } from './authService.js'

/**
 * Fetches all curated quizzes from the backend.
 * @returns {Promise<Array<object>>}
 */
export async function fetchQuizzes() {
  const res = await fetch('/api/quizzes')
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch quizzes (${res.status})`)
  }
  return data.quizzes || []
}

/**
 * Fetches all categories for filtering.
 * @returns {Promise<Array<object>>}
 */
export async function fetchCategories() {
  const res = await fetch('/api/categories')
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch categories (${res.status})`)
  }
  return data.categories || []
}

/**
 * Fetches a single quiz by ID, including its associated questions.
 * @param {number|string} id - Quiz ID
 * @returns {Promise<object>}
 */
export async function fetchQuizById(id) {
  const res = await fetch(`/api/quizzes/${id}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch quiz ${id} (${res.status})`)
  }
  return data.quiz
}

function authHeaders() {
  const token = typeof getToken === 'function' ? getToken() : null
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

/**
 * Opens a server-timed run for one play of a quiz.
 * @param {number|string} quizId
 * @returns {Promise<{id: string, quizId: number, startedAt: string, expiresAt: string}>}
 */
export async function startQuizRun(quizId) {
  const res = await fetch('/api/quiz/runs', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ quizId }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to start quiz (${res.status})`)
  }
  return data.run
}

/**
 * Submits a completed quiz attempt to the backend.
 * Timing is measured by the server from the quiz run. Do not send client clocks.
 * @param {object} payload - Submission payload
 * @returns {Promise<object>}
 */
export async function submitQuizAttempt(payload) {
  const headers = authHeaders()

  const res = await fetch('/api/quiz/attempts', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to submit quiz attempt (${res.status})`)
  }
  return data
}

/**
 * Filters a list of quizzes by category and/or difficulty.
 *
 * @param {Array<object>} quizzes - List of quiz objects
 * @param {object} [filters={}] - Filter criteria
 * @param {number|string} [filters.categoryId] - Optional category ID or 'all'
 * @param {string} [filters.difficulty] - Optional difficulty or 'all'
 * @returns {Array<object>} Filtered list of quizzes
 */
export function filterQuizzes(quizzes, filters = {}) {
  if (!Array.isArray(quizzes)) return []
  const { categoryId, difficulty } = filters

  return quizzes.filter(quiz => {
    if (categoryId && categoryId !== 'all') {
      if (String(quiz.categoryId) !== String(categoryId)) {
        return false
      }
    }

    if (difficulty && difficulty !== 'all') {
      if (String(quiz.difficulty || '').toLowerCase() !== String(difficulty).toLowerCase()) {
        return false
      }
    }

    return true
  })
}
