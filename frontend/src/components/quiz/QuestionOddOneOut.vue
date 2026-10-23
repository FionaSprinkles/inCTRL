<script setup>
defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, null],
    default: null
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

/**
 * Selects an option and emits its identifier.
 * @param {string} id - Selected option identifier.
 */
function selectOption(id) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="odd-one-out-container">
    <div v-if="question.theme" class="theme-banner">
      <span class="theme-tag">Target Theme:</span>
      <strong>{{ question.theme }}</strong>
      <span class="theme-sub">(3 belong, 1 is the imposter)</span>
    </div>

    <div class="options-grid">
      <button
        v-for="opt in question.options"
        :key="opt.id"
        type="button"
        class="imposter-card"
        :class="{
          selected: modelValue === opt.id,
          imposter: result && opt.id === question.imposterId,
          wrongly_picked: result && modelValue === opt.id && opt.id !== question.imposterId
        }"
        :disabled="disabled"
        @click="selectOption(opt.id)"
      >
        <div class="card-left">
          <kbd class="shortcut-chip">{{ opt.text }}</kbd>
          <span v-if="result" class="item-desc">{{ opt.description }}</span>
        </div>

        <div class="card-right">
          <span v-if="result && opt.id === question.imposterId" class="badge-imposter">
            🚨 IMPOSTER
          </span>
          <span v-else-if="result" class="badge-legit">
            ✓ Fits Theme
          </span>
          <span v-else class="pick-radio"></span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.odd-one-out-container {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.theme-banner {
  background: rgba(15, 76, 92, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-left: 4px solid var(--color-button);
  padding: 12px 16px;
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-heading);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.theme-tag {
  font-family: var(--font-display);
  color: var(--color-button);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.theme-sub {
  color: var(--color-text-main);
  font-size: 0.88rem;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.imposter-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: rgba(15, 76, 92, 0.5);
  border: 1.5px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  color: var(--color-text-main);
  font-family: var(--font-body);
}

.imposter-card:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(15, 76, 92, 0.75);
  color: var(--color-text-heading);
}

.imposter-card.selected {
  border-color: var(--color-button);
  background: rgba(227, 221, 196, 0.22);
  color: var(--color-text-heading);
}

.imposter-card.imposter {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.25) !important;
  color: #fee2e2 !important;
}

.imposter-card.wrongly_picked {
  border-color: rgba(255, 255, 255, 0.25);
  opacity: 0.75;
}

.card-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shortcut-chip {
  display: inline-block;
  padding: 5px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-button);
  width: fit-content;
}

.item-desc {
  font-size: 0.88rem;
  color: var(--color-text-main);
}

.pick-radio {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--color-text-muted);
}

.imposter-card.selected .pick-radio {
  border-color: var(--color-button);
  background: var(--color-button);
  box-shadow: inset 0 0 0 3px var(--color-dark-teal);
}

.badge-imposter {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  color: #fecaca;
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 4px 10px;
  border-radius: 6px;
}

.badge-legit {
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: #6ee7b7;
  font-weight: 600;
}
</style>
