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
  gap: 10px;
  flex-wrap: wrap;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-main);
  margin-bottom: 12px;
}

.reset-btn {
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: var(--color-text-main);
  cursor: pointer;
  transition: all 0.15s ease;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  color: var(--color-text-heading);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  background: rgba(15, 76, 92, 0.5);
  border: 1.5px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  color: var(--color-text-heading);
  font-family: var(--font-body);
  transition: all 0.15s ease;
}

.step-card.step-correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.25);
  color: #d1fae5;
}

.step-card.step-incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.25);
  color: #fee2e2;
}

.step-num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-button);
  color: var(--color-button-text);
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  font-size: 0.98rem;
  font-weight: 500;
  color: inherit;
}

.reorder-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.arrow-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 6px;
  padding: 2px 9px;
  font-size: 0.78rem;
  cursor: pointer;
  color: var(--color-text-heading);
  transition: all 0.15s ease;
}

.arrow-btn:hover:not(:disabled) {
  background: var(--color-button);
  border-color: var(--color-button-border);
  color: var(--color-button-text);
}

.arrow-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.step-feedback {
  font-weight: bold;
  font-size: 1.15rem;
}

.icon-correct {
  color: #6ee7b7;
}
.icon-wrong {
  color: #fca5a5;
}
</style>
