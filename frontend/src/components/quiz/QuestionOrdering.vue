<script setup>
import { computed, onMounted } from 'vue'

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

// If modelValue is empty on mount, initialize with a scrambled order of question.items
onMounted(() => {
  if (!props.modelValue || props.modelValue.length === 0) {
    initScrambledOrder()
  }
})

/**
 * Emits initial scrambled sequence order for the question items.
 */
function initScrambledOrder() {
  const ids = (props.question.items || []).map(i => i.id)
  // Scramble deterministically (reverse or offset)
  const scrambled = [...ids].reverse()
  // Ensure it's not accidentally identical to the correct order if there are > 1 items
  if (props.question.correctOrder && scrambled.join(',') === props.question.correctOrder.join(',')) {
    if (scrambled.length > 1) {
      const temp = scrambled[0]
      scrambled[0] = scrambled[1]
      scrambled[1] = temp
    }
  }
  emit('update:modelValue', scrambled)
}

const currentOrder = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    return props.modelValue
  }
  return (props.question.items || []).map(i => i.id)
})

/**
 * Finds item definition object by ID.
 * @param {string} id - Item identifier.
 * @returns {object} Item object.
 */
function getItem(id) {
  return (props.question.items || []).find(i => i.id === id) || { id, text: id }
}

/**
 * Swaps item with the preceding item to move it earlier in the sequence.
 * @param {number} index - Item index in current order.
 */
function moveUp(index) {
  if (props.disabled || index === 0) return
  const next = [...currentOrder.value]
  const temp = next[index - 1]
  next[index - 1] = next[index]
  next[index] = temp
  emit('update:modelValue', next)
}

/**
 * Swaps item with the following item to move it later in the sequence.
 * @param {number} index - Item index in current order.
 */
function moveDown(index) {
  if (props.disabled || index >= currentOrder.value.length - 1) return
  const next = [...currentOrder.value]
  const temp = next[index + 1]
  next[index + 1] = next[index]
  next[index] = temp
  emit('update:modelValue', next)
}

/**
 * Resets item sequence back to initial scrambled order.
 */
function resetOrder() {
  if (props.disabled) return
  initScrambledOrder()
}

/**
 * Checks whether an item at a specific index matches the correct sequence order.
 * @param {string} id - Item ID.
 * @param {number} index - Position index.
 * @returns {boolean} True if correctly positioned.
 */
function isStepCorrect(id, index) {
  return props.question.correctOrder && props.question.correctOrder[index] === id
}
</script>

<template>
  <div class="ordering-container">
    <div class="ordering-header">
      <span class="instructions">Use the arrows to place the steps in the correct order:</span>
      <button
        v-if="!disabled"
        type="button"
        class="reset-btn"
        @click="resetOrder"
      >
        Shuffle Again
      </button>
    </div>

    <div class="steps-list">
      <div
        v-for="(id, idx) in currentOrder"
        :key="id"
        class="step-card"
        :class="{
          'step-correct': result && isStepCorrect(id, idx),
          'step-incorrect': result && !isStepCorrect(id, idx)
        }"
      >
        <div class="step-num">{{ idx + 1 }}</div>
        <div class="step-text">{{ getItem(id).text }}</div>

        <div v-if="!disabled" class="reorder-actions">
          <button
            type="button"
            class="arrow-btn"
            :disabled="idx === 0"
            title="Move Step Up"
            @click="moveUp(idx)"
          >
            ▲
          </button>
          <button
            type="button"
            class="arrow-btn"
            :disabled="idx === currentOrder.length - 1"
            title="Move Step Down"
            @click="moveDown(idx)"
          >
            ▼
          </button>
        </div>

        <div v-if="result" class="step-feedback">
          <span v-if="isStepCorrect(id, idx)" class="icon-correct">✓</span>
          <span v-else class="icon-wrong">✕</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ordering-container {
  margin: 16px 0;
}

.ordering-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 12px;
}

.reset-btn {
  padding: 4px 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-background-soft, #f8fafc);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  transition: all 0.15s ease;
}

.step-card.step-correct {
  border-color: #10b981;
  background: #ecfdf5;
}

.step-card.step-incorrect {
  border-color: #ef4444;
  background: #fef2f2;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
}

.reorder-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.arrow-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  color: #475569;
}
.arrow-btn:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}
.arrow-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.step-feedback {
  font-weight: bold;
  font-size: 1.1rem;
}

.icon-correct {
  color: #10b981;
}
.icon-wrong {
  color: #ef4444;
}
</style>
