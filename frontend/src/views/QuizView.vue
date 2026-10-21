<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchQuizzes, fetchCategories, fetchQuizById, filterQuizzes, submitQuizAttempt } from '@/services/quizService'
import { validateAnswer } from '@/services/quizValidator'
import QuizCard from '@/components/quiz/QuizCard.vue'
import QuizSummary from '@/components/quiz/QuizSummary.vue'

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
const currentIndex = ref(0)
const userAnswers = ref({})
const evalResults = ref({})
const isCompleted = ref(false)
const isSubmitted = ref(false)

const filteredQuizzes = computed(() => {
  return filterQuizzes(quizzes.value, {
    categoryId: selectedCategory.value,
    difficulty: selectedDifficulty.value
  })
})

const currentQuestion = computed(() => quizQuestions.value[currentIndex.value] || null)
const totalScore = computed(() => Object.values(evalResults.value).reduce((s, r) => s + (r?.score || 0), 0))
const answeredCount = computed(() => quizQuestions.value.filter(q => isQuestionAnswered(q.id)).length)

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
      const target = qData.find(q => String(q.id) === String(qQuizId))
      if (target) startQuiz(target)
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

async function startQuiz(quiz) {
  const requestId = ++quizRequestId
  activeQuiz.value = quiz
  loadingQuestions.value = true
  quizError.value = ''
  quizQuestions.value = []
  currentIndex.value = 0
  userAnswers.value = {}
  evalResults.value = {}
  isCompleted.value = false
  isSubmitted.value = false

  try {
    const data = await fetchQuizById(quiz.id)
    if (requestId !== quizRequestId) return
    if (!data?.questions?.length) throw new Error('No questions found for this quiz.')
    quizQuestions.value = data.questions
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
  quizRequestId++
  activeQuiz.value = null
  quizQuestions.value = []
  quizError.value = ''
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
  const ans = userAnswers.value[questionId]
  if (ans === null || ans === undefined) return false
  if (typeof ans === 'string') return ans.trim().length > 0
  if (Array.isArray(ans)) return ans.length > 0
  if (typeof ans === 'object') return Object.keys(ans).length > 0
  return true
}

function handleRetry({ questionId }) {
  const next = { ...evalResults.value }
  delete next[questionId]
  evalResults.value = next
}

async function nextQuestion() {
  if (currentIndex.value < quizQuestions.value.length - 1) {
    currentIndex.value++
  } else if (!isCompleted.value) {
    isCompleted.value = true
    quizQuestions.value.forEach(q => {
      if (!evalResults.value[q.id]) {
        evalResults.value[q.id] = validateAnswer(q, userAnswers.value[q.id] ?? null)
      }
    })
    if (!isSubmitted.value) {
      isSubmitted.value = true
      try {
        await submitQuizAttempt({
          quizId: activeQuiz.value?.id,
          answers: userAnswers.value,
          formatFilter: 'all'
        })
      } catch (err) {
        quizError.value = err.message || 'Could not submit quiz attempt.'
      }
    }
  }
}

function previousQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
}

function restartQuiz() {
  userAnswers.value = {}
  evalResults.value = {}
  currentIndex.value = 0
  isCompleted.value = false
  isSubmitted.value = false
  quizError.value = ''
}

function reviewQuestion(index) {
  currentIndex.value = index
  isCompleted.value = false
}

