<script setup>
import { ref, computed, watch } from 'vue'
import QuestionSingleChoice from './QuestionSingleChoice.vue'
import QuestionMultipleChoice from './QuestionMultipleChoice.vue'
import QuestionFillBlank from './QuestionFillBlank.vue'
import QuestionKeyBuilder from './QuestionKeyBuilder.vue'
import QuestionMatching from './QuestionMatching.vue'
import QuestionOrdering from './QuestionOrdering.vue'
import QuestionTrueFalse from './QuestionTrueFalse.vue'
import QuestionLivePress from './QuestionLivePress.vue'
import QuestionOddOneOut from './QuestionOddOneOut.vue'
import { validateAnswer } from '../../services/quizValidator'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  savedAnswer: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null
  },
  savedResult: {
    type: Object,
    default: null
  },
  questionNumber: {
    type: Number,
    default: 1
  },
  totalQuestions: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['answered', 'retry', 'next', 'previous'])

const userAnswer = ref(null)
const evaluationResult = ref(null)
const showHint = ref(false)

// Map question.type to component
const componentMap = {
  single_choice: QuestionSingleChoice,
  multiple_choice: QuestionMultipleChoice,
  fill_blank: QuestionFillBlank,
  key_builder: QuestionKeyBuilder,
  matching: QuestionMatching,
  ordering: QuestionOrdering,
  true_false: QuestionTrueFalse,
  live_press: QuestionLivePress,
  odd_one_out: QuestionOddOneOut
}

const currentComponent = computed(() => {
  return componentMap[props.question.type] || QuestionSingleChoice
})

// Format label helper
const formatLabels = {
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Select',
  fill_blank: 'Fill In The Box',
  key_builder: 'Key Combo Builder',
  matching: 'Matching Pairs',
  ordering: 'Step Sequence',
  true_false: 'True or False',
  live_press: 'Live Keyboard Press',
  odd_one_out: 'Spot The Imposter'
}

// When question changes, reset or load saved answer
watch(
  () => props.question.id,
  () => {
    userAnswer.value = props.savedAnswer ?? getInitialAnswer(props.question)
    evaluationResult.value = props.savedResult || null
    showHint.value = false
  },
  { immediate: true }
)

function getInitialAnswer(q) {
  if (q.type === 'multiple_choice' || q.type === 'key_builder' || q.type === 'live_press') return []
  if (q.type === 'matching') return {}
  if (q.type === 'ordering') return (q.items || []).map(i => i.id).reverse()
  if (q.type === 'fill_blank') return ''
  return null
}

const hasAnswer = computed(() => {
  if (userAnswer.value === null || userAnswer.value === undefined) return false
  if (typeof userAnswer.value === 'string') return userAnswer.value.trim().length > 0
  if (Array.isArray(userAnswer.value)) return userAnswer.value.length > 0
  if (typeof userAnswer.value === 'object') return Object.keys(userAnswer.value).length > 0
  return true
})

function checkAnswer() {
  const result = validateAnswer(props.question, userAnswer.value)
  evaluationResult.value = result
  emit('answered', {
    questionId: props.question.id,
    userAnswer: userAnswer.value,
    result
  })
}

function retryQuestion() {
  evaluationResult.value = null
  userAnswer.value = getInitialAnswer(props.question)
  emit('retry', { questionId: props.question.id })
}
</script>

