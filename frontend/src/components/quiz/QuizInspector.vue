<script setup>
import { ref } from 'vue'

defineProps({
  question: {
    type: Object,
    required: true
  },
  userAnswer: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null
  },
  result: {
    type: Object,
    default: null
  }
})

const isOpen = ref(false)
</script>

<template>
  <div class="inspector-wrapper">
    <button
      type="button"
      class="inspector-toggle-btn"
      @click="isOpen = !isOpen"
    >
      <span>{{ isOpen ? '▼ Hide' : '▶ Show' }} Database / JSON Schema Inspector</span>
      <span class="prototype-badge">Prototype Dev Tool</span>
    </button>

    <div v-if="isOpen" class="inspector-body">
      <div class="inspector-section">
        <div class="section-title">Current Question Model (Ready for DB Schema / API):</div>
        <pre class="json-code">{{ JSON.stringify(question, null, 2) }}</pre>
      </div>

      <div class="inspector-section">
        <div class="section-title">User Answer State:</div>
        <pre class="json-code">{{ JSON.stringify(userAnswer, null, 2) }}</pre>
      </div>

      <div v-if="result" class="inspector-section">
        <div class="section-title">Validation Engine Evaluation:</div>
        <pre class="json-code">{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inspector-wrapper {
  margin-top: 20px;
  border-top: 1px dashed rgba(255, 255, 255, 0.25);
  padding-top: 16px;
}

.inspector-toggle-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  color: var(--color-text-main);
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  padding: 4px 0;
}

.inspector-toggle-btn:hover {
  color: var(--color-text-heading);
}

.prototype-badge {
  background: rgba(15, 76, 92, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: var(--color-button);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: 'Consolas', 'Courier New', monospace;
}

.inspector-body {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inspector-section {
  background: rgba(10, 35, 42, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 14px;
}

.section-title {
  font-family: var(--font-display);
  color: var(--color-text-main);
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.json-code {
  color: var(--color-button);
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 0.82rem;
  margin: 0;
  max-height: 220px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
