<script setup>
defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [Boolean, null],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  result: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

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
          incorrect: result && modelValue === true && question.correctAnswer === false
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
          incorrect: result && modelValue === false && question.correctAnswer === true
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
  background: var(--color-background-soft, #f8fafc);
  border-left: 4px solid #3b82f6;
  padding: 16px 20px 16px 36px;
  border-radius: 6px;
}

.quote-icon {
  position: absolute;
  left: 10px;
  top: 6px;
  font-size: 2rem;
  line-height: 1;
  color: #94a3b8;
  font-family: Georgia, serif;
}

.statement-text {
  font-size: 1.05rem;
  line-height: 1.5;
  font-weight: 500;
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
  border: 2px solid var(--color-border, #cbd5e1);
  border-radius: 10px;
  background: var(--color-background-soft, #ffffff);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.tf-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.btn-true.selected {
  border-color: #10b981;
  background: #ecfdf5;
  color: #065f46;
}

.btn-false.selected {
  border-color: #ef4444;
  background: #fef2f2;
  color: #991b1b;
}

.btn-true.correct,
.btn-false.correct {
  border-color: #10b981 !important;
  background: #ecfdf5 !important;
  color: #065f46 !important;
}

.btn-true.incorrect,
.btn-false.incorrect {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
  color: #991b1b !important;
}

.tf-icon {
  font-size: 1.3rem;
}
</style>
