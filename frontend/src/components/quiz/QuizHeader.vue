<script setup>
import { computed } from 'vue'

const props = defineProps({
  formats: {
    type: Array,
    required: true,
  },
  activeFormatFilter: {
    type: String,
    default: 'all',
  },
  currentIndex: {
    type: Number,
    default: 0,
  },
  totalCount: {
    type: Number,
    default: 1,
  },
  score: {
    type: Number,
    default: 0,
  },
  answeredCount: {
    type: Number,
    default: 0,
  },
  timeSpentSeconds: {
    type: Number,
    default: 0,
  },
})

defineEmits(['filter-changed', 'restart'])

const formattedTimer = computed(() => {
  const total = props.timeSpentSeconds || 0
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const formatNames = {
  all: 'All Formats (Full Quiz)',
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Select',
  fill_blank: 'Fill In The Box',
  key_builder: 'Key Combo Builder',
  matching: 'Matching Pairs',
  ordering: 'Step Sequence',
  true_false: 'True or False',
  live_press: 'Live Key Press',
  odd_one_out: 'Spot Imposter',
}
</script>

<template>
  <header class="quiz-nav-header">
    <div class="top-row">
      <div class="brand">
        <span class="logo-ctrl">in<strong>CTRL</strong></span>
        <span class="sub-brand">Windows Shortcuts Quiz Engine</span>
      </div>

      <div class="stats-box">
        <span class="stat-pill timer-pill" title="Elapsed Time">
          ⏱️ <strong>{{ formattedTimer }}</strong>
        </span>
        <span class="stat-pill progress-pill">
          Answered: <strong>{{ answeredCount }}</strong> / {{ totalCount }}
        </span>
        <button type="button" class="restart-btn" title="Reset this quiz" @click="$emit('restart')">
          🔄 Reset
        </button>
      </div>
    </div>

    <!-- Format Filter Chips -->
    <div class="filter-strip">
      <span class="filter-label">Question Formats:</span>
      <div class="filter-chips">
        <button
          type="button"
          class="chip"
          :class="{ active: activeFormatFilter === 'all' }"
          @click="$emit('filter-changed', 'all')"
        >
          All Formats
        </button>
        <button
          v-for="fmt in formats"
          :key="fmt"
          type="button"
          class="chip"
          :class="{ active: activeFormatFilter === fmt }"
          @click="$emit('filter-changed', fmt)"
        >
          {{ formatNames[fmt] || fmt }}
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar-container">
      <div
        class="progress-bar-fill"
        :style="{ width: `${totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0}%` }"
      ></div>
    </div>
  </header>
</template>

<style scoped>
.quiz-nav-header {
  width: 100%;
  box-sizing: border-box;
  background: rgba(18, 86, 98, 0.52);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 1.1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.logo-ctrl {
  font-family: var(--font-heading);
  font-size: 1.65rem;
  font-weight: 400;
  color: var(--color-text-heading);
  letter-spacing: 0.5px;
}

.logo-ctrl strong {
  color: var(--color-button);
  font-weight: 600;
}

.sub-brand {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-main);
}

.stats-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-pill {
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
  padding: 5px 14px;
  background: rgba(15, 76, 92, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--color-text-heading);
}

.timer-pill {
  background: rgba(227, 221, 196, 0.15);
  border-color: rgba(227, 221, 196, 0.35);
  color: var(--color-button);
}

.restart-btn {
  font-family: var(--font-display);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 0.92rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  color: var(--color-text-main);
  transition: all 0.15s ease;
}

.restart-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-heading);
}

.filter-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-label {
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text-main);
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  font-family: var(--font-display);
  padding: 4px 12px;
  background: rgba(15, 76, 92, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  font-size: 0.88rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  color: var(--color-text-main);
  white-space: nowrap;
  transition: all 0.15s ease;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.16);
  color: var(--color-text-heading);
}

.chip.active {
  background: var(--color-button);
  color: var(--color-button-text);
  border-color: var(--color-button-border);
  font-weight: 600;
}

.progress-bar-container {
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-button);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
