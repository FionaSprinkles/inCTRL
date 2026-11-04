/** This component should show user history like:
- What quiz theyve taken
- What time they got on the quiz
- What day the did the quiz
- How many correct vs wrong answers
- How much XP they gained


This component should also:
- be a compact widget that is shown on users personal page.
- be its own page that shows more info than the compact widget.


in quizRoutes.js ->
router.get('/api/quiz/attempts/user/:userId', quizController.getUserAttempts);
*/



<template>
  <section class="history">
    <h1>History</h1>

    <section v-if="!isLoggedIn" class="noHistory">
      <p>Log in to see your quiz history.</p>
      <button type="button" @click="openLogin">Log in</button>
    </section>

    <template v-else>
      <h2>Your history</h2>

      <p v-if="errorMessage">{{ errorMessage }}</p>

      <table v-else-if="history.length > 0">
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
            <th colspan="3"></th>
            <th>Total score</th>
            <th>Total time</th>
          </tr>
          <tr>
            <td colspan="3"></td>
            <td>{{ getTotalScore() }}</td>
            <td>{{ formatDuration(getTotalTime()) }}</td>
          </tr>
        </tfoot>
      </table>

      <section v-else-if="!loading" class="noHistory">
        <p>You haven't completed any quizzes yet.</p>
        <button>
          <RouterLink to="/categories">Choose your first quiz here!</RouterLink>
        </button>
      </section>
    </template>
  </section>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useLoginModal } from '@/composables/useLoginModal'
import { fetchUserAttempts } from '@/services/quizService'

const history = ref([])
const errorMessage = ref('')
const loading = ref(false)
const { user, isLoggedIn } = useAuth()
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

.history {
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
  overflow-x: auto;
  text-align: center;
}
table {
  margin: 0 auto;
  padding: 3rem;
}

th{
  padding: 2rem;
}

td{
  padding: 1rem;
}

.noHistory{
  margin: 0 auto;
  text-align: center;
}

/*The code for the button is from the "all categories page. Should this be i global.css instead?*/ 
button {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

button {
  background: #1d4ed8;
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