<template>
  <div class="quiz-card">
    <!-- Card Header / Meta info -->
    <div class="card-meta">
      <div class="tags-row">
        <span class="badge format-badge">
          {{ formatLabels[question.type] || question.type }}
        </span>
        <span v-if="question.category" class="badge category-badge">
          {{ question.category }}
        </span>
        <span v-if="question.difficulty" class="badge difficulty-badge" :class="question.difficulty.toLowerCase()">
          {{ question.difficulty }}
        </span>
      </div>

      <div class="progress-pill">
        Question {{ questionNumber }} of {{ totalQuestions }}
      </div>
    </div>

    <!-- Question Prompt -->
    <h2 class="question-prompt">{{ question.prompt }}</h2>

    <!-- Hint Section -->
    <div v-if="question.hint" class="hint-container">
      <button
        v-if="!showHint"
        type="button"
        class="hint-toggle-btn"
        @click="showHint = true"
      >
        💡 Show Hint
      </button>
      <div v-else class="hint-content">
        <span class="hint-label">Hint:</span> {{ question.hint }}
      </div>
    </div>

    <!-- Dynamic Question Format Component -->
    <div class="interactive-area">
      <component
        :is="currentComponent"
        v-model="userAnswer"
        :question="question"
        :disabled="!!evaluationResult"
        :result="evaluationResult"
      />
    </div>

    <!-- Feedback and Explanation Block -->
    <div
      v-if="evaluationResult"
      class="feedback-box"
      :class="evaluationResult.isCorrect ? 'box-success' : 'box-danger'"
    >
      <div class="feedback-header">
        <span class="status-icon">{{ evaluationResult.isCorrect ? '🎉' : '❌' }}</span>
        <span class="feedback-text">{{ evaluationResult.feedback }}</span>
      </div>
      <div v-if="question.explanation" class="explanation-body">
        <strong>Explanation:</strong>
        <p>{{ question.explanation }}</p>
      </div>
    </div>

    <!-- Action Toolbar -->
    <div class="card-actions">
      <div class="left-actions">
        <button
          v-if="questionNumber > 1"
          type="button"
          class="btn btn-secondary"
          @click="$emit('previous')"
        >
          ← Previous
        </button>
      </div>

      <div class="right-actions">
        <button
          v-if="evaluationResult && !evaluationResult.isCorrect"
          type="button"
          class="btn btn-outline"
          @click="retryQuestion"
        >
          Try Again
        </button>

        <button
          v-if="!evaluationResult"
          type="button"
          class="btn btn-primary"
          :disabled="!hasAnswer"
          @click="checkAnswer"
        >
          Check Answer
        </button>

        <button
          v-else
          type="button"
          class="btn btn-primary"
          @click="$emit('next')"
        >
          {{ questionNumber < totalQuestions ? 'Next Question →' : 'See Results' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-card {
  background: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.format-badge {
  background: #ede9fe;
  color: #6d28d9;
}

.category-badge {
  background: #f1f5f9;
  color: #475569;
}

.difficulty-badge.beginner {
  background: #dcfce7;
  color: #15803d;
}

.difficulty-badge.intermediate {
  background: #fef3c7;
  color: #b45309;
}

.difficulty-badge.advanced {
  background: #fee2e2;
  color: #b91c1c;
}

.progress-pill {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.question-prompt {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-heading, #0f172a);
  line-height: 1.4;
  margin: 4px 0;
}

.hint-container {
  font-size: 0.9rem;
}

.hint-toggle-btn {
  background: none;
  border: 1px dashed #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
}

.hint-toggle-btn:hover {
  background: #f8fafc;
  color: #2563eb;
  border-color: #93c5fd;
}

.hint-content {
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  padding: 8px 12px;
  border-radius: 4px;
  color: #92400e;
  font-size: 0.9rem;
}

.hint-label {
  font-weight: 700;
}

.interactive-area {
  margin: 6px 0;
}

.feedback-box {
  padding: 16px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.box-success {
  background: #ecfdf5;
  border: 1.5px solid #10b981;
  color: #065f46;
}

.box-danger {
  background: #fef2f2;
  border: 1.5px solid #ef4444;
  color: #991b1b;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1.05rem;
}

.explanation-body {
  font-size: 0.92rem;
  line-height: 1.5;
  color: #334155;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 8px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border, #f1f5f9);
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-outline {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-outline:hover {
  background: #f8fafc;
}
</style>
