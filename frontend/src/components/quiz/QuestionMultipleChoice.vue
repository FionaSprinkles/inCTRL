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
  font-size: 0.9rem;
  color: #64748b;
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
  padding: 12px 16px;
  background: var(--color-background-soft, #f8fafc);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.option-card:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.option-card.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.option-card.correct {
  border-color: #10b981;
}

.option-card.missed {
  border-color: #f59e0b;
  background: #fffbeb;
}

.option-card.incorrect {
  border-color: #ef4444;
  background: #fef2f2;
}

.checkbox-box input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.option-details {
  flex: 1;
}

.option-text {
  font-size: 0.98rem;
  font-weight: 500;
}

.status-indicator {
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-success {
  color: #10b981;
}
.badge-missed {
  color: #d97706;
}
.badge-wrong {
  color: #ef4444;
}
</style>
