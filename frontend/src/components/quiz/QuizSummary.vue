<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
  answers: {
    type: Object,
    required: true,
  },
  results: {
    type: Object,
    required: true,
  },
  timeSpentSeconds: {
    type: Number,
    default: 0,
  },
})

defineEmits(['restart', 'review-question', 'filter-format'])

const totalScore = computed(() => {
  return props.questions.reduce((sum, q) => {
    const res = props.results[q.id]
    return sum + (res ? res.score || 0 : 0)
  }, 0)
})

const maxScore = computed(() => {
  return props.questions.reduce((sum, q) => {
    const max = props.results[q.id]?.maxScore
    return sum + (typeof max === 'number' ? max : 1)
  }, 0)
})

const correctCount = computed(() => {
  return props.questions.filter((q) => props.results[q.id]?.isCorrect).length
})

const scorePercentage = computed(() => {
  if (maxScore.value === 0) return 0
  return Math.round((totalScore.value / maxScore.value) * 100)
})

const formattedDuration = computed(() => {
  const seconds = props.timeSpentSeconds || 0
  if (seconds <= 0) return '0s'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
})

const performanceGrade = computed(() => {
  const p = scorePercentage.value
  if (p === 100)
    return {
      title: 'Windows Keyboard Wizard! 🏆',
      desc: 'Flawless execution! You know Windows short commands like the back of your hand.',
      color: '#10b981',
    }
  if (p >= 80)
    return {
      title: 'inCTRL Power User! ⚡',
      desc: 'Impressive muscle memory! You can navigate Windows without touching your mouse.',
      color: '#2563eb',
    }
  if (p >= 50)
    return {
      title: 'Apprentice Shortcutter 🛠️',
      desc: 'Good foundation! Review the missed shortcuts to level up your workflow.',
      color: '#f59e0b',
    }
  return {
    title: 'Keep Practicing! ⌨️',
    desc: 'Windows shortcuts take a bit of practice to become second nature. Try again!',
    color: '#ef4444',
  }
})

