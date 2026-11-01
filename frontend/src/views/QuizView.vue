<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchQuizById, submitQuizAttempt } from '@/services/quizService'
import { evaluateQuestionWithPoints, isAnswerProvided } from '@/services/quizValidator'
import QuizCard from '@/components/quiz/QuizCard.vue'
import QuizSummary from '@/components/quiz/QuizSummary.vue'
import QuizLoading from '@/components/quiz/QuizLoading.vue'

const route = useRoute()
const router = useRouter()

const activeQuiz = ref(null)
const quizQuestions = ref([])
const loadingQuestions = ref(false)
const quizError = ref('')
const submitError = ref('')
const currentIndex = ref(0)
const userAnswers = ref({})
const evalResults = ref({})
const questionTimes = ref({})
const isCompleted = ref(false)
const isSubmitted = ref(false)

const elapsedSeconds = ref(0)
const startedAt = ref(null)
const activeQuestionEnteredAt = ref(null)
let timerInterval = null
const isReviewMode = ref(false)

function recordCurrentQuestionTime(questionId) {
  if (isCompleted.value || isReviewMode.value || !activeQuestionEnteredAt.value || !questionId) {
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

const currentQuestion = computed(() => quizQuestions.value[currentIndex.value] || null)
const totalScore = computed(() =>
  Object.values(evalResults.value).reduce((s, r) => s + (r?.score || 0), 0),
)
const answeredCount = computed(
  () => quizQuestions.value.filter((q) => isQuestionAnswered(q.id)).length,
)

watch(currentIndex, (newIdx, oldIdx) => {
  if (isCompleted.value || isReviewMode.value) return
  const prevQuestion = quizQuestions.value[oldIdx]
  if (prevQuestion) {
    recordCurrentQuestionTime(prevQuestion.id)
  } else {
    activeQuestionEnteredAt.value = Date.now()
  }
})

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
  questionTimes.value = {}
  isCompleted.value = false
  isSubmitted.value = false
  isReviewMode.value = false
  stopTimer()
  elapsedSeconds.value = 0
  activeQuestionEnteredAt.value = null

  try {
    const data = await fetchQuizById(quiz.id)
    if (requestId !== quizRequestId) return
    if (!data?.questions?.length) throw new Error('No questions found for this quiz.')
    if (activeQuiz.value) {
      if (data.title) activeQuiz.value.title = data.title
      if (data.difficulty) activeQuiz.value.difficulty = data.difficulty
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
  router.replace('/categories')
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
    finalAnswers[q.id] = isQuestionAnswered(q.id)
      ? userAnswers.value[q.id]
      : null
  })
  return finalAnswers
}

async function finishQuiz() {
  const myAttempt = attemptId
  if (currentQuestion.value) {
    recordCurrentQuestionTime(currentQuestion.value.id)
  }
  stopTimer()
  activeQuestionEnteredAt.value = null
  if (startedAt.value) {
    elapsedSeconds.value = Math.max(0, Math.floor((Date.now() - startedAt.value) / 1000))
  }
  isCompleted.value = true
  isReviewMode.value = false

  const finalAnswers = getFinalAnswers()

  const results = {}
  quizQuestions.value.forEach((q) => {
    const qTime = questionTimes.value[q.id] ?? 0
    results[q.id] = evaluateQuestionWithPoints(q, finalAnswers[q.id], {
      timeSpentSeconds: qTime,
      difficulty: q.difficulty || activeQuiz.value?.difficulty || 'Beginner',
    })
  })
  evalResults.value = results

  if (!isSubmitted.value) {
    try {
      await submitQuizAttempt({
        quizId: activeQuiz.value?.id,
        answers: finalAnswers,
        formatFilter: 'all',
        timeSpentSeconds: elapsedSeconds.value,
        questionTimes: questionTimes.value,
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
      questionTimes: questionTimes.value,
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
  questionTimes.value = {}
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

watch(
  () => route.query.id || route.query.quizId,
  (quizId) => {
    if (!quizId) {
      router.replace('/categories')
      return
    }
    startQuiz({ id: quizId, title: `Quiz #${quizId}` })
  },
  { immediate: true },
)

onUnmounted(stopTimer)
</script>

<template>
  <div class="quiz-page">
    <div v-if="activeQuiz" class="quiz-runner-view">
      <header v-if="!isCompleted || isReviewMode" class="runner-bar">
        <div class="runner-header-top">
          <div class="runner-left">
            <button
              v-if="isReviewMode"
              type="button"
              class="btn-back"
              @click="returnToSummary"
            >
              ← Back to Summary
            </button>
            <button
              v-else
              type="button"
              class="btn-back"
              @click="exitQuiz"
            >
              ← Back to Quizzes
            </button>
          </div>

          <h2 class="runner-title">{{ activeQuiz.title }}</h2>

          <div class="runner-stats">
            <span class="timer-display" title="Quiz Timer">
              ⏱️ <strong>{{ formattedTimer }}</strong>
            </span>
            <span class="progress-display">
              Answered: <strong>{{ answeredCount }}</strong> / {{ quizQuestions.length }}
            </span>
          </div>
        </div>

        <!-- Question jump numbers centered with the nav bar so they stay stationary -->
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

      <div v-else-if="quizError && !isCompleted && !isReviewMode" class="status-box error-box" role="alert">
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
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  box-sizing: border-box;
  font-family: var(--font-body);
}

.quiz-runner-view {
  width: 100%;
}

.status-box {
  padding: 2.5rem 1.5rem;
  text-align: center;
  background: rgba(18, 86, 98, 0.5);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.error-box {
  border-color: #ef4444;
  color: #fecaca;
  background: rgba(127, 29, 29, 0.45);
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error-message {
  font-family: var(--font-body);
  font-size: 1rem;
  color: #fecaca;
  margin-bottom: 1rem;
}

.btn-retry {
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  border: 1px solid var(--color-button-border);
  font-weight: 600;
  cursor: pointer;
}

.summary-error {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
}

/* Unified top runner bar: stationary width & centered page numbers aligned with NavBar */
.runner-bar {
  width: 100%;
  box-sizing: border-box;
  background: rgba(18, 86, 98, 0.52);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 1.1rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.runner-header-top {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

.runner-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.runner-title {
  font-family: var(--font-heading);
  font-size: 1.45rem;
  font-weight: 400;
  color: var(--color-text-heading);
  margin: 0;
  letter-spacing: 0.5px;
  text-transform: none;
  text-align: center;
}

.runner-stats {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.85rem;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .runner-header-top {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
  .runner-left,
  .runner-stats {
    justify-content: center;
  }
}

.timer-display {
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
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
  color: var(--color-text-heading);
}

.progress-display {
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
  font-size: 0.92rem;
  color: var(--color-text-main);
}

.progress-display strong {
  color: var(--color-text-heading);
}

.btn-back {
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 1px;
  color: var(--color-text-main);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.28);
  padding: 0.45rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-heading);
  border-color: rgba(255, 255, 255, 0.45);
}

/* Navigation page numbers centered with the NavBar and stationary */
.question-dots-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.dot-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(15, 76, 92, 0.45);
  color: var(--color-text-main);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.dot-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  color: var(--color-text-heading);
  border-color: rgba(255, 255, 255, 0.45);
}

.dot-btn.current {
  border-color: var(--color-button-border);
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 700;
}

.dot-btn.answered:not(.current):not(.correct):not(.wrong) {
  border-color: rgba(227, 221, 196, 0.5);
  background: rgba(227, 221, 196, 0.22);
  color: var(--color-text-heading);
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
  box-sizing: border-box;
}

.summary-wrapper {
  width: 100%;
  box-sizing: border-box;
}

.summary-exit-bar {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.summary-exit-bar .btn-secondary {
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: 1px;
  padding: 0.65rem 1.4rem;
  border-radius: 12px;
  background: rgba(18, 86, 98, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: var(--color-text-main);
  cursor: pointer;
  transition: all 0.2s ease;
}

.summary-exit-bar .btn-secondary:hover {
  background: rgba(18, 86, 98, 0.75);
  color: var(--color-text-heading);
  border-color: rgba(255, 255, 255, 0.45);
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
}
</style>
