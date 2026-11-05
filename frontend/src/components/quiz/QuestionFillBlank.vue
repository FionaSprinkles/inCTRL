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

/**
 * Handles text input changes and emits updated modelValue.
 * @param {Event} e - Native input event.
 */
function onInput(e) {
  emit('update:modelValue', e.target.value)
}

/**
 * Appends key token to current input text with plus separator.
 * @param {string} keyStr - Key label to append.
 */
function appendKey(keyStr) {
  if (props.disabled) return
  const current = props.modelValue ? props.modelValue.trim() : ''
  if (!current) {
    emit('update:modelValue', keyStr)
  } else if (keyStr === '+') {
    emit('update:modelValue', current.endsWith('+') ? `${current} ` : `${current} + `)
  } else if (!current.endsWith('+')) {
    emit('update:modelValue', `${current} + ${keyStr}`)
  } else {
    emit('update:modelValue', `${current} ${keyStr}`)
  }
}

/**
 * Clears text input content.
 */
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
  box-sizing: border-box;
  padding: 14px 44px 14px 18px;
  font-size: 1.15rem;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 600;
  letter-spacing: 0.5px;
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
  color: var(--color-text-white);
  transition: all 0.3s ease;
}

.text-input::placeholder {
  color: var(--color-light-accenturate);
  font-weight: 400;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-light-accenturate);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
}

.text-input.has-result-correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.25);
  color: #d1fae5;
}

.text-input.has-result-wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.25);
  color: #fee2e2;
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--color-text-main);
  cursor: pointer;
  font-size: 1.05rem;
  padding: 4px 6px;
  transition: color 0.15s ease;
}

.clear-btn:hover {
  color: var(--color-text-white);
}

.quick-helpers {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.helper-label {
  font-family: var(--font-display);
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  color: var(--color-text-main);
}

.key-pill {
  padding: 5px 12px;
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
  color: var(--color-text-white);
  border-radius: 6px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.key-pill:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
}

.answer-review {
  margin-top: 12px;
  font-family: var(--font-body);
  font-size: 0.95rem;
}

.text-success {
  color: #6ee7b7;
}

.text-danger {
  color: #fca5a5;
}
</style>
