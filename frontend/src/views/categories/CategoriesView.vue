<script setup>
import { ref, onMounted } from 'vue'

const categories = ref([])
const loading = ref(true)
const error = ref('')
const selectedCategory = ref(null)

async function fetchCategories() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/categories')
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `Internal server error (${res.status})`)
    }
    const data = await res.json()
    categories.value = data.categories || []
  } catch (err) {
    error.value = err.message || 'Server is not responding. Please try again.'
  } finally {
    loading.value = false
  }
}

function pickQuiz(category) {
  selectedCategory.value = category
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="categories-container">
    <h1>Windows Shortcut Categories</h1>
    <p class="subtitle">Select a category to pick a quiz.</p>

    <!-- Error message if server doesn't respond or returns an internal error -->
    <div v-if="error" class="error-box" role="alert">
      <p><strong>Error:</strong> {{ error }}</p>
      <button type="button" class="retry-btn" @click="fetchCategories">Retry</button>
    </div>

    <!-- Loading indicator -->
    <div v-else-if="loading" class="loading-box">
      <p>Loading categories...</p>
    </div>

    <!-- Categories List -->
    <div v-else class="categories-list">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="category-item"
        :class="{ active: selectedCategory?.id === cat.id }"
      >
        <div class="category-info">
          <h3>{{ cat.name }}</h3>
          <p>{{ cat.description }}</p>
          <span class="count-badge">{{ cat.shortcutCount || 0 }} shortcuts</span>
        </div>
        <button type="button" class="pick-btn" @click="pickQuiz(cat)">
          Pick Quiz
        </button>
      </div>
    </div>

    <!-- Picked Quiz selection info -->
    <div v-if="selectedCategory" class="selected-box">
      <h3>Picked: {{ selectedCategory.name }}</h3>
      <p>Quizzes for this category are in development and will be available soon.</p>
      <button type="button" class="clear-btn" @click="selectedCategory = null">Close</button>
    </div>
  </div>
</template>

<style scoped>
.categories-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #888;
  margin-bottom: 1.5rem;
}

.error-box {
  background: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-btn {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.loading-box {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.categories-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.category-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
}

@media (prefers-color-scheme: dark) {
  .category-item {
    background: #1f2937;
    border-color: #374151;
  }
}

.category-item.active {
  border-color: #2563eb;
}

.category-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
}

.category-info p {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.75rem;
}

@media (prefers-color-scheme: dark) {
  .category-info p {
    color: #9ca3af;
  }
}

.count-badge {
  display: inline-block;
  font-size: 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.pick-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.pick-btn:hover {
  background: #1d4ed8;
}

.selected-box {
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid #93c5fd;
  background: #eff6ff;
  color: #1e3a8a;
  border-radius: 8px;
}

@media (prefers-color-scheme: dark) {
  .selected-box {
    background: #1e293b;
    border-color: #3b82f6;
    color: #93c5fd;
  }
}

.clear-btn {
  margin-top: 0.5rem;
  background: transparent;
  border: 1px solid currentColor;
  color: inherit;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
