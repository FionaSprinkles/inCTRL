<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { quizQuestions } from '../data/quizQuestions'
import QuizHeader from '../components/quiz/QuizHeader.vue'
import QuizCard from '../components/quiz/QuizCard.vue'
import QuizResult from '../components/quiz/QuizResult.vue'
import QuizInspector from '../components/quiz/QuizInspector.vue'

// All available unique formats
const availableFormats = computed(() => {
  const set = new Set(quizQuestions.map(q => q.type))
  return Array.from(set)
})

const route = useRoute()
const activeFilter = ref('all')
const currentIndex = ref(0)
const userAnswers = ref({})
const evalResults = ref({})
const isCompleted = ref(false)
const startedAt = ref(Date.now())
const elapsedSeconds = ref(0)
const categoryName = ref('')

// Filtered question set based on active format filter
const filteredQuestions = computed(() => {
  if (activeFilter.value === 'all') {
    return quizQuestions
  }
  return quizQuestions.filter(q => q.type === activeFilter.value)
})

const currentQuestion = computed(() => {
  return filteredQuestions.value[currentIndex.value] || null
})

// Stats
const totalScore = computed(() => {
  return Object.values(evalResults.value).reduce((sum, res) => sum + (res ? res.score : 0), 0)
})

const answeredCount = computed(() => {
  return Object.keys(evalResults.value).length
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

/**
 * Updates active format filter and resets position.
 * @param {string} format - Selected question type or 'all'.
 */
function onFilterChanged(format) {
  activeFilter.value = format
  currentIndex.value = 0
  isCompleted.value = false
}

/**
 * Stores the user's submitted answer and evaluation result for a question.
 * @param {object} payload - Answer submission event payload.
 * @param {string} payload.questionId - Question identifier.
 * @param {any} payload.userAnswer - User's selected or typed answer.
 * @param {object} payload.result - Validation result object.
 */
function handleAnswered({ questionId, userAnswer, result }) {
  userAnswers.value = {
    ...userAnswers.value,
    [questionId]: userAnswer
  }
  evalResults.value = {
    ...evalResults.value,
    [questionId]: result
  }
}

/**
 * Clears evaluation result when retrying a question.
 * @param {object} payload - Retry event payload.
 * @param {string} payload.questionId - Question identifier to retry.
 */
function handleRetry({ questionId }) {
  delete evalResults.value[questionId]
}

/**
 * Advances to the next question or finishes the quiz if at the end.
 */
function finishQuiz() {
  elapsedSeconds.value = Math.max(0, Math.round((Date.now() - startedAt.value) / 1000))
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
  currentIndex.value = 0
  isCompleted.value = false
  startedAt.value = Date.now()
  elapsedSeconds.value = 0
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
          answered: evalResults[q.id] !== undefined,
          correct: evalResults[q.id]?.isCorrect,
          wrong: evalResults[q.id] && !evalResults[q.id].isCorrect
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
    <main v-else-if="isCompleted" class="main-content">
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
    </main>
  </div>
</template>

<style scoped>
.quiz-prototype-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 16px;
  width: 100%;
}

.question-nav-dots {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding: 4px 0;
}

.nav-dot {
  min-width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--color-border, #cbd5e1);
  background: var(--color-background-soft, #f8fafc);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.12s;
}

.nav-dot:hover {
  background: #e2e8f0;
}

.nav-dot.current {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
  font-weight: 700;
}

.nav-dot.correct {
  border-color: #10b981;
  background: #ecfdf5;
  color: #047857;
}

.nav-dot.wrong {
  border-color: #ef4444;
  background: #fef2f2;
  color: #b91c1c;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
