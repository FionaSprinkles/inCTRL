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
  background: linear-gradient(180deg, rgba(10, 40, 50, 0.7) 0%, rgba(10, 40, 50, 0.5) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  border-radius: 20px;
  padding: 1.1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
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
  color: var(--color-text-white);
  letter-spacing: 0.5px;
}

.logo-ctrl strong {
  color: var(--color-light-accenturate);
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
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--color-text-white);
}

.timer-pill {
  color: var(--color-light-accenturate);
}

.restart-btn {
  font-family: var(--font-display);
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 0.92rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  color: var(--color-text-main);
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
  transition: all 0.3s ease;
}

.restart-btn:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
  color: var(--color-text-white);
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
  border-radius: 16px;
  font-size: 0.88rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  color: var(--color-text-main);
  white-space: nowrap;
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
  transition: all 0.3s ease;
}

.chip:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
  color: var(--color-text-white);
}

.chip.active {
  background: var(--color-text-main);
  color: var(--color-dark-accenturate);
  border-color: rgba(245, 247, 250, 0.9);
  font-weight: 600;
  text-shadow: none;
}

.progress-bar-container {
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-light-accenturate);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
