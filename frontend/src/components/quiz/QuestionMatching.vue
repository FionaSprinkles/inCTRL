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
  gap: 10px;
  flex-wrap: wrap;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-main);
  margin-bottom: 14px;
}

.reset-btn {
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: var(--color-text-main);
  cursor: pointer;
  transition: all 0.15s ease;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  color: var(--color-text-heading);
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
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-heading);
  letter-spacing: 1.5px;
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
  background: rgba(15, 76, 92, 0.55);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  color: var(--color-text-main);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.unlink-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.28);
  border-color: #ef4444;
  color: #fecaca;
}

.unlink-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.match-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(15, 76, 92, 0.5);
  border: 1.5px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  color: var(--color-text-main);
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 54px;
}

.match-card:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(15, 76, 92, 0.75);
  color: var(--color-text-heading);
}

.left-card.active {
  border-color: var(--color-button);
  background: rgba(227, 221, 196, 0.22);
  box-shadow: 0 0 0 3px rgba(227, 221, 196, 0.2);
  color: var(--color-text-heading);
}

.right-card.can-link {
  border-style: dashed;
  border-color: rgba(227, 221, 196, 0.6);
}

.match-card.paired {
  border-color: rgba(227, 221, 196, 0.55);
  background: rgba(15, 76, 92, 0.72);
  color: var(--color-text-heading);
}

.match-card.correct {
  border-color: #10b981 !important;
  background: rgba(16, 185, 129, 0.25) !important;
  color: #d1fae5 !important;
}

.match-card.incorrect {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.25) !important;
  color: #fee2e2 !important;
}

.shortcut-text {
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: bold;
  color: var(--color-button);
}

.action-text {
  font-size: 0.95rem;
  color: inherit;
}

.match-pill {
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 12px;
  color: #ffffff;
  white-space: nowrap;
}

.badge-blue { background: #2563eb; }
.badge-purple { background: #7c3aed; }
.badge-orange { background: #d97706; }
.badge-teal { background: #0d9488; }
.badge-pink { background: #db2777; }
</style>
