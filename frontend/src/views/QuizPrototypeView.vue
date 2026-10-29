<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { quizQuestions } from '../data/quizQuestions'
import { evaluateQuestionWithPoints, isAnswerProvided } from '../services/quizValidator'
import QuizHeader from '../components/quiz/QuizHeader.vue'
import QuizCard from '../components/quiz/QuizCard.vue'
import QuizResult from '../components/quiz/QuizResult.vue'
import QuizSummary from '../components/quiz/QuizSummary.vue'
import QuizInspector from '../components/quiz/QuizInspector.vue'

// All available unique formats
const availableFormats = computed(() => {
  const set = new Set(quizQuestions.map((q) => q.type))
  return Array.from(set)
})

const route = useRoute()
const activeFilter = ref('all')
const currentIndex = ref(0)
const userAnswers = ref({})
const evalResults = ref({})
const questionTimes = ref({})
const isCompleted = ref(false)
const startedAt = ref(Date.now())
const activeQuestionEnteredAt = ref(Date.now())
const elapsedSeconds = ref(0)
const categoryName = ref('')
let timerInterval = null

function recordCurrentQuestionTime(questionId) {
  if (isCompleted.value || !activeQuestionEnteredAt.value || !questionId) {
    return
  }
  const delta = Math.max(0, (Date.now() - activeQuestionEnteredAt.value) / 1000)
  const prev = questionTimes.value[questionId] || 0
  questionTimes.value = {
    ...questionTimes.value,
    [questionId]: Math.round((prev + delta) * 100) / 100,
  }
  activeQuestionEnteredAt.value = Date.now()
}

function startTimer() {
  stopTimer()
  const now = Date.now()
  startedAt.value = now
  activeQuestionEnteredAt.value = now
  elapsedSeconds.value = 0
  timerInterval = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - startedAt.value) / 1000)
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

startTimer()
onUnmounted(stopTimer)

// Filtered question set based on active format filter
const filteredQuestions = computed(() => {
  if (activeFilter.value === 'all') {
    return quizQuestions
  }
  return quizQuestions.filter((q) => q.type === activeFilter.value)
})

const currentQuestion = computed(() => {
  return filteredQuestions.value[currentIndex.value] || null
})

// Stats
const totalScore = computed(() => {
  return Object.values(evalResults.value).reduce((sum, res) => sum + (res ? res.score : 0), 0)
})

function isQuestionAnswered(questionId) {
  return isAnswerProvided(userAnswers.value[questionId])
}

const answeredCount = computed(() => {
  return filteredQuestions.value.filter((q) => isQuestionAnswered(q.id)).length
})

const correctCount = computed(() => {
  return filteredQuestions.value.filter((q) => evalResults.value[q.id]?.isCorrect).length
})

const maxScoreTotal = computed(() => {
  return filteredQuestions.value.reduce((sum, q) => {
    const max = evalResults.value[q.id]?.maxScore
    return sum + (typeof max === 'number' ? max : 1)
  }, 0)
})

const difficultyLabel = computed(() => {
  const value = route.query.difficulty
  return typeof value === 'string' ? value : ''
})

async function loadCategory() {
  const id = route.query.categoryId
  if (typeof id !== 'string' || !/^\d+$/.test(id)) {
    categoryName.value = ''
    return
  }

  try {
    const res = await fetch(`/api/categories/${id}`)
    const data = await res.json().catch(() => null)
    categoryName.value = res.ok && data?.category?.name ? data.category.name : ''
  } catch {
    categoryName.value = ''
  }
}

watch(() => route.query.categoryId, loadCategory, { immediate: true })

watch(currentIndex, (newIdx, oldIdx) => {
  if (isCompleted.value) return
  const prevQuestion = filteredQuestions.value[oldIdx]
  if (prevQuestion) {
    recordCurrentQuestionTime(prevQuestion.id)
  } else {
    activeQuestionEnteredAt.value = Date.now()
  }
})

/**
 * Updates active format filter and resets position.
 * @param {string} format - Selected question type or 'all'.
 */
function onFilterChanged(format) {
  activeFilter.value = format
  currentIndex.value = 0
  isCompleted.value = false
  userAnswers.value = {}
  evalResults.value = {}
  questionTimes.value = {}
  startTimer()
}

/**
 * Stores the user's submitted answer for a question.
 * @param {object} payload - Answer submission event payload.
 */
function handleAnswered({ questionId, userAnswer, result }) {
  userAnswers.value = {
    ...userAnswers.value,
    [questionId]: userAnswer,
  }
  if (result) {
    evalResults.value = {
      ...evalResults.value,
      [questionId]: result,
    }
  }
}

function handleAnswerUpdate({ questionId, userAnswer }) {
  userAnswers.value = {
    ...userAnswers.value,
    [questionId]: userAnswer,
  }
}

/**
 * Clears evaluation result when retrying a question.
 * @param {object} payload - Retry event payload.
 */
