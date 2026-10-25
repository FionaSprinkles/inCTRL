<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  fetchQuizzes,
  fetchCategories,
  fetchQuizById,
  filterQuizzes,
  submitQuizAttempt,
} from '@/services/quizService'
import { validateAnswer, isAnswerProvided } from '@/services/quizValidator'
import QuizCard from '@/components/quiz/QuizCard.vue'
import QuizSummary from '@/components/quiz/QuizSummary.vue'
import QuizLoading from '@/components/quiz/QuizLoading.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()

const quizzes = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref('')

const selectedCategory = ref('all')
const selectedDifficulty = ref('all')

const activeQuiz = ref(null)
const quizQuestions = ref([])
const loadingQuestions = ref(false)
const quizError = ref('')
const submitError = ref('')
const currentIndex = ref(0)
const userAnswers = ref({})
const evalResults = ref({})
const isCompleted = ref(false)
const isSubmitted = ref(false)

const elapsedSeconds = ref(0)
const startedAt = ref(null)
let timerInterval = null
const isReviewMode = ref(false)

function startTimer() {
  stopTimer()
  startedAt.value = Date.now()
  elapsedSeconds.value = 0
  timerInterval = setInterval(() => {
    if (startedAt.value) {
      elapsedSeconds.value = Math.floor((Date.now() - startedAt.value) / 1000)
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const formattedTimer = computed(() => {
  const total = elapsedSeconds.value
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const filteredQuizzes = computed(() => {
  return filterQuizzes(quizzes.value, {
    categoryId: selectedCategory.value,
    difficulty: selectedDifficulty.value,
  })
})

const currentQuestion = computed(() => quizQuestions.value[currentIndex.value] || null)
const totalScore = computed(() =>
  Object.values(evalResults.value).reduce((s, r) => s + (r?.score || 0), 0),
)
const answeredCount = computed(
  () => quizQuestions.value.filter((q) => isQuestionAnswered(q.id)).length,
)

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [qData, cData] = await Promise.all([fetchQuizzes(), fetchCategories().catch(() => [])])
    quizzes.value = qData
    categories.value = cData

    const qCat = route.query.category || route.query.categoryId
    if (qCat) selectedCategory.value = qCat
    const qDiff = route.query.difficulty
    if (qDiff) selectedDifficulty.value = qDiff
    const qQuizId = route.query.id || route.query.quizId
    if (qQuizId) {
      const target = qData.find((q) => String(q.id) === String(qQuizId))
      if (target) {
        startQuiz(target)
      } else {
        startQuiz({ id: qQuizId, title: `Quiz #${qQuizId}` })
      }
    }
  } catch (err) {
    error.value = err.message || 'Failed to load quizzes from backend.'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  selectedCategory.value = 'all'
  selectedDifficulty.value = 'all'
}

let quizRequestId = 0
let attemptId = 0

async function startQuiz(quiz) {
  if (!quiz || !quiz.id) {
    quizError.value = 'Invalid quiz selected.'
    return
  }
  attemptId++
  const requestId = ++quizRequestId
  activeQuiz.value = quiz
  loadingQuestions.value = true
  quizError.value = ''
  submitError.value = ''
  quizQuestions.value = []
  currentIndex.value = 0
  userAnswers.value = {}
  evalResults.value = {}
  isCompleted.value = false
  isSubmitted.value = false
  isReviewMode.value = false
  stopTimer()
  elapsedSeconds.value = 0

  try {
    const data = await fetchQuizById(quiz.id)
    if (requestId !== quizRequestId) return
    if (!data?.questions?.length) throw new Error('No questions found for this quiz.')
    if (data.title && activeQuiz.value) {
      activeQuiz.value.title = data.title
    }
    quizQuestions.value = data.questions
    startTimer()
  } catch (err) {
    if (requestId !== quizRequestId) return
    quizError.value = err.message || 'Could not load quiz questions.'
  } finally {
    if (requestId === quizRequestId) {
      loadingQuestions.value = false
    }
  }
}

function exitQuiz() {
  attemptId++
  quizRequestId++
  stopTimer()
  isReviewMode.value = false
  elapsedSeconds.value = 0
  activeQuiz.value = null
  quizQuestions.value = []
  quizError.value = ''
  submitError.value = ''
  isCompleted.value = false
  isSubmitted.value = false
}

function handleAnswered({ questionId, userAnswer, result }) {
  userAnswers.value = { ...userAnswers.value, [questionId]: userAnswer }
  evalResults.value = { ...evalResults.value, [questionId]: result }
}

function handleAnswerUpdate({ questionId, userAnswer }) {
  userAnswers.value = { ...userAnswers.value, [questionId]: userAnswer }
}

function isQuestionAnswered(questionId) {
  return isAnswerProvided(userAnswers.value[questionId])
}

function handleRetry({ questionId }) {
  const next = { ...evalResults.value }
  delete next[questionId]
  evalResults.value = next
}

function nextQuestion() {
  if (currentIndex.value < quizQuestions.value.length - 1) {
    currentIndex.value++
  } else if (isReviewMode.value) {
    returnToSummary()
  } else if (!isCompleted.value) {
    finishQuiz()
  }
}

function getFinalAnswers() {
  const finalAnswers = {}
  quizQuestions.value.forEach((q) => {
    finalAnswers[q.id] = isQuestionAnswered(q.id) ? userAnswers.value[q.id] : null
  })
  return finalAnswers
}

async function finishQuiz() {
  const myAttempt = attemptId
  stopTimer()
  if (startedAt.value) {
    elapsedSeconds.value = Math.max(0, Math.floor((Date.now() - startedAt.value) / 1000))
  }
  isCompleted.value = true
  isReviewMode.value = false

  const finalAnswers = getFinalAnswers()

  const results = {}
  quizQuestions.value.forEach((q) => {
    results[q.id] = validateAnswer(q, finalAnswers[q.id])
  })
  evalResults.value = results

  if (!isSubmitted.value) {
    try {
      await submitQuizAttempt({
        quizId: activeQuiz.value?.id,
        answers: finalAnswers,
        formatFilter: 'all',
        timeSpentSeconds: elapsedSeconds.value,
      })
      if (myAttempt !== attemptId) return
      isSubmitted.value = true
      submitError.value = ''
    } catch (err) {
      if (myAttempt !== attemptId) return
      submitError.value = err.message || 'Could not submit quiz attempt.'
    }
  }
}

async function retrySubmit() {
  if (isSubmitted.value) return
  const myAttempt = attemptId
  submitError.value = ''
  const finalAnswers = getFinalAnswers()
  try {
    await submitQuizAttempt({
      quizId: activeQuiz.value?.id,
      answers: finalAnswers,
      formatFilter: 'all',
      timeSpentSeconds: elapsedSeconds.value,
    })
    if (myAttempt !== attemptId) return
    isSubmitted.value = true
  } catch (err) {
    if (myAttempt !== attemptId) return
    submitError.value = err.message || 'Could not submit quiz attempt.'
  }
}

function previousQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
}

function restartQuiz() {
  attemptId++
  userAnswers.value = {}
  evalResults.value = {}
  currentIndex.value = 0
  isCompleted.value = false
  isSubmitted.value = false
  isReviewMode.value = false
  quizError.value = ''
  submitError.value = ''
  startTimer()
}

function reviewQuestion(index) {
  currentIndex.value = index
  isReviewMode.value = true
  isCompleted.value = false
}

function returnToSummary() {
  isReviewMode.value = false
  isCompleted.value = true
}

onMounted(loadData)
onUnmounted(stopTimer)
</script>

<template>
  <div class="quiz-page">
    <!-- View 1: Quiz Selection & Filter Screen -->
    <div v-if="!activeQuiz" class="quiz-selection-view">
      <header class="quiz-page-header">
        <h1>Windows Shortcut Quizzes</h1>
        <p class="subtitle">Choose a category, a difficulty, or both to start practicing.</p>
      </header>

      <section class="filters-bar" aria-label="Quiz Filters">
        <div class="filter-group">
          <label for="category-filter">Category</label>
          <select id="category-filter" v-model="selectedCategory" class="filter-select">
            <option value="all">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="difficulty-filter">Difficulty</label>
          <select id="difficulty-filter" v-model="selectedDifficulty" class="filter-select">
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <button
          v-if="selectedCategory !== 'all' || selectedDifficulty !== 'all'"
          type="button"
          class="btn-reset"
          @click="resetFilters"
        >
          Reset Filters
        </button>
      </section>

      <div v-if="loading" class="status-box">
        <LoadingSpinner size="md" text="Loading quizzes from backend..." />
      </div>

      <div v-else-if="error" class="status-box error-box" role="alert">
        <p>{{ error }}</p>
        <button type="button" class="btn-retry" @click="loadData">Retry</button>
      </div>

      <div v-else-if="filteredQuizzes.length === 0" class="status-box empty-box" role="status">
        <p class="no-quizzes-message">No quizzes fit the selected parameters.</p>
        <p class="empty-hint">Try selecting a different category or difficulty level.</p>
        <button type="button" class="btn-clear" @click="resetFilters">Show All Quizzes</button>
      </div>

      <div v-else class="quiz-grid">
        <article v-for="quiz in filteredQuizzes" :key="quiz.id" class="quiz-card">
          <div class="quiz-tags">
            <span class="badge category-badge">{{ quiz.categoryName || 'General' }}</span>
            <span class="badge diff-badge" :class="quiz.difficulty?.toLowerCase()">{{
              quiz.difficulty
            }}</span>
          </div>
          <h2 class="quiz-title">{{ quiz.title }}</h2>
          <p class="quiz-description">{{ quiz.description }}</p>
          <div class="quiz-footer">
            <span class="question-count">{{ quiz.questionCount || 0 }} questions</span>
            <button type="button" class="btn-start" @click="startQuiz(quiz)">Start Quiz</button>
          </div>
        </article>
      </div>
    </div>

    <!-- View 2: Active Quiz Runner -->
    <div v-else class="quiz-runner-view">
      <header v-if="!isCompleted || isReviewMode" class="runner-bar">
        <div class="runner-header-top">
          <button v-if="isReviewMode" type="button" class="btn-back" @click="returnToSummary">
            ← Back to Summary
          </button>
          <button v-else type="button" class="btn-back" @click="exitQuiz">← Back to Quizzes</button>
          <div class="runner-info">
            <h2>{{ activeQuiz.title }}</h2>
            <div class="runner-stats">
              <span class="timer-display" title="Quiz Timer">
                ⏱️ <strong>{{ formattedTimer }}</strong>
              </span>
              <span class="progress-display">
                Answered: <strong>{{ answeredCount }}</strong> / {{ quizQuestions.length }}
              </span>
            </div>
          </div>
        </div>

        <!-- Question jump numbers tied directly into the top bar -->
        <nav
          v-if="quizQuestions.length > 1"
          class="question-dots-nav"
          aria-label="Question navigation"
        >
          <button
            v-for="(q, idx) in quizQuestions"
            :key="q.id"
            type="button"
            class="dot-btn"
            :class="{
              current: idx === currentIndex,
              answered: isQuestionAnswered(q.id),
              correct: isReviewMode && evalResults[q.id]?.isCorrect,
              wrong: isReviewMode && evalResults[q.id] && !evalResults[q.id].isCorrect,
            }"
            :title="`Question ${idx + 1}`"
            @click="currentIndex = idx"
          >
            {{ idx + 1 }}
          </button>
        </nav>
      </header>

      <QuizLoading
        v-if="loadingQuestions"
        :title="activeQuiz?.title"
        message="Fetching quiz questions from backend..."
      />

      <div
        v-else-if="quizError && !isCompleted && !isReviewMode"
        class="status-box error-box"
        role="alert"
      >
        <div class="error-icon" aria-hidden="true">⚠️</div>

        <p class="error-message">{{ quizError }}</p>
        <div class="error-actions">
          <button type="button" class="btn-retry" @click="startQuiz(activeQuiz)">Retry</button>
          <button type="button" class="btn-back" @click="exitQuiz">Back to Quizzes</button>
        </div>
      </div>

      <template v-else-if="(!isCompleted || isReviewMode) && currentQuestion">
        <main class="question-container">
          <QuizCard
            :question="currentQuestion"
            :saved-answer="userAnswers[currentQuestion.id]"
            :saved-result="isReviewMode ? evalResults[currentQuestion.id] : null"
            :question-number="currentIndex + 1"
            :total-questions="quizQuestions.length"
            @answered="handleAnswered"
            @update:answer="handleAnswerUpdate"
            @retry="handleRetry"
            @next="nextQuestion"
            @previous="previousQuestion"
          />
        </main>
      </template>

      <div v-else-if="isCompleted" class="summary-wrapper">
        <div v-if="submitError" class="status-box error-box summary-error" role="alert">
          <div class="error-icon" aria-hidden="true">⚠️</div>

          <p class="error-message">{{ submitError }}</p>
          <div class="error-actions">
            <button type="button" class="btn-retry" @click="retrySubmit">Retry Submission</button>
          </div>
        </div>
        <QuizSummary
          :questions="quizQuestions"
          :answers="userAnswers"
          :results="evalResults"
          :time-spent-seconds="elapsedSeconds"
          @restart="restartQuiz"
          @review-question="reviewQuestion"
        />
        <div class="summary-exit-bar">
          <button type="button" class="btn-secondary" @click="exitQuiz">
            ← Choose Another Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  font-family: var(--font-body), sans-serif;
}

.quiz-page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.quiz-page-header h1 {
  font-family: var(--font-heading), serif;
  font-size: 38px;
  font-weight: 370;
  color: var(--color-text-white);
  margin-top: 10px;
  margin-bottom: 8px;
}

.subtitle {
  font-family: var(--font-body), sans-serif;
  color: var(--color-text-main);
  font-size: 17px;
  letter-spacing: 0.5px;
  margin-top: 0;
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.25rem;
  margin-bottom: 2rem;
  padding: 1.1rem 1.4rem;
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 180px;
}

.filter-group label {
  font-family: var(--font-display), serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--color-text-main);
}

.filter-select {
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--color-text-accenturate);
  background: var(--color-dark-teal);
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  font-family: var(--font-body), sans-serif;
}

