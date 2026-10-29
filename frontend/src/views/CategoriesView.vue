<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchQuizzes, fetchCategories, filterQuizzes } from '@/services/quizService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

const quizzes = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref('')

const selectedCategory = ref('all')
const selectedDifficulty = ref('all')

const filteredQuizzes = computed(() => {
  return filterQuizzes(quizzes.value, {
    categoryId: selectedCategory.value,
    difficulty: selectedDifficulty.value,
  })
})

async function loadData() {
  const qQuizId = route.query.id || route.query.quizId
  if (qQuizId) {
    router.replace({ path: '/quiz', query: { id: qQuizId } })
    return
  }

  loading.value = true
  error.value = ''
  try {
    const [qData, cData] = await Promise.all([fetchQuizzes(), fetchCategories().catch(() => [])])
    quizzes.value = qData
    categories.value = cData





  } catch (err) {
    error.value = err.message || 'Failed to load quizzes from backend.'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  selectedCategory.value = 'all'
  selectedDifficulty.value = 'all'
}

function startQuiz(quiz) {
  if (!quiz || !quiz.id) return
  router.push({ path: '/quiz', query: { id: quiz.id } })
}

watch(
  () => route.query,
  (q) => {
    selectedCategory.value = q.category || q.categoryId || 'all'
    selectedDifficulty.value = q.difficulty || 'all'
  },
  { immediate: true },
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
          <select id="category-filter" v-model="selectedCategory" class="filter-select">
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

      <div v-else class="quiz-grid">
        <article v-for="quiz in filteredQuizzes" :key="quiz.id" class="quiz-card">
          <div class="quiz-tags">
            <span class="badge category-badge">{{ quiz.categoryName || 'General' }}</span>
            <span class="badge diff-badge" :class="quiz.difficulty?.toLowerCase()">{{
              quiz.difficulty
            }}</span>
          </div>
          <h2 class="quiz-title">{{ quiz.title }}</h2>
          <p class="quiz-description">{{ quiz.description }}</p>
          <div class="quiz-footer">
            <span class="question-count">{{ quiz.questionCount || 0 }} questions</span>
            <button type="button" class="btn-start" @click="startQuiz(quiz)">Start Quiz</button>
          </div>
        </article>
      </div>
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
  font-family: var(--font-body);
}

.quiz-selection-view {
  width: 100%;
}

.quiz-page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.quiz-page-header h1 {
  font-family: var(--font-heading);
  font-size: 38px;
  font-weight: 370;
  color: var(--color-text-heading);
  margin-top: 10px;
  margin-bottom: 8px;
}

.subtitle {
  font-family: var(--font-body);
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
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 1.5px;
  color: var(--color-text-heading);
}

.filter-select {
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: var(--color-dark-teal);
  color: var(--color-text-heading);
  font-size: 0.95rem;
  outline: none;
  font-family: var(--font-body);
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  border-color: var(--color-button);
}

.filter-select option {
  background: var(--color-dark-teal);
  color: var(--color-text-heading);
}

.btn-reset {
  font-family: var(--font-display);
  color: var(--color-text-main);
  font-size: 16px;
  letter-spacing: 1px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  padding: 0.6rem 1.15rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-heading);
  border-color: rgba(255, 255, 255, 0.45);
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
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--color-text-heading);
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-family: var(--font-body);
  color: var(--color-text-main);
  margin-bottom: 1.25rem;
}

.btn-clear {
  font-family: var(--font-display);
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
  font-family: var(--font-display);
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

.quiz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 1.25rem;
}

.quiz-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.4rem;
  border-radius: 20px;
  background: rgba(18, 86, 98, 0.52);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.quiz-card:hover {
  border-color: rgba(255, 255, 255, 0.45);
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);
}

.quiz-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  font-family: var(--font-display);
  font-size: 0.8rem;
  padding: 0.2rem 0.65rem;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.category-badge {
  background: rgba(133, 180, 190, 0.28);
  color: var(--color-text-heading);
  border: 1px solid rgba(133, 180, 190, 0.45);
}

.diff-badge.beginner {
  background: rgba(16, 185, 129, 0.28);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.45);
}

.diff-badge.intermediate {
  background: rgba(245, 158, 11, 0.28);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.45);
}

.diff-badge.advanced {
  background: rgba(239, 68, 68, 0.28);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.45);
}

.quiz-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 450;
  margin: 0 0 0.5rem;
  color: var(--color-text-heading);
  letter-spacing: 0.5px;
  text-transform: none;
}

.quiz-description {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-main);
  margin-bottom: 1.25rem;
  flex-grow: 1;
}

.quiz-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.question-count {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-main);
}

.btn-start {
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.5rem 1.15rem;
  border-radius: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 600;
  border: 1px solid var(--color-button-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-start:hover {
  background: var(--color-button-hover);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.35);
}
</style>
