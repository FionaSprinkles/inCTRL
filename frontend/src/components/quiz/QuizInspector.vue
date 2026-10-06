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
  border-top: 1px dashed #cbd5e1;
  padding-top: 16px;
}

.inspector-toggle-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
}

.inspector-toggle-btn:hover {
  color: #1e293b;
}

.prototype-badge {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-family: monospace;
}

.inspector-body {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inspector-section {
  background: #0f172a;
  border-radius: 8px;
  padding: 12px;
}

.section-title {
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.json-code {
  color: #38bdf8;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 0.8rem;
  margin: 0;
  max-height: 220px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
