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
  border-left: 4px solid var(--color-light-accenturate);
  padding: 18px 22px 18px 40px;
  border-radius: 12px;
}

.quote-icon {
  position: absolute;
  left: 12px;
  top: 6px;
  font-size: 2.2rem;
  line-height: 1;
  color: var(--color-light-accenturate);
  font-family: var(--font-heading);
}

.statement-text {
  font-family: var(--font-body);
  font-size: 1.08rem;
  line-height: 1.5;
  font-weight: 450;
  color: var(--color-text-white);
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
  background: linear-gradient(180deg, rgba(10, 40, 50, 0.7) 0%, rgba(10, 40, 50, 0.5) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  color: var(--color-text-main);
  font-family: var(--font-display);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 2px;
}

.tf-btn:hover:not(:disabled) {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
  color: var(--color-text-white);
}

.tf-btn.selected {
  border-color: var(--color-light-accenturate);
  background: rgba(159, 211, 205, 0.24);
  color: var(--color-text-white);
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

@media (max-width: 480px) {
  .tf-actions {
    grid-template-columns: 1fr;
  }
}
</style>
