<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import QuestionSingleChoice from './QuestionSingleChoice.vue'
import QuestionMultipleChoice from './QuestionMultipleChoice.vue'
import QuestionFillBlank from './QuestionFillBlank.vue'
import QuestionKeyBuilder from './QuestionKeyBuilder.vue'
import QuestionMatching from './QuestionMatching.vue'
import QuestionOrdering from './QuestionOrdering.vue'
import QuestionTrueFalse from './QuestionTrueFalse.vue'
import QuestionLivePress from './QuestionLivePress.vue'
import QuestionOddOneOut from './QuestionOddOneOut.vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  savedAnswer: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null,
  },
  savedResult: {
    type: Object,
    default: null,
  },
  questionNumber: {
    type: Number,
    default: 1,
  },
  totalQuestions: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['answered', 'update:answer', 'retry', 'next', 'previous'])

const userAnswer = ref(null)
const evaluationResult = ref(null)
const showHint = ref(false)
const isOrderingTouched = ref(false)
let isInitializing = false

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
  odd_one_out: QuestionOddOneOut,
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
  odd_one_out: 'Spot The Imposter',
}

// When question changes, reset or load saved answer
watch(
  () => props.question.id,
  () => {
    isInitializing = true
    isOrderingTouched.value = props.savedAnswer !== null && props.savedAnswer !== undefined
    userAnswer.value = props.savedAnswer ?? getInitialAnswer(props.question)
    evaluationResult.value = props.savedResult || null
    showHint.value = false
    nextTick(() => {
      isInitializing = false
    })
  },
  { immediate: true },
)

// Emit answer changes so parent keeps state in real time, excluding initializations
watch(
  userAnswer,
  (newVal) => {
    if (isInitializing) return
    if (props.question.type === 'ordering' && !isOrderingTouched.value) {
      isOrderingTouched.value = true
    }
    if (newVal !== undefined) {
      emit('update:answer', {
        questionId: props.question.id,
        userAnswer: newVal,
      })
    }
  },
  { deep: true },
)

/**
 * Computes default initial empty answer for question according to its format type.
 * @param {object} q - Question definition object.
 * @returns {any} Initial empty answer shape.
 */
function getInitialAnswer(q) {
  if (q.type === 'multiple_choice' || q.type === 'key_builder' || q.type === 'live_press') return []
  if (q.type === 'matching') return {}
  if (q.type === 'ordering') return (q.items || []).map((i) => i.id).reverse()
  if (q.type === 'fill_blank') return ''
  return null
}

const hasAnswer = computed(() => {
  if (userAnswer.value === null || userAnswer.value === undefined) return false
  if (props.question.type === 'ordering') {
    return isOrderingTouched.value && Array.isArray(userAnswer.value) && userAnswer.value.length > 0
  }
  if (typeof userAnswer.value === 'string') return userAnswer.value.trim().length > 0
  if (Array.isArray(userAnswer.value)) return userAnswer.value.length > 0
  if (typeof userAnswer.value === 'object') return Object.keys(userAnswer.value).length > 0
  return true
})

/**
 * Advances to the next question, saving the current answer if present.
 */
function handleNext() {
  if (hasAnswer.value) {
    emit('update:answer', {
      questionId: props.question.id,
      userAnswer: userAnswer.value,
    })
  }
  emit('next')
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
        <span
          v-if="question.difficulty"
          class="badge difficulty-badge"
          :class="question.difficulty.toLowerCase()"
        >
          {{ question.difficulty }}
        </span>
      </div>

      <div class="progress-pill">Question {{ questionNumber }} of {{ totalQuestions }}</div>
    </div>

    <!-- Question Prompt -->
    <h2 class="question-prompt">{{ question.prompt }}</h2>

    <!-- Hint Section -->
    <div v-if="question.hint" class="hint-container">
      <button v-if="!showHint" type="button" class="hint-toggle-btn" @click="showHint = true">
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
        <button type="button" class="btn btn-primary" @click="handleNext">
          {{ questionNumber < totalQuestions ? 'Next Question →' : 'See Results' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-card {
  width: 100%;
  box-sizing: border-box;
  background: rgba(18, 86, 98, 0.52);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: var(--color-text-main);
  font-family: var(--font-body), sans-serif;
  transition: all 0.2s ease;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-family: var(--font-display), serif;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
}

.format-badge {
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-text-main);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.category-badge {
  background: rgba(133, 180, 190, 0.28);
  color: var(--color-text-heading);
  border: 1px solid rgba(133, 180, 190, 0.45);
}

.difficulty-badge.beginner {
  background: rgba(16, 185, 129, 0.28);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.45);
}

.difficulty-badge.intermediate {
  background: rgba(245, 158, 11, 0.28);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.45);
}

.difficulty-badge.advanced {
  background: rgba(239, 68, 68, 0.28);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.45);
}

