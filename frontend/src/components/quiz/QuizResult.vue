<script setup>
import { computed } from 'vue'

const props = defineProps({
  category: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    default: '',
  },
  correctCount: {
    type: Number,
    required: true,
  },
  questionCount: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  seconds: {
    type: Number,
    required: true,
  },
})

defineEmits(['restart'])

function amount(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  const rounded = Math.round(n * 100) / 100
  return String(rounded)
}

function field(value) {
  return value || '-'
}

const timeLabel = computed(() => (props.seconds === 1 ? '1 second' : `${props.seconds} seconds`))
</script>

<template>
  <section class="result">
    <h1>Result</h1>
    <p class="tally">{{ correctCount }} / {{ questionCount }}</p>

    <dl class="sheet">
      <div class="row">
        <dt>Category</dt>
        <dd>{{ field(category) }}</dd>
      </div>
      <div class="row">
        <dt>Difficulty</dt>
        <dd>{{ field(difficulty) }}</dd>
      </div>
      <div class="row">
        <dt>Correct</dt>
        <dd>{{ correctCount }} of {{ questionCount }}</dd>
      </div>
      <div class="row">
        <dt>Score</dt>
        <dd>{{ amount(score) }} / {{ amount(maxScore) }}</dd>
      </div>
      <div class="row">
        <dt>Time</dt>
        <dd>{{ timeLabel }}</dd>
      </div>
    </dl>

    <button type="button" class="again" @click="$emit('restart')">Take the same quiz again</button>

    <p class="exits">
      <RouterLink to="/categories">Categories</RouterLink>
      <RouterLink to="/">Home</RouterLink>
    </p>
  </section>
</template>

<style scoped>
.result {
  max-width: 520px;
  margin: 0 auto;
  padding: 1.25rem 0 2.5rem;
  text-align: center;
}

.result h1 {
  margin-bottom: 0.2rem;
}

.tally {
  margin: 0 0 1.75rem;
  font-family: var(--font-heading), serif;
  font-size: 4.25rem;
  font-weight: 370;
  line-height: 1;
  letter-spacing: 0;
  color: var(--color-light-accenturate);
}

.sheet {
  margin: 0 0 1.5rem;
  text-align: left;
  background: linear-gradient(180deg, rgba(10, 40, 50, 0.7) 0%, rgba(10, 40, 50, 0.5) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  border-radius: 20px;
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.9rem 1.15rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.row:last-child {
  border-bottom: none;
}

dt {
  margin: 0;
  color: var(--color-light-accenturate);
  font-family: var(--font-body), sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
}

dd {
  margin: 0;
  color: var(--color-text-white);
  font-family: var(--font-body), sans-serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0;
  text-align: right;
}

.again {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  color: var(--color-text-main);
  font-weight: 500;
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

.again:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
  color: var(--color-text-white);
}

.exits {
  display: flex;
  justify-content: center;
  gap: 1.75rem;
  margin: 1.15rem 0 0;
}

.exits a {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
