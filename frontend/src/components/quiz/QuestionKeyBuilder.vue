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

function addKey(key) {
  if (props.disabled) return
  const next = [...currentKeys.value, key]
  emit('update:modelValue', next)
}

function removeKeyAtIndex(index) {
  if (props.disabled) return
  const next = [...currentKeys.value]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

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
  padding: 16px;
  background: var(--color-background-soft, #f8fafc);
  border: 2px dashed #94a3b8;
  border-radius: 10px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  transition: all 0.2s ease;
}

.combo-tray.tray-correct {
  border: 2px solid #10b981;
  background: #ecfdf5;
}

.combo-tray.tray-wrong {
  border: 2px solid #ef4444;
  background: #fef2f2;
}

.tray-label {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.slotted-keys {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
}

.empty-tray-placeholder {
  color: #94a3b8;
  font-style: italic;
  font-size: 0.95rem;
}

.plus-sign {
  font-size: 1.2rem;
  font-weight: bold;
  color: #64748b;
}

.key-token {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  border-bottom: 3px solid #94a3b8;
  border-radius: 7px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.12s ease;
  user-select: none;
}

.key-token:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: #3b82f6;
  border-bottom-color: #2563eb;
  background: #f8fafc;
}

.key-token:active:not(:disabled) {
  transform: translateY(2px);
  border-bottom-width: 1px;
}

.key-token.slotted {
  background: #eff6ff;
  border-color: #93c5fd;
  border-bottom-color: #3b82f6;
  color: #1d4ed8;
}

.remove-x {
  font-size: 1rem;
  color: #ef4444;
  font-weight: bold;
  line-height: 1;
}

.clear-tray-btn {
  align-self: flex-end;
  padding: 4px 10px;
  font-size: 0.8rem;
  background: #e2e8f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #475569;
}
.clear-tray-btn:hover {
  background: #cbd5e1;
}

.key-bank-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bank-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.key-bank-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.target-reveal {
  font-size: 0.95rem;
  margin-top: 4px;
}

.highlight-target {
  font-family: monospace;
  color: #2563eb;
  padding: 2px 6px;
  background: #eff6ff;
  border-radius: 4px;
}
</style>
