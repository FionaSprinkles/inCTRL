<script setup>
const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
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

function onInput(e) {
  emit('update:modelValue', e.target.value)
}

function appendKey(keyStr) {
  if (props.disabled) return
  const current = props.modelValue ? props.modelValue.trim() : ''
  if (!current) {
    emit('update:modelValue', keyStr)
  } else if (!current.endsWith('+') && !current.endsWith('+ ')) {
    emit('update:modelValue', `${current} + ${keyStr}`)
  } else {
    emit('update:modelValue', `${current} ${keyStr}`)
  }
}

function clearInput() {
  if (props.disabled) return
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="fill-blank-container">
    <div class="input-wrapper">
      <input
        type="text"
        class="text-input"
        :class="{
          'has-result-correct': result && result.isCorrect,
          'has-result-wrong': result && !result.isCorrect
        }"
        :value="modelValue"
        :placeholder="question.placeholder || 'Type shortcut here... (e.g. Win + L)'"
        :disabled="disabled"
        autocomplete="off"
        spellcheck="false"
        @input="onInput"
      />
      <button
        v-if="modelValue && !disabled"
        type="button"
        class="clear-btn"
        title="Clear"
        @click="clearInput"
      >
        ✕
      </button>
    </div>

    <!-- Quick Modifier Helper Pills -->
    <div v-if="!disabled" class="quick-helpers">
      <span class="helper-label">Quick keys:</span>
      <button type="button" class="key-pill" @click="appendKey('Win')">Win</button>
      <button type="button" class="key-pill" @click="appendKey('Ctrl')">Ctrl</button>
      <button type="button" class="key-pill" @click="appendKey('Shift')">Shift</button>
      <button type="button" class="key-pill" @click="appendKey('Alt')">Alt</button>
      <button type="button" class="key-pill" @click="appendKey('+')">+</button>
    </div>

    <!-- Feedback note -->
    <div v-if="result" class="answer-review">
      <span v-if="result.isCorrect" class="text-success">
        ✓ Accepted Answer: <strong>{{ question.canonicalAnswer }}</strong>
      </span>
      <span v-else class="text-danger">
        ✕ Expected: <strong>{{ question.canonicalAnswer }}</strong>
      </span>
    </div>
  </div>
</template>

<style scoped>
.fill-blank-container {
  margin: 16px 0;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.text-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 1.15rem;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: var(--color-background-soft, #f8fafc);
  border: 2px solid var(--color-border, #cbd5e1);
  border-radius: 8px;
  color: inherit;
  transition: all 0.15s ease-in-out;
}

.text-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.text-input.has-result-correct {
  border-color: #10b981;
  background: #ecfdf5;
}

.text-input.has-result-wrong {
  border-color: #ef4444;
  background: #fef2f2;
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
}
.clear-btn:hover {
  color: #475569;
}

.quick-helpers {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.helper-label {
  font-size: 0.85rem;
  color: #64748b;
}

.key-pill {
  padding: 4px 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-bottom: 2px solid #94a3b8;
  border-radius: 5px;
  font-family: monospace;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.1s;
}

.key-pill:hover {
  background: #e2e8f0;
}

.answer-review {
  margin-top: 12px;
  font-size: 0.95rem;
}

.text-success {
  color: #059669;
}

.text-danger {
  color: #dc2626;
}
</style>
