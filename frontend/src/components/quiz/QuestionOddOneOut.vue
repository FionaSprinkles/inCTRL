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
  background: #f1f5f9;
  border-left: 4px solid #f59e0b;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.theme-tag {
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 700;
}

.theme-sub {
  color: #94a3b8;
  font-size: 0.85rem;
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
  background: var(--color-background-soft, #f8fafc);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  color: inherit;
}

.imposter-card:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.imposter-card.selected {
  border-color: #f59e0b;
  background: #fffbeb;
}

.imposter-card.imposter {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.imposter-card.wrongly_picked {
  border-color: #94a3b8;
  opacity: 0.7;
}

.card-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shortcut-chip {
  display: inline-block;
  padding: 4px 10px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-bottom: 2px solid #94a3b8;
  border-radius: 5px;
  font-family: monospace;
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
  width: fit-content;
}

.item-desc {
  font-size: 0.85rem;
  color: #64748b;
}

.pick-radio {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #94a3b8;
}

.imposter-card.selected .pick-radio {
  border-color: #f59e0b;
  background: #f59e0b;
  box-shadow: inset 0 0 0 3px #ffffff;
}

.badge-imposter {
  font-weight: 700;
  font-size: 0.85rem;
  color: #ef4444;
  background: #fee2e2;
  padding: 4px 8px;
  border-radius: 4px;
}

.badge-legit {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 600;
}
</style>
