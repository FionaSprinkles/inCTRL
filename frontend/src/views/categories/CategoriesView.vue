<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchQuizzes, fetchCategories, fetchUserAttempts, filterQuizzes } from '@/services/quizService'
import { useAuth } from '@/composables/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ListQuizzesCard from '@/components/ListQuizzesCard.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const quizzes = ref([])
const categories = ref([])
const userAttempts = ref([])
const loading = ref(true)
const error = ref('')
const attemptsUnavailable = ref(false)

const selectedCategory = ref('all')
const selectedDifficulty = ref('all')

const filteredQuizzes = computed(() => {
  return filterQuizzes(quizzes.value, {
    categoryId: selectedCategory.value,
    difficulty: selectedDifficulty.value,
  })
})

const bestScores = computed(() => {
  const map = {}
  for (const attempt of userAttempts.value) {
    if (!attempt.quizId) continue
    const prev = map[attempt.quizId]
    if (!prev || attempt.score > prev.score) {
      map[attempt.quizId] = {
        score: attempt.score,
        maxScore: attempt.maxScore,
      }
    }
  }
  return map
})

async function loadData() {
  const qQuizId = route.query.id || route.query.quizId
  if (qQuizId) {
    router.replace({ path: '/quiz', query: { id: qQuizId } })
    return
  }

  loading.value = true
  error.value = ''
  attemptsUnavailable.value = false
  try {
    const requestedUserId = user.value?.id
    const attemptsRequest = requestedUserId
      ? fetchUserAttempts(requestedUserId).then(
          (attempts) => ({ attempts, failed: false }),
          () => ({ attempts: [], failed: true }),
        )
      : Promise.resolve({ attempts: [], failed: false })
    const [qData, cData, aResult] = await Promise.all([
      fetchQuizzes(),
      fetchCategories(),
      attemptsRequest,
    ])
    quizzes.value = qData
    categories.value = cData
    if (user.value?.id === requestedUserId) {
      userAttempts.value = aResult.attempts
      attemptsUnavailable.value = aResult.failed
    }
  } catch (err) {
    error.value = err.message || 'Failed to load quizzes from backend.'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  selectedCategory.value = 'all'
  selectedDifficulty.value = 'all'
  if (route.params.slug || route.query.category || route.query.categoryId || route.query.difficulty) {
    router.replace('/categories')
  }
}


function startQuiz(quiz) {
  if (!quiz || !quiz.id) return
  router.push({ path: '/quiz', query: { id: quiz.id } })
}

watch(
  [() => route.params.slug, () => route.query.category, () => route.query.categoryId, categories],
  ([slug, cat, catId]) => {
    const raw = slug || cat || catId
    const matched =
      raw && categories.value.find((c) => c.slug === raw || String(c.id) === String(raw))
    selectedCategory.value = matched ? matched.id : raw || 'all'
  },
  { immediate: true },
)

watch(
  () => route.query.difficulty,
  (diff) => {
    selectedDifficulty.value = diff || 'all'
  },
  { immediate: true },
)

watch(
  () => user.value?.id,
  async (userId) => {
    attemptsUnavailable.value = false
    if (!userId) {
      userAttempts.value = []
      return
    }
    try {
      const attempts = await fetchUserAttempts(userId)
      if (user.value?.id === userId) {
        userAttempts.value = attempts
      }
    } catch {
      if (user.value?.id === userId) {
        userAttempts.value = []
        attemptsUnavailable.value = true
      }
    }
  },
)

onMounted(loadData)
</script>

<template>
  <div class="quiz-page">
    <div class="quiz-selection-view">
      <header class="quiz-page-header">
        <h1>Windows Shortcut Quizzes</h1>
        <p class="subtitle">Choose a category, a difficulty, or both to start practicing.</p>
      </header>

      <section class="filters-bar" aria-label="Quiz Filters">
        <div class="filter-group">
          <label for="category-filter">Category</label>
          <select
            id="category-filter"
            v-model="selectedCategory"
            class="filter-select"
          >
            <option value="all">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="difficulty-filter">Difficulty</label>
          <select id="difficulty-filter" v-model="selectedDifficulty" class="filter-select">
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <button
          v-if="selectedCategory !== 'all' || selectedDifficulty !== 'all'"
          type="button"
          class="btn-reset"
          @click="resetFilters"
        >
          Reset Filters
        </button>
      </section>

      <p v-if="attemptsUnavailable" class="attempts-notice" role="status">
        Quiz history could not be loaded. Best scores are hidden.
      </p>

      <div v-if="loading" class="status-box">
        <LoadingSpinner size="md" text="Loading quizzes from backend..." />
      </div>

      <div v-else-if="error" class="status-box error-box" role="alert">
        <p>{{ error }}</p>
        <button type="button" class="btn-retry" @click="loadData">Retry</button>
      </div>

      <div v-else-if="filteredQuizzes.length === 0" class="status-box empty-box" role="status">
        <p class="no-quizzes-message">No quizzes fit the selected parameters.</p>
        <p class="empty-hint">Try selecting a different category or difficulty level.</p>
        <button type="button" class="btn-clear" @click="resetFilters">Show All Quizzes</button>
      </div>


      <ListQuizzesCard
        v-else
        :filteredQuizzes="filteredQuizzes"
        @start-quiz="startQuiz"
      />
      
    </div>
  </div>
</template>

<style scoped>
.quiz-page {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  box-sizing: border-box;
  font-family: var(--font-body), sans-serif;
}

.quiz-selection-view {
  width: 100%;
}

.quiz-page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.quiz-page-header h1 {
  font-family: var(--font-heading), serif;
  font-size: 38px;
  font-weight: 370;
  color: var(--color-text-heading);
  margin-top: 10px;
  margin-bottom: 8px;
}

.subtitle {
  font-family: var(--font-body), sans-serif;
  color: var(--color-text-main);
  font-size: 17px;
  letter-spacing: 0.5px;
  margin-top: 0;
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.25rem;
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: rgba(18, 86, 98, 0.5);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
  min-width: 180px;
}

.filter-group label {
  font-family: var(--font-display), serif;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 1.5px;
  color: var(--color-text-heading);
}

.filter-select {
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  color: var(--color-text-heading);
  font-size: 0.95rem;
  outline: none;
  font-family: var(--font-body), sans-serif;

  background: linear-gradient(180deg, rgba(10, 40, 50, 0.65) 0%, rgba(10, 40, 50, 0.45) 100%);
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

@supports (appearance: base-select) {
  .filter-select,
  .filter-select::picker(select) {
    appearance: base-select;
  }

  .filter-select::picker(select) {
    margin-top: 6px;
    padding: 0.5rem;
    border-radius: 20px;

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
  }

  .filter-select option {
    text-align: left;
    border: none;
    color: var(--color-text-main);
    padding: 0.45rem 0.6rem;
    background: transparent;
    border-radius: 10px;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;
    font-family: var(--font-body), sans-serif;
    font-size: 14px;
    font-weight: 340;
  }

  .filter-select option:hover {
    box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
    transition: all 0.3s ease;
    color: var(--color-dark-accenturate);
    background: var(--color-light-accenturate);
    font-weight: 600;
  }

  .filter-select option:checked {
    background: var(--color-light-accenturate);
    font-weight: 600;
    color: var(--color-dark-accenturate);
  }
}

.btn-reset {
  font-family: var(--font-display), serif;
  color: var(--color-text-white);
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.6rem 1.15rem;
  border-radius: 10px;
  cursor: pointer;

  background: linear-gradient(180deg, rgba(10, 40, 50, 0.65) 0%, rgba(10, 40, 50, 0.45) 100%);
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

.btn-reset:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
}

.attempts-notice {
  text-align: center;
  margin: -1rem 0 1.5rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.status-box {
  padding: 2.5rem 1.5rem;
  text-align: center;
  background: rgba(18, 86, 98, 0.5);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.empty-box .no-quizzes-message {
  font-family: var(--font-display), serif;
  font-size: 1.35rem;
  color: var(--color-text-heading);
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-family: var(--font-body), sans-serif;
  color: var(--color-text-main);
  margin-bottom: 1.25rem;
}

.btn-clear {
  font-family: var(--font-display), serif;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  border: 1px solid var(--color-button-border);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  background: var(--color-button-hover);
}

.error-box {
  border-color: #ef4444;
  color: #fecaca;
  background: rgba(127, 29, 29, 0.45);
}

.btn-retry {
  font-family: var(--font-display), serif;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  border: 1px solid var(--color-button-border);
  font-weight: 600;
  cursor: pointer;
}



</style>
