<script setup>
import { computed } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  answers: {
    type: Object,
    required: true
  },
  results: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['restart', 'review-question', 'filter-format'])

const totalScore = computed(() => {
  return props.questions.reduce((sum, q) => {
    const res = props.results[q.id]
    return sum + (res ? res.score : 0)
  }, 0)
})

const maxScore = computed(() => props.questions.length)

const scorePercentage = computed(() => {
  if (maxScore.value === 0) return 0
  return Math.round((totalScore.value / maxScore.value) * 100)
})

const performanceGrade = computed(() => {
  const p = scorePercentage.value
  if (p === 100) return { title: 'Windows Keyboard Wizard! 🏆', desc: 'Flawless execution! You know Windows short commands like the back of your hand.', color: '#10b981' }
  if (p >= 80) return { title: 'inCTRL Power User! ⚡', desc: 'Impressive muscle memory! You can navigate Windows without touching your mouse.', color: '#2563eb' }
  if (p >= 50) return { title: 'Apprentice Shortcutter 🛠️', desc: 'Good foundation! Review the missed shortcuts to level up your workflow.', color: '#f59e0b' }
  return { title: 'Keep Practicing! ⌨️', desc: 'Windows shortcuts take a bit of practice to become second nature. Try again!', color: '#ef4444' }
})

// Breakdown by format
const formatBreakdown = computed(() => {
  const map = {}
  props.questions.forEach(q => {
    if (!map[q.type]) {
      map[q.type] = { type: q.type, total: 0, scored: 0 }
    }
    map[q.type].total++
    const res = props.results[q.id]
    if (res) {
      map[q.type].scored += res.score
    }
  })
  return Object.values(map)
})

const formatLabels = {
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Select',
  fill_blank: 'Fill In The Box',
  key_builder: 'Key Combo Builder',
  matching: 'Matching Pairs',
  ordering: 'Step Sequence',
  true_false: 'True or False',
  live_press: 'Live Keyboard Press',
  odd_one_out: 'Spot The Imposter'
}
</script>

<template>
  <div class="summary-container">
    <div class="score-hero">
      <div class="score-circle">
        <span class="score-number">{{ scorePercentage }}%</span>
        <span class="score-fraction">{{ totalScore }} / {{ maxScore }} pts</span>
      </div>
      <h2 class="grade-title" :style="{ color: performanceGrade.color }">
        {{ performanceGrade.title }}
      </h2>
      <p class="grade-desc">{{ performanceGrade.desc }}</p>
    </div>

    <!-- Format Breakdown Grid -->
    <div class="breakdown-section">
      <h3 class="section-title">Performance by Format</h3>
      <div class="breakdown-grid">
        <div
          v-for="item in formatBreakdown"
          :key="item.type"
          class="breakdown-card"
        >
          <div class="format-header">
            <span class="format-name">{{ formatLabels[item.type] || item.type }}</span>
            <span class="format-stat">{{ item.scored }} / {{ item.total }}</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${(item.scored / item.total) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Question by Question Review -->
    <div class="review-section">
      <h3 class="section-title">Question Breakdown</h3>
      <div class="review-list">
        <button
          v-for="(q, idx) in questions"
          :key="q.id"
          type="button"
          class="review-item"
          :class="results[q.id]?.isCorrect ? 'item-correct' : 'item-wrong'"
          :aria-label="`Review question ${idx + 1}: ${q.prompt}`"
          @click="$emit('review-question', idx)"
        >
          <div class="item-left">
            <span class="q-num">#{{ idx + 1 }}</span>
            <span class="item-prompt">{{ q.prompt }}</span>
          </div>
          <div class="item-right">
            <span class="q-type-badge">{{ formatLabels[q.type] || q.type }}</span>
            <span class="result-badge">
              {{ results[q.id]?.isCorrect ? '✓ Correct' : '✕ Missed' }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="summary-actions">
      <button type="button" class="btn btn-primary btn-large" @click="$emit('restart')">
        🔄 Take Quiz Again
      </button>
    </div>
  </div>
</template>

<style scoped>
.summary-container {
  background: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 14px;
  padding: 30px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.score-hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #eff6ff;
  border: 4px solid #2563eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1e3a8a;
}

.score-number {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}

.score-fraction {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
}

.grade-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.grade-desc {
  max-width: 500px;
  font-size: 0.95rem;
  color: #64748b;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-heading, #1e293b);
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.breakdown-card {
  background: var(--color-background-soft, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.format-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
}

.progress-track {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2563eb;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  width: 100%;
  background: var(--color-background, #ffffff);
  text-align: left;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

.review-item:hover {
  background: #f8fafc;
}

.review-item:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.item-correct {
  border-left: 4px solid #10b981;
}

.item-wrong {
  border-left: 4px solid #ef4444;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.q-num {
  font-weight: 700;
  font-size: 0.85rem;
  color: #64748b;
}

.item-prompt {
  font-size: 0.92rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 480px;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.q-type-badge {
  font-size: 0.75rem;
  background: #ede9fe;
  color: #6d28d9;
  padding: 2px 6px;
  border-radius: 4px;
}

.result-badge {
  font-size: 0.85rem;
  font-weight: 700;
}

.item-correct .result-badge {
  color: #10b981;
}

.item-wrong .result-badge {
  color: #ef4444;
}

.summary-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.btn-large {
  padding: 12px 28px;
  font-size: 1.05rem;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover {
  background: #1d4ed8;
}
</style>