.filter-select option {
  background: #125662;
  color: var(--color-text-accenturate);
}

.btn-reset {
  font-family: var(--font-display), serif;
  color: var(--color-text-accenturate);
  font-size: 16px;
  letter-spacing: 1px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.16);
  color: var(--color-text-accenturate);
  border-color: rgba(255, 255, 255, 0.4);
}

.status-box {
  padding: 2.5rem 1.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  margin-bottom: 2rem;
}

.empty-box .no-quizzes-message {
  font-family: var(--font-display), serif;
  font-size: 1.3rem;
  color: var(--color-text-white);
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-family: var(--font-body), sans-serif;
  color: var(--color-text-accenturate);
  margin-bottom: 1.25rem;
}

.btn-clear {
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  border: 1px solid var(--color-button-border);
  font-weight: 500;
  cursor: pointer;
}

.btn-clear:hover {
  background: var(--color-button-hover);
}

.error-box {
  border-color: #ef4444;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.12);
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error-message {
  font-family: var(--font-body), sans-serif;
  font-size: 1rem;
  color: #fecaca;
  margin-bottom: 1rem;
}

.btn-retry {
  font-family: var(--font-display), serif;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  border: 1px solid var(--color-button-border);
  cursor: pointer;
}

.summary-error {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
}

.quiz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.quiz-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.35rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}

