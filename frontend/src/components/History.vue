/** This component should show user history like: - What quiz theyve taken - What time they got on
the quiz - What day the did the quiz - How many correct vs wrong answers - How much XP they gained
This component should also: - be a compact widget that is shown on users personal page. - be its own
page that shows more info than the compact widget. in quizRoutes.js ->
router.get('/api/quiz/attempts/user/:userId', quizController.getUserAttempts); */

<template>
  <main class="history-page">
    <section class="history">
      <section v-if="!isLoggedIn" class="noHistory">
        <h1>History</h1>
        <p>Log in to see your quiz history.</p>
        <button type="button" class="btn-auth" @click="openLogin">Log in</button>
      </section>

      <template v-else>
        <div class="page-header" v-if="history.length > 0">
          <h1>Here is your history {{ username }}!</h1>
        </div>

        <p v-if="errorMessage">{{ errorMessage }}</p>

        <!-- History table wrap -->
        <div class="table-wrap" v-if="history.length > 0">
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
              <tr v-for="attempt in history" :key="attempt.id">
                <td>{{ new Date(attempt.completedAt).toLocaleDateString() }}</td>
                <td>{{ attempt.quizname }}</td>
                <td>{{ attempt.difficulty }}</td>
                <td>{{ attempt.score }} / {{ attempt.maxScore }}</td>
                <td>{{ formatDuration(attempt.timeSpentSeconds) }}</td>
              </tr>
            </tbody>
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

        <section v-else-if="!loading" class="noHistory">
          <p>You haven't completed any quizzes yet.</p>
          <RouterLink to="/categories" class="btn-auth">Choose your first quiz here!</RouterLink>
        </section>
      </template>
    </section>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useLoginModal } from '@/composables/useLoginModal'
import { fetchUserAttempts } from '@/services/quizService'

const history = ref([])
const errorMessage = ref('')
const loading = ref(false)
const { user, isLoggedIn, username } = useAuth()
const { openLogin } = useLoginModal()

watch(
  () => user.value?.id,
  async (userId) => {
    errorMessage.value = ''
    if (!userId) {
      history.value = []
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

function formatDuration(seconds) {
  const value = Number(seconds) || 0
  if (value <= 0) return '0s'
  const mins = Math.floor(value / 60)
  const secs = value % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

function getTotalScore() {
  let totalScore = 0

  for (const attempt of history.value) {
    totalScore = totalScore + (Number(attempt.score) || 0)
  }

  return totalScore
}

function getTotalTime() {
  let totalTime = 0

  for (const attempt of history.value) {
    totalTime = totalTime + (Number(attempt.timeSpentSeconds) || 0)
  }

  return totalTime
}
</script>

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

/* Button to start your first quiz */
button {
  padding: 0.75rem 1.5rem;
  border-radius: 40px;
  cursor: pointer;
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

button a {
  color: var(--color-text-white);
  font-weight: 600;
  letter-spacing: 2px;
  text-decoration: none;
}

button:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
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
