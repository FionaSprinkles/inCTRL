<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getKeyLabelFromEvent } from '../../utils/keyboardUtils'

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

const isListening = ref(true)
const padRef = ref(null)
const currentlyHeld = ref(new Set())

const capturedCombo = computed(() => {
  return Array.isArray(props.modelValue) ? props.modelValue : []
})

/**
 * Captures keydown events and records pressed modifier and alphanumeric keys.
 * @param {KeyboardEvent} e - Native keyboard event.
 */
function handleKeyDown(e) {
  if (props.disabled || !isListening.value) return

  // Prevent default for common shortcuts during test if within our capture box
  if (e.key === 'Tab') e.preventDefault()

  const keys = new Set(currentlyHeld.value)

  if (e.metaKey) keys.add('Win')
  if (e.ctrlKey) keys.add('Ctrl')
  if (e.altKey) keys.add('Alt')
  if (e.shiftKey) keys.add('Shift')

  const label = getKeyLabelFromEvent(e)
  if (!['Ctrl', 'Shift', 'Alt', 'Win'].includes(label)) {
    keys.add(label)
  }

  currentlyHeld.value = keys

  // Commit captured combination
  const comboArr = Array.from(keys)
  emit('update:modelValue', comboArr)
}

/**
 * Handles keyup events to release keys from currentlyHeld set.
 * @param {KeyboardEvent} e - Native keyboard event.
 */
function handleKeyUp(e) {
  const next = new Set(currentlyHeld.value)
  next.delete(getKeyLabelFromEvent(e))
  currentlyHeld.value = next
}

/**
 * Toggles a virtual on-screen keypad key.
 * @param {string} key - Key label to toggle.
 */
function toggleVirtualKey(key) {
  if (props.disabled) return
  const current = [...capturedCombo.value]
  const idx = current.indexOf(key)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(key)
  }
  emit('update:modelValue', current)
}

/**
 * Clears all recorded keys.
 */
function clearRecorded() {
  if (props.disabled) return
  currentlyHeld.value = new Set()
  emit('update:modelValue', [])
}

/**
 * Activates live keyboard capture mode and focuses input container.
 */
function activateListening() {
  isListening.value = true
  if (padRef.value) {
    padRef.value.focus()
  }
}
</script>

<template>
  <div class="live-press-container">
    <p v-if="question.description" class="sub-instruction">
      {{ question.description }}
    </p>

    <!-- Interactive Keypad Capture Zone -->
    <div
      ref="padRef"
      class="capture-box"
      tabindex="0"
      :class="{
        focused: isListening && !disabled,
        'box-correct': result && result.isCorrect,
        'box-wrong': result && !result.isCorrect
      }"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
      @click="activateListening"
    >
      <div class="capture-status">
        <span class="pulse-dot" :class="{ active: isListening && !disabled }"></span>
        <span v-if="!disabled">
          {{ isListening ? 'Listening for keystrokes...' : 'Click to activate listener' }}
        </span>
        <span v-else>Input locked</span>
      </div>

      <div class="active-keys-display">
        <template v-if="capturedCombo.length > 0">
          <template v-for="(k, idx) in capturedCombo" :key="idx">
            <span v-if="idx > 0" class="plus">+</span>
            <kbd class="live-kbd">{{ k }}</kbd>
          </template>
        </template>
        <div v-else class="press-hint">
          Press the shortcut on your physical keyboard now...
        </div>
      </div>

      <button
        v-if="capturedCombo.length > 0 && !disabled"
        type="button"
        class="clear-capture-btn"
        @click.stop="clearRecorded"
      >
        Clear Key Combo
      </button>
    </div>

    <!-- On-screen Virtual Keypad for backup/mobile/intercepted keys -->
    <div v-if="question.virtualKeys && !disabled" class="virtual-keypad">
      <div class="vk-label">Or click virtual keys if intercepted by OS:</div>
      <div class="vk-grid">
        <button
          v-for="vk in question.virtualKeys"
          :key="vk"
          type="button"
          class="vk-btn"
          :class="{ active: capturedCombo.includes(vk) }"
          @click="toggleVirtualKey(vk)"
        >
          {{ vk }}
        </button>
      </div>
    </div>

    <!-- Target feedback upon evaluation -->
    <div v-if="result" class="result-display">
      Expected Combo:
      <strong class="target-badge">{{ question.displayCombo }}</strong>
    </div>
  </div>
</template>

<style scoped>
.live-press-container {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sub-instruction {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-main);
  margin: 0;
}

.capture-box {
  background: rgba(15, 76, 92, 0.5);
  border: 2px dashed rgba(255, 255, 255, 0.35);
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.capture-box.focused {
  border-color: var(--color-button);
  background: rgba(15, 76, 92, 0.72);
  box-shadow: 0 0 0 3px rgba(227, 221, 196, 0.2);
}

.capture-box.box-correct {
  border: 2px solid #10b981;
  background: rgba(16, 185, 129, 0.22);
}

.capture-box.box-wrong {
  border: 2px solid #ef4444;
  background: rgba(239, 68, 68, 0.22);
}

.capture-status {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
}

.pulse-dot.active {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

.active-keys-display {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 48px;
}

.press-hint {
  font-family: var(--font-body);
  color: rgba(242, 229, 208, 0.75);
  font-size: 1rem;
}

.plus {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--color-text-heading);
}

.live-kbd {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.35);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-bottom: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-button);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.clear-capture-btn {
  margin-top: 14px;
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  color: var(--color-text-main);
  transition: all 0.15s ease;
}

.clear-capture-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  color: var(--color-text-heading);
}

.virtual-keypad {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vk-label {
  font-family: var(--font-display);
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  color: var(--color-text-main);
}

.vk-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.vk-btn {
  padding: 6px 14px;
  background: rgba(15, 76, 92, 0.65);
  color: var(--color-text-heading);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-bottom: 2px solid rgba(255, 255, 255, 0.45);
  border-radius: 8px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vk-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--color-button);
}

.vk-btn.active {
  background: var(--color-button);
  color: var(--color-button-text);
  border-color: var(--color-button-border);
}

.result-display {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-main);
}

.target-badge {
  font-family: 'Consolas', 'Courier New', monospace;
  color: var(--color-button);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 3px 8px;
  border-radius: 6px;
}
</style>
