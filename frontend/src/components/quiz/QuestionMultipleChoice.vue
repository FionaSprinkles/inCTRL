<script setup>
const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
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
 * Toggles an option in the multiple selection set.
 * @param {string|number} id - Option identifier to toggle.
 */
function toggleOption(id) {
  if (props.disabled) return
  const current = [...props.modelValue]
  const idx = current.indexOf(id)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(id)
  }
  emit('update:modelValue', current)
}
</script>

<template>
  <div class="multi-select-container">
    <p v-if="question.instruction" class="instruction-note">
      💡 {{ question.instruction }}
    </p>

    <div class="options-grid">
      <div
        v-for="opt in question.options"
        :key="opt.id"
        class="option-card"
        :class="{
          selected: modelValue.includes(opt.id),
          correct: result && opt.isCorrect,
          missed: result && opt.isCorrect && !modelValue.includes(opt.id),
          incorrect: result && !opt.isCorrect && modelValue.includes(opt.id)
        }"
        @click="toggleOption(opt.id)"
      >
        <div class="checkbox-box">
          <input
            type="checkbox"
            :checked="modelValue.includes(opt.id)"
            :disabled="disabled"
            @click.stop="toggleOption(opt.id)"
          />
        </div>
        <div class="option-details">
          <span class="option-text">{{ opt.text || opt.label }}</span>
        </div>
        <div v-if="result" class="status-indicator">
          <span v-if="opt.isCorrect && modelValue.includes(opt.id)" class="badge-success">✓ Correct</span>
          <span v-else-if="opt.isCorrect && !modelValue.includes(opt.id)" class="badge-missed">⚠ Missed</span>
          <span v-else-if="!opt.isCorrect && modelValue.includes(opt.id)" class="badge-wrong">✕ Wrong</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.multi-select-container {
  margin: 14px 0;
}

.instruction-note {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-main);
  margin-bottom: 12px;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
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
  cursor: pointer;
  color: var(--color-text-main);
  font-family: var(--font-body);
  transition: all 0.3s ease;
}

.option-card:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
  color: var(--color-text-white);
}

.option-card.selected {
  border-color: var(--color-light-accenturate);
  background: rgba(159, 211, 205, 0.22);
  color: var(--color-text-white);
}

.option-card.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.25);
  color: #d1fae5;
}

.option-card.missed {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.22);
  color: #fef3c7;
}

.option-card.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.25);
  color: #fee2e2;
}

.checkbox-box input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-light-accenturate);
}

.option-details {
  flex: 1;
}

.option-text {
  font-size: 1rem;
  font-weight: 500;
  color: inherit;
}

.status-indicator {
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.badge-success {
  color: #6ee7b7;
}
.badge-missed {
  color: #fde68a;
}
.badge-wrong {
  color: #fca5a5;
}
</style>
