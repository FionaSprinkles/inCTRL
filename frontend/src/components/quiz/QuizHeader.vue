<script setup>
defineProps({
  formats: {
    type: Array,
    required: true
  },
  activeFormatFilter: {
    type: String,
    default: 'all'
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 1
  },
  score: {
    type: Number,
    default: 0
  },
  answeredCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['filter-changed', 'restart'])

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
  odd_one_out: 'Spot Imposter'
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
        <span class="stat-pill score-pill">
          Score: <strong>{{ score }}</strong> / {{ answeredCount }}
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
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
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
  font-size: 1.6rem;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: -0.5px;
}

.logo-ctrl strong {
  color: #1e293b;
  font-weight: 900;
  text-decoration: underline;
  text-decoration-color: #3b82f6;
}

.sub-brand {
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 500;
}

.stats-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-pill {
  padding: 6px 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #1e40af;
}

.restart-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #475569;
}
.restart-btn:hover {
  background: #e2e8f0;
}

.filter-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  padding: 4px 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  font-size: 0.82rem;
  cursor: pointer;
  color: #475569;
  white-space: nowrap;
  transition: all 0.12s;
}

.chip:hover {
  background: #e2e8f0;
}

.chip.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #1d4ed8;
  font-weight: 600;
}

.progress-bar-container {
  height: 6px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #2563eb;
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
