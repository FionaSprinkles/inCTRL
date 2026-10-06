<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({})
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

const selectedLeftId = ref(null)

// Deterministically shuffle or stabilize right side so user has to match
const rightItems = computed(() => {
  const items = (props.question.pairs || []).map(p => ({
    id: p.id,
    right: p.right
  }))
  // Reverse or simple pseudo-shuffle so they are not directly across from each other
  return [...items].reverse()
})

const currentMatches = computed(() => props.modelValue || {})

/**
 * Handles selection of a left item card.
 * @param {string} id - Selected pair ID on the left side.
 */
function onSelectLeft(id) {
  if (props.disabled) return
  if (selectedLeftId.value === id) {
    selectedLeftId.value = null
  } else {
    selectedLeftId.value = id
  }
}

/**
 * Handles selection of a right item card and connects it with active left selection.
 * @param {string} rightId - Selected target ID on the right side.
 */
function onSelectRight(rightId) {
  if (props.disabled) return
  if (!selectedLeftId.value) {
    // If user clicked right item first, check if it's already paired to disconnect it
    const existingLeft = Object.keys(currentMatches.value).find(
      lId => currentMatches.value[lId] === rightId
    )
    if (existingLeft) {
      const next = { ...currentMatches.value }
      delete next[existingLeft]
      emit('update:modelValue', next)
    }
    return
  }

  const next = { ...currentMatches.value }
  // If this rightId is already paired with another left, remove that old pair
  for (const lId in next) {
    if (next[lId] === rightId) {
      delete next[lId]
    }
  }

  next[selectedLeftId.value] = rightId
  emit('update:modelValue', next)
  selectedLeftId.value = null
}

/**
 * Removes link for a specific left item.
 * @param {string} leftId - Pair identifier on the left.
 */
function unpair(leftId) {
  if (props.disabled) return
  const next = { ...currentMatches.value }
  delete next[leftId]
  emit('update:modelValue', next)
}

/**
 * Clears all established pairings and selection state.
 */
function resetAll() {
  if (props.disabled) return
  emit('update:modelValue', {})
  selectedLeftId.value = null
}

const colorClasses = ['badge-blue', 'badge-purple', 'badge-orange', 'badge-teal', 'badge-pink']

/**
 * Determines badge color class based on pair index.
 * @param {string} pairId - Pair ID.
 * @returns {string} CSS class string for badge styling.
 */
function getPairBadge(pairId) {
  const index = (props.question.pairs || []).findIndex(p => p.id === pairId)
  return colorClasses[index % colorClasses.length]
}

function getRightMatchedLeft(rightId) {
  const leftId = Object.keys(currentMatches.value).find(
    lId => currentMatches.value[lId] === rightId
  )
  return leftId ? Number(leftId) : null
}
</script>

<template>
  <div class="matching-container">
    <div class="matching-instructions">
      <span>Click a shortcut on the left, then click its matching action on the right.</span>
      <button
        v-if="Object.keys(currentMatches).length > 0 && !disabled"
        type="button"
        class="reset-btn"
        @click="resetAll"
      >
        Reset Pairs
      </button>
    </div>

    <div class="columns-grid">
      <!-- Left Column: Shortcuts -->
      <div class="column left-column">
        <div class="column-header">Shortcuts</div>
        <div
          v-for="pair in question.pairs"
          :key="'left-' + pair.id"
          class="match-row"
        >
          <button
            type="button"
            class="match-card left-card"
            :class="{
              active: selectedLeftId === pair.id,
              paired: currentMatches[pair.id] !== undefined,
              correct: result && currentMatches[pair.id] === pair.id,
              incorrect: result && currentMatches[pair.id] !== undefined && currentMatches[pair.id] !== pair.id
            }"
            :disabled="disabled"
            @click="onSelectLeft(pair.id)"
          >
            <kbd class="shortcut-text">{{ pair.left }}</kbd>
            <span
              v-if="currentMatches[pair.id] !== undefined"
              class="match-pill"
              :class="getPairBadge(pair.id)"
            >
              Linked
            </span>
          </button>
          <button
            v-if="currentMatches[pair.id] !== undefined"
            type="button"
            class="unlink-btn"
            :disabled="disabled"
            title="Click to disconnect"
            :aria-label="`Disconnect ${pair.left}`"
            @click="unpair(pair.id)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Right Column: Descriptions -->
      <div class="column right-column">
        <div class="column-header">Functions / Actions</div>
        <button
          v-for="item in rightItems"
          :key="'right-' + item.id"
          type="button"
          class="match-card right-card"
          :class="{
            paired: getRightMatchedLeft(item.id) !== null,
            'can-link': selectedLeftId !== null,
            correct: result && getRightMatchedLeft(item.id) === item.id,
            incorrect: result && getRightMatchedLeft(item.id) !== null && getRightMatchedLeft(item.id) !== item.id
          }"
          :disabled="disabled"
          @click="onSelectRight(item.id)"
        >
          <span class="action-text">{{ item.right }}</span>
          <span
            v-if="getRightMatchedLeft(item.id) !== null"
            class="match-pill"
            :class="getPairBadge(getRightMatchedLeft(item.id))"
          >
            Matched
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.matching-container {
  margin: 16px 0;
}

.matching-instructions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 12px;
}

.reset-btn {
  padding: 4px 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}
.reset-btn:hover {
  background: #e2e8f0;
}

.columns-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 640px) {
  .columns-grid {
    grid-template-columns: 1fr;
  }
}

.column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.column-header {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.5px;
}

.match-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.match-row .left-card {
  flex: 1;
}

.unlink-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  background: #f1f5f9;
  border: 2px solid var(--color-border, #cbd5e1);
  border-radius: 8px;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.unlink-btn:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}

.unlink-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.match-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--color-background-soft, #f8fafc);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 54px;
}

.match-card:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.left-card.active {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.right-card.can-link {
  border-style: dashed;
}

.match-card.paired {
  border-color: #94a3b8;
}

.match-card.correct {
  border-color: #10b981 !important;
  background: #ecfdf5 !important;
}

.match-card.incorrect {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.shortcut-text {
  background: #ffffff;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
}

.action-text {
  font-size: 0.92rem;
  color: inherit;
}

.match-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  color: #ffffff;
}

.badge-blue { background: #2563eb; }
.badge-purple { background: #7c3aed; }
.badge-orange { background: #ea580c; }
.badge-teal { background: #0d9488; }
.badge-pink { background: #db2777; }
</style>
