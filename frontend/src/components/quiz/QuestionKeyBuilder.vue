<script setup>
import { computed } from 'vue'

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

const currentKeys = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

/**
 * Appends a key token to the built combination.
 * @param {string} key - Key label to append.
 */
function addKey(key) {
  if (props.disabled) return
  const next = [...currentKeys.value, key]
  emit('update:modelValue', next)
}

/**
 * Removes a key token at a specific slot index.
 * @param {number} index - Index of key token to remove.
 */
function removeKeyAtIndex(index) {
  if (props.disabled) return
  const next = [...currentKeys.value]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

/**
 * Clears all key tokens from the combination.
 */
function clearAll() {
  if (props.disabled) return
  emit('update:modelValue', [])
}
</script>

<template>
  <div class="key-builder">
    <!-- Active Combo Slots -->
    <div
      class="combo-tray"
      :class="{
        'tray-correct': result && result.isCorrect,
        'tray-wrong': result && !result.isCorrect
      }"
    >
      <div class="tray-label">Your Combination:</div>
      <div class="slotted-keys">
        <template v-if="currentKeys.length > 0">
          <template v-for="(key, idx) in currentKeys" :key="idx">
            <span v-if="idx > 0" class="plus-sign">+</span>
            <button
              type="button"
              class="key-token slotted"
              :disabled="disabled"
              title="Click to remove"
              @click="removeKeyAtIndex(idx)"
            >
              {{ key }}
              <span v-if="!disabled" class="remove-x">×</span>
            </button>
          </template>
        </template>
        <div v-else class="empty-tray-placeholder">
          Click keys from the bank below to construct the shortcut...
        </div>
      </div>

      <button
        v-if="currentKeys.length > 0 && !disabled"
        type="button"
        class="clear-tray-btn"
        @click="clearAll"
      >
        Clear
      </button>
    </div>

    <!-- Scrambled Key Bank -->
    <div class="key-bank-section">
      <div class="bank-label">Key Bank (click to add):</div>
      <div class="key-bank-grid">
        <button
          v-for="(key, i) in question.keyBank"
          :key="i"
          type="button"
          class="key-token bank-key"
          :disabled="disabled"
          @click="addKey(key)"
        >
          {{ key }}
        </button>
      </div>
    </div>

    <!-- Review feedback -->
    <div v-if="result" class="target-reveal">
      Target Shortcut:
      <strong class="highlight-target">{{ question.targetCombo.join(' + ') }}</strong>
    </div>
  </div>
</template>

<style scoped>
.key-builder {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.combo-tray {
  padding: 16px 18px;
  background: rgba(15, 76, 92, 0.5);
  border: 1.5px dashed rgba(255, 255, 255, 0.35);
  border-radius: 14px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  transition: all 0.2s ease;
}

.combo-tray.tray-correct {
  border: 2px solid #10b981;
  background: rgba(16, 185, 129, 0.22);
}

.combo-tray.tray-wrong {
  border: 2px solid #ef4444;
  background: rgba(239, 68, 68, 0.22);
}

.tray-label {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-main);
}

.slotted-keys {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
}

.empty-tray-placeholder {
  color: rgba(242, 229, 208, 0.7);
  font-family: var(--font-body);
  font-style: italic;
  font-size: 0.95rem;
}

.plus-sign {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-text-heading);
}

.key-token {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(15, 76, 92, 0.75);
  color: var(--color-text-heading);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-bottom: 3px solid rgba(255, 255, 255, 0.45);
  border-radius: 8px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.12s ease;
  user-select: none;
}

.key-token:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: var(--color-button);
  background: rgba(255, 255, 255, 0.2);
}

.key-token:active:not(:disabled) {
  transform: translateY(2px);
  border-bottom-width: 1px;
}

.key-token.slotted {
  background: var(--color-button);
  border-color: var(--color-button-border);
  border-bottom-color: #b8b096;
  color: var(--color-button-text);
}

.key-token.slotted:hover:not(:disabled) {
  background: var(--color-button-hover);
}

.remove-x {
  font-size: 1rem;
  color: #991b1b;
  font-weight: bold;
  line-height: 1;
}

.clear-tray-btn {
  align-self: flex-end;
  padding: 5px 12px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-main);
  transition: all 0.15s ease;
}

.clear-tray-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  color: var(--color-text-heading);
}

.key-bank-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bank-label {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text-main);
}

.key-bank-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.target-reveal {
  font-family: var(--font-body);
  font-size: 0.95rem;
  margin-top: 4px;
  color: var(--color-text-main);
}

.highlight-target {
  font-family: 'Consolas', 'Courier New', monospace;
  color: var(--color-button);
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
}
</style>