onMounted(loadData)
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

      <div v-if="loading" class="status-box"><p>Loading quizzes from backend...</p></div>

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
            <span class="badge diff-badge" :class="quiz.difficulty?.toLowerCase()">{{ quiz.difficulty }}</span>
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
      <div class="runner-header">
        <button type="button" class="btn-back" @click="exitQuiz">← Back to Quizzes</button>
        <div class="runner-info">
          <h2>{{ activeQuiz.title }}</h2>
          <span class="score-display">Score: <strong>{{ totalScore }}</strong> / {{ answeredCount }}</span>
        </div>
      </div>

      <div v-if="loadingQuestions" class="status-box"><p>Fetching quiz questions from backend...</p></div>

      <div v-else-if="quizError && !isCompleted" class="status-box error-box" role="alert">
        <p>{{ quizError }}</p>
        <div class="error-actions">
          <button type="button" class="btn-retry" @click="startQuiz(activeQuiz)">Retry</button>
          <button type="button" class="btn-back" @click="exitQuiz">Back to Quizzes</button>
        </div>
      </div>

      <template v-else-if="!isCompleted && currentQuestion">
        <div v-if="quizQuestions.length > 1" class="question-dots">
          <button
            v-for="(q, idx) in quizQuestions"
            :key="q.id"
            type="button"
            class="dot-btn"
            :class="{
              current: idx === currentIndex,
              answered: isQuestionAnswered(q.id),
              correct: isQuestionAnswered(q.id) && evalResults[q.id]?.isCorrect,
              wrong: isQuestionAnswered(q.id) && evalResults[q.id] && !evalResults[q.id].isCorrect
            }"
            :title="`Question ${idx + 1}`"
            @click="currentIndex = idx"
          >
            {{ idx + 1 }}
          </button>
        </div>

        <main class="question-container">
          <QuizCard
            :question="currentQuestion"
            :saved-answer="userAnswers[currentQuestion.id]"
            :saved-result="isQuestionAnswered(currentQuestion.id) ? evalResults[currentQuestion.id] : null"
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
        <div v-if="quizError" class="status-box error-box summary-error" role="alert">
          <p>{{ quizError }}</p>
        </div>
        <QuizSummary
          :questions="quizQuestions"
          :answers="userAnswers"
          :results="evalResults"
          @restart="restartQuiz"
          @review-question="reviewQuestion"
        />
        <div class="summary-exit-bar">
          <button type="button" class="btn-secondary" @click="exitQuiz">← Choose Another Quiz</button>
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
}
.quiz-page-header {
  margin-bottom: 1.5rem;
  text-align: center;
}
.subtitle {
  color: var(--color-text-muted, #85b4be);
  margin-top: -0.5rem;
}
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 180px;
}
.filter-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-main, #e6d5b8);
}
.filter-select {
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(20, 30, 40, 0.7);
  color: #fff;
  font-size: 0.95rem;
  outline: none;
}
.btn-reset, .btn-clear, .btn-back, .btn-secondary, .btn-retry {
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-main, #e6d5b8);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.btn-reset, .btn-clear {
  color: #85b4be;
  border-color: #85b4be;
  align-self: flex-end;
}
.btn-retry {
  background: #ef4444;
  color: #fff;
  border: none;
}
.status-box {
  padding: 2.5rem 1.5rem;
  text-align: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin: 1.5rem 0;
}
.no-quizzes-message {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-heading, #fdfbf7);
  margin-bottom: 0.5rem;
}
.empty-hint {
  color: var(--color-text-muted, #85b4be);
  margin-bottom: 1.25rem;
}
.error-box {
  border-color: #ef4444;
  color: #fca5a5;
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
  padding: 1.25rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
}
.quiz-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-weight: 500;
}
.category-badge {
  background: rgba(133, 180, 190, 0.25);
  color: #c7e6ee;
}
.diff-badge.beginner {
  background: rgba(16, 185, 129, 0.25);
  color: #a7f3d0;
}
.diff-badge.intermediate {
  background: rgba(245, 158, 11, 0.25);
  color: #fde68a;
}
.diff-badge.advanced {
  background: rgba(239, 68, 68, 0.25);
  color: #fecaca;
}
.quiz-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--color-text-heading, #fdfbf7);
  letter-spacing: normal;
  text-transform: none;
}
.quiz-description {
  font-size: 0.9rem;
  color: var(--color-text-main, #e6d5b8);
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
  font-size: 0.85rem;
  color: var(--color-text-muted, #85b4be);
}
.btn-start {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: var(--color-button, #e3ddc4);
  color: var(--color-button-text, #422f23);
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.runner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.runner-info {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
}
.runner-info h2 {
  font-size: 1.2rem;
  margin: 0;
  letter-spacing: 1px;
}
.score-display {
  font-size: 0.9rem;
  color: #c7e6ee;
}
.question-dots {
  display: flex;
  gap: 6px;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  padding: 4px 0;
}
.dot-btn {
  min-width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-main, #e6d5b8);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.dot-btn.current {
  border-color: #3b82f6;
  background: #3b82f6;
  color: #fff;
}
.dot-btn.answered:not(.correct):not(.wrong) {
  border-color: #60a5fa;
  background: rgba(59, 130, 246, 0.25);
  color: #bfdbfe;
}
.dot-btn.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.3);
  color: #a7f3d0;
}
.dot-btn.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}
.summary-exit-bar {
  margin-top: 1.25rem;
  display: flex;
  justify-content: center;
}
.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
}
</style>