// Breakdown by format
const formatBreakdown = computed(() => {
  const map = {}
  props.questions.forEach((q) => {
    if (!map[q.type]) {
      map[q.type] = { type: q.type, total: 0, scored: 0 }
    }
    map[q.type].total++
    const res = props.results[q.id]
    if (res) {
      map[q.type].scored += res.score || 0
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
  odd_one_out: 'Spot The Imposter',
}

// Track expanded state of breakdown cards (all expanded by default for full answer summary)
const expandedMap = ref({})
props.questions.forEach((q) => {
  expandedMap.value[q.id] = true
})

const allExpanded = computed(() => {
  return props.questions.every((q) => expandedMap.value[q.id])
})

function toggleAll() {
  const next = !allExpanded.value
  props.questions.forEach((q) => {
    expandedMap.value[q.id] = next
  })
}

function toggleCard(id) {
  expandedMap.value[id] = !expandedMap.value[id]
}

function formatUserAnswer(question, answer) {
  if (answer === null || answer === undefined || answer === '') {
    return 'No answer given'
  }
  switch (question.type) {
    case 'single_choice': {
      const opt = question.options?.find((o) => o.id === answer)
      return opt ? opt.label || opt.text : String(answer)
    }
    case 'multiple_choice': {
      if (!Array.isArray(answer) || answer.length === 0) return 'No answer given'
      const names = answer.map((id) => {
        const opt = question.options?.find((o) => o.id === id)
        return opt ? opt.label || opt.text : id
      })
      return names.join(', ')
    }
    case 'fill_blank': {
      return String(answer).trim() || 'No answer given'
    }
    case 'key_builder': {
      if (!Array.isArray(answer) || answer.length === 0) return 'No keys placed'
      return answer.join(' + ')
    }
    case 'live_press': {
      if (!Array.isArray(answer) || answer.length === 0) return 'No keys pressed'
      return answer.join(' + ')
    }
    case 'true_false': {
      if (typeof answer === 'boolean') return answer ? 'True' : 'False'
      return String(answer)
    }
    case 'odd_one_out': {
      const opt = question.options?.find((o) => o.id === answer)
      return opt ? opt.text : String(answer)
    }
    case 'ordering': {
      if (!Array.isArray(answer) || answer.length === 0) return 'No order chosen'
      const itemsMap = (question.items || []).reduce((acc, item) => {
        acc[item.id] = item.text
        return acc
      }, {})
      return answer.map((id, i) => `${i + 1}. ${itemsMap[id] || id}`).join(' → ')
    }
    case 'matching': {
      if (!answer || typeof answer !== 'object') return 'No pairs matched'
      const pairs = question.pairs || []
      const parts = []
      pairs.forEach((pair) => {
        const matchedRightId = answer[pair.id]
        const matchedRight = pairs.find((p) => p.id === matchedRightId)
        if (matchedRight) {
          parts.push(`${pair.left} ➔ ${matchedRight.right}`)
        }
      })
      return parts.length ? parts.join(' | ') : 'No matches made'
    }
    default:
      return typeof answer === 'object' ? JSON.stringify(answer) : String(answer)
  }
}

function formatCorrectAnswer(question) {
  switch (question.type) {
    case 'single_choice': {
      const opt = question.options?.find((o) => o.isCorrect)
      return opt ? opt.label || opt.text : ''
    }
    case 'multiple_choice': {
      const opts = question.options?.filter((o) => o.isCorrect) || []
      return opts.map((o) => o.label || o.text).join(', ')
    }
    case 'fill_blank': {
      return question.canonicalAnswer || question.acceptedAnswers?.[0] || ''
    }
    case 'key_builder': {
      const target = question.targetCombo || question.payload?.targetCombo || []
      return target.join(' + ')
    }
    case 'live_press': {
      return question.displayCombo || (question.targetKeys || []).join(' + ')
    }
    case 'true_false': {
      return question.correctAnswer ? 'True' : 'False'
    }
    case 'odd_one_out': {
      const opt = question.options?.find((o) => o.id === question.imposterId)
      return `${opt?.text || 'Imposter'}${question.imposterReason ? ' — ' + question.imposterReason : ''}`
    }
    case 'ordering': {
      const itemsMap = (question.items || []).reduce((acc, item) => {
        acc[item.id] = item.text
        return acc
      }, {})
      const order = question.correctOrder || []
      return order.map((id, i) => `${i + 1}. ${itemsMap[id] || id}`).join(' → ')
    }
    case 'matching': {
      const pairs = question.pairs || []
      return pairs.map((p) => `${p.left} ➔ ${p.right}`).join(' | ')
    }
    default:
      return ''
  }
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

      <!-- Key Metrics Row (Time, Correct, Total Questions) -->
      <div class="metrics-row">
        <div class="metric-pill">
          <span class="metric-icon">⏱️</span>
          <span class="metric-label">Time Taken:</span>
          <strong>{{ formattedDuration }}</strong>
        </div>
        <div class="metric-pill">
          <span class="metric-icon">🎯</span>
          <span class="metric-label">Correct:</span>
          <strong>{{ correctCount }} of {{ questions.length }}</strong>
        </div>
        <div class="metric-pill">
          <span class="metric-icon">🏆</span>
          <span class="metric-label">Score:</span>
          <strong>{{ totalScore }} / {{ maxScore }}</strong>
        </div>
      </div>
    </div>

    <!-- Format Breakdown Grid -->
    <div class="breakdown-section">
      <h3 class="section-title">Performance by Format</h3>
      <div class="breakdown-grid">
        <div v-for="item in formatBreakdown" :key="item.type" class="breakdown-card">
          <div class="format-header">
            <span class="format-name">{{ formatLabels[item.type] || item.type }}</span>
            <span class="format-stat">{{ item.scored }} / {{ item.total }}</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${item.total > 0 ? (item.scored / item.total) * 100 : 0}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Question by Question Summary & Answer Review -->
    <div class="review-section">
      <div class="review-header">
        <h3 class="section-title">Answers Summary ({{ questions.length }} Questions)</h3>
        <button type="button" class="btn-toggle-all" @click="toggleAll">
          {{ allExpanded ? 'Collapse All' : 'Expand All' }}
        </button>
      </div>

      <div class="review-list">
        <article
          v-for="(q, idx) in questions"
          :key="q.id"
          class="answer-card"
          :class="{
            'card-correct': results[q.id]?.isCorrect,
            'card-wrong': !results[q.id]?.isCorrect && results[q.id]?.score === 0,
            'card-partial': !results[q.id]?.isCorrect && (results[q.id]?.score || 0) > 0,
          }"
        >
          <!-- Card Header / Summary Click Bar -->
          <div
            class="card-header"
            role="button"
            tabindex="0"
            :aria-expanded="expandedMap[q.id]"
            @click="toggleCard(q.id)"
            @keydown.enter.space.prevent="toggleCard(q.id)"
          >
            <div class="header-left">
              <span class="q-num">#{{ idx + 1 }}</span>
              <span class="q-prompt">{{ q.prompt }}</span>
            </div>
            <div class="header-right">
              <span class="q-type-badge">{{ formatLabels[q.type] || q.type }}</span>
              <span
                v-if="results[q.id]?.isCorrect"
                class="status-badge status-correct"
              >
                ✓ Correct
              </span>
              <span
                v-else-if="(results[q.id]?.score || 0) > 0"
                class="status-badge status-partial"
              >
                ⚡ Partial ({{ results[q.id]?.score }})
              </span>
              <span
                v-else
                class="status-badge status-wrong"
              >
                ✕ Missed
              </span>
              <span class="chevron" aria-hidden="true">{{ expandedMap[q.id] ? '▲' : '▼' }}</span>
            </div>
          </div>

          <!-- Card Body: Expanded Answer Summary -->
          <div v-if="expandedMap[q.id]" class="card-body">
            <div class="answer-comparison">
              <!-- User's Answer -->
              <div class="answer-pane user-pane">
                <span class="pane-label">Your Answer:</span>
                <div
                  class="pane-value"
                  :class="results[q.id]?.isCorrect ? 'val-correct' : 'val-wrong'"
                >
                  <span class="val-icon">{{ results[q.id]?.isCorrect ? '✓' : '✗' }}</span>
                  <span class="val-text">{{ formatUserAnswer(q, answers[q.id]) }}</span>
                </div>
              </div>

              <!-- Correct Answer (shown if incorrect/partial, or always for reference) -->
              <div v-if="!results[q.id]?.isCorrect" class="answer-pane correct-pane">
                <span class="pane-label">Correct Answer:</span>
                <div class="pane-value val-target">
                  <span class="val-icon">🎯</span>
                  <span class="val-text">{{ formatCorrectAnswer(q) }}</span>
                </div>
              </div>
            </div>

            <!-- Feedback / Explanation Note -->
            <div v-if="results[q.id]?.feedback || q.explanation" class="explanation-box">
              <p v-if="results[q.id]?.feedback" class="feedback-text">
                {{ results[q.id]?.feedback }}
              </p>
              <p v-if="q.explanation" class="explanation-text">
                <strong>Explanation:</strong> {{ q.explanation }}
              </p>
            </div>

            <!-- Jump to interactive review button -->
            <div class="card-footer">
              <button
                type="button"
                class="btn-inspect"
                @click="$emit('review-question', idx)"
              >
                Inspect in Question View ↗
              </button>
            </div>
          </div>
        </article>
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
  gap: 12px;
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
  margin: 0;
}

.grade-desc {
  max-width: 540px;
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

.metrics-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.metric-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.88rem;
  color: #334155;
}

.metric-icon {
  font-size: 1rem;
}

.metric-label {
  color: #64748b;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-heading, #1e293b);
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 12px;
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

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.btn-toggle-all {
  background: none;
  border: 1px solid #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-toggle-all:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-card {
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 10px;
  background: var(--color-background, #ffffff);
  overflow: hidden;
  transition: border-color 0.15s;
}

.answer-card.card-correct {
  border-left: 5px solid #10b981;
}

.answer-card.card-wrong {
  border-left: 5px solid #ef4444;
}

.answer-card.card-partial {
  border-left: 5px solid #f59e0b;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  background: #fcfdfe;
  gap: 12px;
}

.card-header:hover {
  background: #f8fafc;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex: 1;
}

.q-num {
  font-weight: 700;
  font-size: 0.9rem;
  color: #64748b;
  min-width: 28px;
}

.q-prompt {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.q-type-badge {
  font-size: 0.75rem;
  background: #ede9fe;
  color: #6d28d9;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.status-badge {
  font-size: 0.82rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-correct {
  background: #dcfce7;
  color: #15803d;
}

.status-wrong {
  background: #fee2e2;
  color: #b91c1c;
}

.status-partial {
  background: #fef3c7;
  color: #b45309;
}

.chevron {
  font-size: 0.75rem;
  color: #94a3b8;
}

.card-body {
  padding: 14px 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-comparison {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-pane {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pane-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.pane-value {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.92rem;
  font-weight: 500;
}

.val-icon {
  font-weight: 700;
}

.val-correct {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.val-wrong {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.val-target {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}

.explanation-box {
  background: #fafafa;
  border-left: 3px solid #cbd5e1;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.5;
}

.feedback-text {
  margin: 0 0 4px;
  font-weight: 600;
}

.explanation-text {
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-inspect {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}

.btn-inspect:hover {
  background: #eff6ff;
  text-decoration: underline;
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
