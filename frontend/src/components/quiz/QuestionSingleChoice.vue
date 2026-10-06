<script setup>
defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Number, null],
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

/**
 * Selects an option and emits its identifier.
 * @param {string|number} id - Selected option identifier.
 */
function selectOption(id) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="options-grid">
    <button
      v-for="opt in question.options"
      :key="opt.id"
      type="button"
      class="option-card"
      :class="{
        selected: modelValue === opt.id,
        correct: result && opt.isCorrect,
        incorrect: result && modelValue === opt.id && !opt.isCorrect
      }"
      :disabled="disabled"
      @click="selectOption(opt.id)"
    >
      <div class="option-indicator">
        <span class="radio-circle"></span>
      </div>
      <div class="option-content">
        <kbd class="shortcut-badge">{{ opt.label || opt.text }}</kbd>
      </div>
    </button>
  </div>
</template>

<style scoped>
.options-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--color-background-soft, #f7f9fa);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease-in-out;
  color: inherit;
  font-size: 1rem;
}

.option-card:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.option-card.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.option-card.correct {
  border-color: #10b981 !important;
  background: #ecfdf5 !important;
}

.option-card.incorrect {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.option-indicator .radio-circle {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #94a3b8;
  position: relative;
  transition: all 0.15s;
}

.option-card.selected .radio-circle {
  border-color: #2563eb;
  background: #2563eb;
  box-shadow: inset 0 0 0 3px #ffffff;
}

.option-card.correct .radio-circle {
  border-color: #10b981;
  background: #10b981;
  box-shadow: inset 0 0 0 3px #ffffff;
}

.option-card.incorrect .radio-circle {
  border-color: #ef4444;
  background: #ef4444;
  box-shadow: inset 0 0 0 3px #ffffff;
}

.shortcut-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-bottom: 2px solid #94a3b8;
  border-radius: 6px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  color: #1e293b;
}

:disabled {
  cursor: default;
}
</style>
