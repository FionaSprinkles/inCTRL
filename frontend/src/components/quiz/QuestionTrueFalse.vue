<script setup>
defineProps({
  question: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [Boolean, null],
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  result: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

/**
 * Sets boolean true/false answer and emits updated modelValue.
 * @param {boolean} val - Selected boolean answer value.
 */
function setAnswer(val) {
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="true-false-container">
    <div class="statement-card">
      <div class="quote-icon">“</div>
      <p class="statement-text">{{ question.statement }}</p>
    </div>

    <div class="tf-actions">
      <!-- TRUE BUTTON -->
      <button
        type="button"
        class="tf-btn btn-true"
        :class="{
          selected: modelValue === true,
          correct: result && question.correctAnswer === true,
          incorrect: result && modelValue === true && question.correctAnswer === false,
        }"
        :disabled="disabled"
        @click="setAnswer(true)"
      >
        <span class="tf-icon">✓</span>
        <span class="tf-label">TRUE</span>
      </button>

      <!-- FALSE BUTTON -->
      <button
        type="button"
        class="tf-btn btn-false"
        :class="{
          selected: modelValue === false,
          correct: result && question.correctAnswer === false,
          incorrect: result && modelValue === false && question.correctAnswer === true,
        }"
        :disabled="disabled"
        @click="setAnswer(false)"
      >
        <span class="tf-icon">✕</span>
        <span class="tf-label">FALSE</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.true-false-container {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.statement-card {
  position: relative;
  background: rgba(15, 76, 92, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-left: 4px solid var(--color-button);
  padding: 18px 22px 18px 40px;
  border-radius: 12px;
}

.quote-icon {
  position: absolute;
  left: 12px;
  top: 6px;
  font-size: 2.2rem;
  line-height: 1;
  color: var(--color-button);
  font-family: var(--font-heading);
}

.statement-text {
  font-family: var(--font-body);
  font-size: 1.08rem;
  line-height: 1.5;
  font-weight: 450;
  color: var(--color-text-heading);
  margin: 0;
}

.tf-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.tf-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.26);
  border-radius: 12px;
  background: rgba(15, 76, 92, 0.5);
  color: var(--color-text-main);
  font-family: var(--font-display);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 2px;
}

.tf-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(15, 76, 92, 0.78);
  color: var(--color-text-heading);
  transform: translateY(-1px);
}

.tf-btn.selected {
  border-color: var(--color-button);
  background: rgba(227, 221, 196, 0.24);
  color: var(--color-text-heading);
}

.btn-true.correct,
.btn-false.correct {
  border-color: #10b981 !important;
  background: rgba(16, 185, 129, 0.25) !important;
  color: #d1fae5 !important;
}

.btn-true.incorrect,
.btn-false.incorrect {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.25) !important;
  color: #fee2e2 !important;
}

.tf-icon {
  font-size: 1.3rem;
}
</style>
