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
    <div v-if="!compact">
        <h1>History</h1>
        <h2>Your history</h2>



        <!-- History table-->

        <table v-if="history.length > 0">
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
            <!-- The data goeeess heereee-->
             <!--Fetch data from quiz_attempts-->
            <td>{{ new Date( attempt.completedAt).toLocaleDateString() }}</td>
            <td>{{ attempt.quizname }}</td> <!--Should there be a button somewhere to redo quiz? -->
            <td>{{attempt.difficulty}}</td>
            <td>{{ attempt.score }} / {{ attempt.maxScore }}</td>
            <td>{{ attempt.timeSpentSeconds }}</td>
            
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
              <td>{{ getTotalTime() }}</td>
              
            </tr>
          </tfoot>
        </table>
        
        <!-- Loading -->
        <LoadingSpinner
          v-if="isLoading"
          size="md"
          text="Loading history..."
        />

        <!-- Message for empty history users-->
        <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
        <section class="no-history" v-else-if="history.length === 0">
        <p>You haven't completed any quizzes yet.</p>
        <RouterLink class="button" to="/categories">Choose your first quiz here!</RouterLink>
        </section>
    </div>

         <!-- Compact widget -->
      
    <div class="compact" v-else>
      <h2>Your history</h2>

      <!-- Loading -->
      <LoadingSpinner
        v-if="isLoading"
        size="md"
        text="Loading history..."
      />

      
      <!-- Message for empty history users -->
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <section class="" v-else-if="history.length === 0">
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
  </section>
  
</template>
<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { RouterLink } from 'vue-router'
import LoadingSpinner from './LoadingSpinner.vue';

const history = ref([])
const { user } = useAuth()
const errorMessage = ref('')
const isLoading = ref(true)

// component is displayed as a compact widget or not
defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

async function fetchHistory() {

    isLoading.value = true
    errorMessage.value = ''
  try {
    if (!user.value?.id) return
    const response = await fetch(`/api/quiz/attempts/user/${user.value.id}`)

    if (!response.ok) {
      throw new Error('Could not fetch history')
    }

    const data = await response.json()
    history.value = data.attempts || []
  } catch (error) {
    console.error('Error fetching history:', error)
    errorMessage.value = 'Could not load your history. Please try again.'
  }
  finally {
  isLoading.value = false
}


}

watch( // use watch to update page

  () => user.value?.id,
  (newUserId) => {

    if (newUserId) {
      fetchHistory()
    } else { //remove old user data 

      history.value = []
      errorMessage.value = ''
      isLoading.value = false

    }
  },
  { immediate: true }
)

//Total score function
function getTotalScore() {
  let totalScore = 0

  for (const attempt of history.value) {
    totalScore = totalScore + attempt.score
  }

  return totalScore
}

//Total time function
function getTotalTime() {
  let totalTime = 0

  for (const attempt of history.value) {
    totalTime = totalTime + attempt.timeSpentSeconds  }

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

</style>
