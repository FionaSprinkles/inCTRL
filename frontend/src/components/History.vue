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

    <section v-if="!isLoggedIn" class="noHistory">
      <p>Log in to see your quiz history.</p>
      <button type="button" class="btn-auth" @click="openLogin">Log in</button>
    </section>

    
    <template v-else>
      <h1>History</h1>
      <div v-if="!compact">
      <h2>Your history</h2>

        <!-- History table-->
                  
        <!-- Loading -->
      <LoadingSpinner
        v-if="loading"
        size="md"
        text="Loading history..."
      />
        <!-- Message for empty history users-->
        <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
        <section class="no-history" v-else-if="history.length === 0">
        <p>You haven't completed any quizzes yet.</p>
        <RouterLink class="button" to="/categories">Choose your first quiz here!</RouterLink>
        </section>

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

          <!-- Lil summary maybe-->
          <tfoot>
            <tr>
              <th colspan= "3"></th>
              <th>Total score</th>
              <th>Total time</th>
              
            </tr>
            <tr>
              <td colspan= "3"></td>
              <td>{{ getTotalScore() }}</td>
              <td>{{ formatDuration(getTotalTime()) }}</td>
              
            </tr>
          </tfoot>
        </table>


      </div>
    

         <!-- Compact widget -->
      
    <div class="compact" v-else>
      <h2>Your history</h2>

      <!-- Loading -->
      <LoadingSpinner
        v-if="loading"
        size="md"
        text="Loading history..."
      />

      
      <!-- Message for empty history users -->
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <section class="no-history" v-else-if="history.length === 0">
      <p>You haven't completed any quizzes yet.</p>
      <RouterLink class="button" to="/categories">Choose your first quiz here!</RouterLink>
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
        
        <RouterLink class="button" to="/history">
          View full history
        </RouterLink>
      </div>
    </div>
    </template>
  </section>
</template>


<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { RouterLink } from 'vue-router'
import LoadingSpinner from './LoadingSpinner.vue';
import { useLoginModal } from '@/composables/useLoginModal'
import { fetchUserAttempts } from '@/services/quizService'

const history = ref([])
const errorMessage = ref('')
const loading = ref(false)
const { user, isLoggedIn } = useAuth()
const { openLogin } = useLoginModal()

// component is displayed as a compact widget or not
defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})


//fetch user history 
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
  text-align: center;
}
table {
  margin: 0 auto;
  padding: 3rem;
}

th{
  padding: 2rem;
  overflow-wrap: anywhere;
}

td{
  padding: 1rem;
  overflow-wrap: anywhere;
}

.button {
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

.button:hover {
  background: var(--color-button-hover);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.35);
.noHistory{
  margin: 0 auto;
  text-align: center;
}

/* loginbuton*/

.btn-auth {
  display: inline-block;
  padding: 0.3rem 0.9rem;
  font-size: 16px;
  border-radius: 40px;
  text-decoration: none;
  color: var(--color-text-main);

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

.btn-auth:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  color: var(--color-text-main);
}

/* COMPACT WIDGET */ 

.compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.compact h2 {
  margin: 0;
}

.compact table {
  margin: 0;
  padding: 0;
}

.compact th,
.compact td {
  padding: 0.75rem;
  overflow-wrap: anywhere;
}

.compact .button {
  margin-top: 0.5rem;
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
}

</style>
