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
  background: rgba(15, 76, 92, 0.5);
  border: 1.5px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease-in-out;
  color: var(--color-text-main);
  font-family: var(--font-body);
  font-size: 1rem;
}

.option-card:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(15, 76, 92, 0.75);
  color: var(--color-text-heading);
}

.option-card.selected {
  border-color: var(--color-button);
  background: rgba(227, 221, 196, 0.22);
  color: var(--color-text-heading);
}

.option-card.correct {
  border-color: #10b981 !important;
  background: rgba(16, 185, 129, 0.25) !important;
  color: #d1fae5 !important;
}

.option-card.incorrect {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.25) !important;
  color: #fee2e2 !important;
}

.option-indicator .radio-circle {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--color-text-muted);
  position: relative;
  transition: all 0.15s;
}

.option-card.selected .radio-circle {
  border-color: var(--color-button);
  background: var(--color-button);
  box-shadow: inset 0 0 0 3px var(--color-dark-teal);
}

.option-card.correct .radio-circle {
  border-color: #10b981;
  background: #10b981;
  box-shadow: inset 0 0 0 3px var(--color-dark-teal);
}

.option-card.incorrect .radio-circle {
  border-color: #ef4444;
  background: #ef4444;
  box-shadow: inset 0 0 0 3px var(--color-dark-teal);
}

.shortcut-badge {
  display: inline-block;
  padding: 5px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  color: var(--color-button);
}

:disabled {
  cursor: default;
}
</style>
