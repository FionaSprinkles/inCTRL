/** This component should show user history like: - What quiz theyve taken - What time they got on
the quiz - What day the did the quiz - How many correct vs wrong answers - How much XP they gained
This component should also: - be a compact widget that is shown on users personal page. - be its own
page that shows more info than the compact widget. in quizRoutes.js ->
router.get('/api/quiz/attempts/user/:userId', quizController.getUserAttempts); */

<template>
  <main class="history-page">  
    <section class="history">

    <section v-if="!isLoggedIn" class="noHistory">
      <p>Log in to see your quiz history.</p>
      <button type="button" class="btn-auth" @click="openLogin">Log in</button>
    </section>

    
    <template v-else>

      <div v-if="!compact">
        <div class="page-header">
          <h1>Here is your history {{ username }}!</h1>
        </div>

        <!-- History table-->
                  
        <!-- Loading -->
        <LoadingSpinner
          v-if="loading"
          size="md"
          text="Loading history..."
        />
        <!-- Message for empty history users-->
        <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
        <section class="noHistory" v-else-if="history.length === 0">
        <p>You haven't completed any quizzes yet.</p>
        <RouterLink class="btn-action" to="/categories">Choose your first quiz here!</RouterLink>
        </section>

        <section v-else>
          <section class="filters-bar">
            <div class="filter-group">
              <label for="category-filter">Category</label>

              <select
                id="category-filter"
                class="filter-select"
                v-model="selectedCategory"
              >
                <option value="all">All</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
              <p v-if="categoriesError" class="error">
                {{ categoriesError }}
              </p>
            </div>
          </section>

          <p v-if="filteredHistory.length === 0">
            No quiz history found in this category.
          </p>
        
        <div class="table-wrap" v-else="history.length > 0">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Quiz name</th>
              <th>Difficulty</th>
              <th>Score</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attempt in filteredHistory" :key="attempt.id">
              <td>{{ new Date(attempt.completedAt).toLocaleDateString() }}</td>
              <td>{{ attempt.quizname }}</td>
              <td>{{ attempt.difficulty }}</td>
              <td>{{ attempt.score }} / {{ attempt.maxScore }}</td>
              <td>{{ formatDuration(attempt.timeSpentSeconds) }}</td>
            </tr>
          </tbody>

            <!-- Lil summary maybe-->

            <tfoot>
                <tr>
                  <td colspan="5" class="footer-combined">
                    <div class="footer-content">
                      <div class="footer-item">
                        <span class="footer-title">Total score:</span>
                        <span class="footer-value">{{ getTotalScore() }}</span>
                      </div>
                      <div class="footer-item">
                        <span class="footer-title">Total time:</span>
                        <span class="footer-value">{{ formatDuration(getTotalTime()) }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>

          </table>
        </div>
        </section>


      </div>
    

         <!-- Compact widget -->
      
    <div class="compact" v-else>
      <h2>Latest activities</h2>

      <!-- Loading -->
      <LoadingSpinner
        v-if="loading"
        size="md"
        text="Loading history..."
      />

      
      <!-- Message for empty history users -->
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <section class="noHistory" v-else-if="history.length === 0">
      <p>You haven't completed any quizzes yet.</p>
      <RouterLink class="btn-action" to="/categories">Choose your first quiz here!</RouterLink>
      </section>
      

      <div v-else>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Quiz name</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="attempt in history.slice(0, 3)"
              :key="attempt.id"
              >
              <td>{{ new Date(attempt.completedAt).toLocaleDateString() }}</td>
              <td>{{ attempt.quizname }}</td>
              <td>{{ attempt.score }} / {{ attempt.maxScore }}</td>
            </tr>
          </tbody>
        </table>
        
        <RouterLink class="btn-action" to="/history">
          View full history
        </RouterLink>
      </div>
    </div>
    </template>
  </section>
</main>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { RouterLink } from 'vue-router'
import LoadingSpinner from './LoadingSpinner.vue';
import { useLoginModal } from '@/composables/useLoginModal'
import { fetchUserAttempts, fetchCategories } from '@/services/quizService'

const history = ref([])
const errorMessage = ref('')
const loading = ref(false)
const { user, isLoggedIn, username } = useAuth()
const { openLogin } = useLoginModal()
const categories = ref([])
const selectedCategory = ref('all')
const categoryError = ref('')


// component is displayed as a compact widget or not
defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

// Fetch all categories
async function loadCategories() {
  try {
    categoryError.value = ''
    categories.value = await fetchCategories()
  } catch (error) {
    console.error('Could not load categories:', error)
    categoryError.value = 'Could not load categories.'
  }
}

loadCategories()

//filter categories
const filteredHistory = computed(() => {
  if (selectedCategory.value === 'all') {
    return history.value
  }

  return history.value.filter(
    attempt => String(attempt.categoryId) === String(selectedCategory.value)
  )
})

//fetch user history 
watch(
  () => user.value?.id,
  async (userId) => {
    errorMessage.value = ''
    history.value = []
    if (!userId) {

      loading.value = false
      return
    }

    loading.value = true
    try {
      const attempts = await fetchUserAttempts(userId)
      if (user.value?.id !== userId) return
      history.value = attempts
    } catch (error) {
      console.error('Error fetching history:', error)
      if (user.value?.id !== userId) return
      history.value = []
      errorMessage.value = 'Could not load your history.'
    } finally {
      if (user.value?.id === userId) loading.value = false
    }
  },
  { immediate: true },
)


//format to seconds
function formatDuration(seconds) {
  const value = Number(seconds) || 0
  if (value <= 0) return '0s'
  const mins = Math.floor(value / 60)
  const secs = value % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}


//Total score function
function getTotalScore() {
  let totalScore = 0

  for (const attempt of filteredHistory.value) {
    totalScore = totalScore + (Number(attempt.score) || 0)
  }

  return totalScore
}

function getTotalTime() {
  let totalTime = 0

  for (const attempt of filteredHistory.value) {
    totalTime = totalTime + (Number(attempt.timeSpentSeconds) || 0)
  }

  return totalTime
}
</script>


// ==== STYLE ====//

<style scoped>
.history-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.page-header h1 {
  color: var(--color-text-white);
  font-size: 2.5rem;
  margin-bottom: 0.2rem;
  letter-spacing: 2px;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 20px;
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
  margin: 2rem auto;
  width: 100%;
}

.history {
  width: 100%;
  box-sizing: border-box;
}

table {
  width: 100%;
  border-collapse: collapse;
  padding: 0;
}




/* loginbuton*/
.btn-auth {
  display: inline-block;
  padding: 0.3rem 0.9rem;
}

tr {
  font-size: 16px;
  font-weight: 340;
  letter-spacing: 1px;
  color: var(--color-text-main);
}

th,
td {
  padding: 1.5rem;
  text-align: left;
  vertical-align: middle;
}

th {
  font-family: var(--font-display), serif;
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-main);
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
}