.progress-pill {
  font-family: var(--font-display), serif;
  color: var(--color-text-main);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 4px 12px;
  border-radius: 20px;
}

.question-prompt {
  font-family: var(--font-heading), serif;
  font-size: 1.55rem;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: 0px;
  color: var(--color-text-white);
  margin: 6px 0;
  text-transform: none;
}

.hint-container {
  font-size: 0.95rem;
}

.hint-toggle-btn {
  font-family: var(--font-display), serif;
  background: rgba(255, 255, 255, 0.08);
  border: 1px dashed rgba(255, 255, 255, 0.35);
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition: all 0.2s;
  color: var(--color-text-main);
}

.hint-toggle-btn:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: all 0.3s ease;
}

.hint-content {
  background: rgba(56, 189, 248, 0.15);
  border-left: 3px solid #38bdf8;
  padding: 8px 14px;
  border-radius: 6px;
  color: var(--color-text-main);
  font-family: var(--font-body), sans-serif;
  font-size: 0.95rem;
}

.hint-label {
  font-weight: 700;
  color: var(--color-text-main);
}

.interactive-area {
  margin: 8px 0;
}

.feedback-box {
  padding: 16px 18px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.box-success {
  background: rgba(16, 185, 129, 0.22);
  border: 1.5px solid #10b981;
  color: #d1fae5;
}

.box-danger {
  background: rgba(239, 68, 68, 0.22);
  border: 1.5px solid #ef4444;
  color: #fee2e2;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display), serif;
  font-weight: 600;
  font-size: 1.15rem;
  letter-spacing: 0.5px;
}

.explanation-body {
  font-family: var(--font-body), sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-text-heading);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 8px;
}

.explanation-body p {
  margin: 4px 0 0;
  color: var(--color-text-main);
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.btn {
  font-family: var(--font-display), serif;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  font-family: var(--font-display), serif;
  font-size: 16px;
  letter-spacing: 1px;
  font-weight: 450;
  padding: 9px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-main);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: all 0.3s ease;
}

.btn-secondary {
  font-family: var(--font-display), serif;
  font-size: 16px;
  letter-spacing: 1px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-main);
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.btn-secondary:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: all 0.3s ease;
}

/* Deep stylings for child question format components */
:deep(.option-card) {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.22) !important;
  color: var(--color-text-main) !important;
  border-radius: 12px !important;
  font-family: var(--font-body), sans-serif;
}

:deep(.option-card:hover:not(:disabled)) {
  background: rgba(255, 255, 255, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.45) !important;
}

:deep(.option-card.selected) {
  background: rgba(227, 221, 196, 0.22) !important;
  border-color: var(--color-light-accenturate) !important;
  color: var(--color-text-white) !important;
}

:deep(.option-card.correct) {
  background: rgba(16, 185, 129, 0.25) !important;
  border-color: #10b981 !important;
  color: #a7f3d0 !important;
}

:deep(.option-card.incorrect) {
  background: rgba(239, 68, 68, 0.25) !important;
  border-color: #ef4444 !important;
  color: #fecaca !important;
}

:deep(.shortcut-badge),
:deep(kbd) {
  font-family: 'Consolas', 'Courier New', monospace !important;
  background: rgba(0, 0, 0, 0.28) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-bottom: 2px solid rgba(255, 255, 255, 0.35) !important;
  border-radius: 6px !important;
  padding: 4px 10px !important;
  color: var(--color-text-main) !important;
}

:deep(.text-input) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.25) !important;
  color: var(--color-text-white) !important;
  font-family: var(--font-body), sans-serif !important;
  border-radius: 8px !important;
}

:deep(.text-input::placeholder) {
  color: var(--color-light-accenturate) !important;
}

:deep(.key-cap),
:deep(.key-token),
:deep(.virtual-key),
:deep(.draggable-item),
:deep(.match-pill) {
  font-family: 'Consolas', 'Courier New', monospace !important;
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: var(--color-text-white) !important;
}

:deep(.tray-container),
:deep(.key-bank),
:deep(.keyboard-visualizer),
:deep(.matching-board),
:deep(.sequence-list) {
  background: rgba(0, 0, 0, 0.18) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 12px !important;
}
</style>