function handleRetry({ questionId }) {
  delete evalResults.value[questionId]
}

/**
 * Advances to the next question or finishes the quiz if at the end.
 */
function finishQuiz() {
  if (timerInterval) {
    if (currentQuestion.value) {
      recordCurrentQuestionTime(currentQuestion.value.id)
    }
    stopTimer()
    activeQuestionEnteredAt.value = null
    elapsedSeconds.value = Math.max(0, Math.round((Date.now() - startedAt.value) / 1000))
  }
  const results = {}
  filteredQuestions.value.forEach((q) => {
    const raw = userAnswers.value[q.id]
    const normalized = isAnswerProvided(raw) ? raw : null
    const qTime = questionTimes.value[q.id] ?? 0
    results[q.id] = evaluateQuestionWithPoints(q, normalized, {
      timeSpentSeconds: qTime,
      difficulty: q.difficulty || difficultyLabel.value || 'Beginner',
    })
  })
  evalResults.value = results
  isCompleted.value = true
}

function nextQuestion() {
  if (currentIndex.value < filteredQuestions.value.length - 1) {
    currentIndex.value++
  } else {
    finishQuiz()
  }
}

/**
 * Navigates to the previous question.
 */
function previousQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

/**
 * Resets all answers and evaluation state to restart the quiz from the beginning.
 */
function restartQuiz() {
  userAnswers.value = {}
  evalResults.value = {}
  questionTimes.value = {}
  currentIndex.value = 0
  isCompleted.value = false
  startTimer()
}

/**
 * Jumps directly to a question by index from the question dot bar.
 * @param {number} idx - Zero-based question index.
 */
function jumpToQuestion(idx) {
  currentIndex.value = idx
  isCompleted.value = false
}
</script>

<template>
  <div class="quiz-prototype-page">
    <QuizHeader
      v-if="!isCompleted"
      :formats="availableFormats"
      :active-format-filter="activeFilter"
      :current-index="currentIndex"
      :total-count="filteredQuestions.length"
      :score="totalScore"
      :answered-count="answeredCount"
      :time-spent-seconds="elapsedSeconds"
      @filter-changed="onFilterChanged"
      @restart="restartQuiz"
    />

    <!-- Quick Navigation Dot Bar -->
    <div v-if="!isCompleted && filteredQuestions.length > 1" class="question-nav-dots">
      <button
        v-for="(q, idx) in filteredQuestions"
        :key="q.id"
        type="button"
        class="nav-dot"
        :class="{
          current: idx === currentIndex,
          answered: isQuestionAnswered(q.id),
        }"
        :title="`Jump to Question ${idx + 1}`"
        @click="jumpToQuestion(idx)"
      >
        {{ idx + 1 }}
      </button>
    </div>

    <!-- Active Question Card -->
    <main v-if="!isCompleted && currentQuestion" class="main-content">
      <QuizCard
        :question="currentQuestion"
        :saved-answer="userAnswers[currentQuestion.id]"
        :saved-result="evalResults[currentQuestion.id]"
        :question-number="currentIndex + 1"
        :total-questions="filteredQuestions.length"
        @answered="handleAnswered"
        @update:answer="handleAnswerUpdate"
        @retry="handleRetry"
        @next="nextQuestion"
        @previous="previousQuestion"
      />

      <!-- Schema and Validator Developer Inspector -->
      <QuizInspector
        :question="currentQuestion"
        :user-answer="userAnswers[currentQuestion.id]"
        :result="evalResults[currentQuestion.id]"
      />
    </main>

    <!-- Quiz Completed Summary View -->
    <main v-else-if="isCompleted" class="main-content completed-layout">
      <QuizResult
        :category="categoryName"
        :difficulty="difficultyLabel"
        :correct-count="correctCount"
        :question-count="filteredQuestions.length"
        :score="totalScore"
        :max-score="maxScoreTotal"
        :seconds="elapsedSeconds"
        @restart="restartQuiz"
      />
      <QuizSummary
        :questions="filteredQuestions"
        :answers="userAnswers"
        :results="evalResults"
        :time-spent-seconds="elapsedSeconds"
        @restart="restartQuiz"
        @review-question="jumpToQuestion"
      />
    </main>
  </div>
</template>

<style scoped>
.quiz-prototype-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-body);
}

.question-nav-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  margin-bottom: 20px;
  padding: 4px 0;
}

.nav-dot {
  min-width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(15, 76, 92, 0.45);
  color: var(--color-text-main);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.nav-dot:hover {
  background: rgba(255, 255, 255, 0.18);
  color: var(--color-text-heading);
  border-color: rgba(255, 255, 255, 0.45);
}

.nav-dot.current {
  border-color: var(--color-button-border);
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 700;
}

.nav-dot.answered:not(.current) {
  border-color: rgba(227, 221, 196, 0.5);
  background: rgba(227, 221, 196, 0.22);
  color: var(--color-text-heading);
}

.main-content {
  width: 100%;
  box-sizing: border-box;
}

.completed-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