.quiz-card:hover {
  border-color: rgba(255, 255, 255, 0.45);
  transform: translateY(-2px);
}

.quiz-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  font-family: var(--font-display), serif;
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.category-badge {
  background: rgba(133, 180, 190, 0.25);
  color: #c7e6ee;
  border: 1px solid rgba(133, 180, 190, 0.4);
}

.diff-badge.beginner {
  background: rgba(16, 185, 129, 0.25);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.diff-badge.intermediate {
  background: rgba(245, 158, 11, 0.25);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.diff-badge.advanced {
  background: rgba(239, 68, 68, 0.25);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.quiz-title {
  font-family: var(--font-display), serif;
  font-size: 1.35rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--color-text-white);
  letter-spacing: 1px;
}

.quiz-description {
  font-family: var(--font-body), sans-serif;
  font-size: 0.95rem;
  color: var(--color-text-main);
  margin-bottom: 1.25rem;
  flex-grow: 1;
}

.quiz-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.question-count {
  font-family: var(--font-body), sans-serif;
  font-size: 0.85rem;
  color: var(--color-text-main);
}

.btn-start {
  font-family: var(--font-display), serif;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.5rem 1.1rem;
  border-radius: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 500;
  border: 1px solid var(--color-button-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-start:hover {
  background: var(--color-button-hover);
}

/* Unified top runner bar: back button, title, timer, progress + numbers tied together */
.runner-bar {
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 1.1rem 1.4rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.runner-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.runner-info {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
}

.runner-info h2 {
  font-family: var(--font-display), serif;
  font-size: 1.4rem;
  color: var(--color-text-white);
  margin: 0;
  letter-spacing: 2px;
}

.runner-stats {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.timer-display {
  font-family: var(--font-body), sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-button);
  background: rgba(227, 221, 196, 0.15);
  border: 1px solid rgba(227, 221, 196, 0.35);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.timer-display strong {
  font-weight: 600;
  color: var(--color-text-white);
}

.progress-display {
  font-family: var(--font-body), sans-serif;
  font-size: 0.92rem;
  color: var(--color-text-accenturate);
}

.progress-display strong {
  color: var(--color-text-white);
}

.btn-back {
  font-family: var(--font-display), serif;
  font-size: 16px;
  letter-spacing: 1px;
  color: var(--color-text-main);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0.45rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.16);
  color: var(--color-text-white);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Navigation dots row tied to the top bar */
.question-dots-nav {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.dot-btn {
  min-width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.07);
  color: var(--color-text-main);
  font-family: var(--font-display), serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.dot-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-text-white);
  border-color: rgba(255, 255, 255, 0.4);
}

.dot-btn.current {
  border-color: var(--color-button-border);
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 600;
}

.dot-btn.answered:not(.current):not(.correct):not(.wrong) {
  border-color: rgba(227, 221, 196, 0.4);
  background: rgba(227, 221, 196, 0.18);
  color: var(--color-text-white);
}

.dot-btn.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.35);
  color: #a7f3d0;
}

.dot-btn.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.35);
  color: #fecaca;
}

.question-container {
  width: 100%;
}

.summary-exit-bar {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.summary-exit-bar .btn-secondary {
  font-family: var(--font-display), serif;
  font-size: 17px;
  letter-spacing: 1px;
  padding: 0.65rem 1.4rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: var(--color-text-main);
  cursor: pointer;
  transition: all 0.2s ease;
}

.summary-exit-bar .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.16);
  color: var(--color-text-white);
  border-color: rgba(255, 255, 255, 0.4);
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
}
</style>