td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--color-text-white);
}

tbody tr:last-child td {
  border-bottom: none;
}

tfoot td {
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.15);
  font-weight: 400;
  color: var(--color-text-main);
}

tfoot tr:first-child th {
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 16px;
  padding-bottom: 0.5rem;
}

.footer-label {
  text-align: right;
}

.footer-combined {
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.15);
  padding: 1.2rem 1.5rem !important;
}

.footer-content {
  display: flex;
  justify-content: center;
  gap: 3rem;
  align-items: center;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-title {
  font-size: 15px;
  color: var(--color-text-main);
  font-weight: 400;
}

.footer-value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-main);
}

.noHistory {
  margin: 4rem auto;
  max-width: 500px;
  text-align: center;
  padding: 3rem;
  border-radius: 20px;
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

.noHistory p {
  color: var(--color-text-white);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.btn-action {
  display: inline-block;
  padding: 0.85rem 2rem;
  background-color: var(--color-dark-teal);
  color: var(--color-text-white);
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(10, 40, 50, 0.2);
  white-space: nowrap;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(10, 40, 50, 0.3);
}

/* FILTER */
/*Same filter as in categoryView*/

.filter-select {
  width: 30%;
  
  min-width: 280px;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  color: var(--color-text-white);
  font-size: 0.95rem;
  outline: none;
  font-family: var(--font-body), sans-serif;

  background: linear-gradient(
    180deg,
    rgba(10, 40, 50, 0.65) 0%,
    rgba(10, 40, 50, 0.45) 100%
  );

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


.filters-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 40%;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
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

.filter-group {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  min-width: 180px;
  flex: none;
}

.filter-group label {
  font-family: var(--font-display), serif;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 1.5px;
  color: var(--color-text-white);
}


/* COMPACT WIDGET */
.compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  min-width: 0;
  padding: 2.5rem;
  background: #ffffff;
  border: 1px solid rgba(220, 225, 230, 0.8);
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
}

.compact h2 {
  font-family: var(--font-display);
  color: var(--color-dark-teal);
  text-transform: none;
  letter-spacing: 1px;
  font-size: 32px;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

.compact table {
  margin: 0;
  padding: 0;
  width: 100%;
  table-layout: fixed;
}

.compact th,
.compact td {
  padding: 0.75rem;
  overflow-wrap: break-word;
  text-align: center;

}

.compact th {
  color: var(--color-dark-teal);
}

.compact td {
  color: var(--color-text-black);
  border-bottom: 1px solid rgba(23, 52, 79, 0.12);
}


.compact .btn-action {
  margin-top: 0.5rem;
}

.compact .noHistory {
  background: none;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  text-shadow: none;
  padding: 0;
  margin: 0;
  max-width: none;
}


@media (max-width: 600px) {
  table {
    padding: 0.5rem;
  }

  th,
  td {
    padding: 0.6rem;
  }
}
</style>
