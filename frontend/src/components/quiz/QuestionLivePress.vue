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

function handleKeyUp(e) {
  const next = new Set(currentlyHeld.value)
  next.delete(getKeyLabelFromEvent(e))
  currentlyHeld.value = next
}

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

function clearRecorded() {
  if (props.disabled) return
  currentlyHeld.value = new Set()
  emit('update:modelValue', [])
}

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
  font-size: 0.9rem;
  color: #64748b;
}

.capture-box {
  background: var(--color-background-soft, #f8fafc);
  border: 2px dashed #94a3b8;
  border-radius: 12px;
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
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.capture-box.box-correct {
  border: 2px solid #10b981;
  background: #ecfdf5;
}

.capture-box.box-wrong {
  border: 2px solid #ef4444;
  background: #fef2f2;
}

.capture-status {
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
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
  color: #64748b;
  font-size: 1rem;
}

.plus {
  font-size: 1.4rem;
  font-weight: bold;
  color: #475569;
}

.live-kbd {
  display: inline-block;
  padding: 8px 16px;
  background: #ffffff;
  border: 2px solid #94a3b8;
  border-bottom: 4px solid #64748b;
  border-radius: 8px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

.clear-capture-btn {
  margin-top: 14px;
  padding: 4px 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  color: #475569;
}

.virtual-keypad {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vk-label {
  font-size: 0.85rem;
  color: #64748b;
}

.vk-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.vk-btn {
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-bottom: 2px solid #94a3b8;
  border-radius: 6px;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
}

.vk-btn:hover {
  background: #f1f5f9;
}

.vk-btn.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #1d4ed8;
}

.result-display {
  font-size: 0.95rem;
}

.target-badge {
  font-family: monospace;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
