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
        <h2>Your history</h2>

        <!-- History table-->

        <table>
          <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
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
            <td>Category</td>
            <td>{{ attempt.quizname }}</td> <!--Should there be a button somewhere to redo quiz? -->
            <td>Difficulty</td>
            <td>{{ attempt.score }} / {{ attempt.maxScore }}</td>
            <td>{{ attempt.timeSpentSeconds }}</td>
            
          </tr>
          </tbody>

          <!-- Lil summary maybe-->
          <tfoot>
            <tr>
              <th>Total time</th>
              <th>Total score</th>
            </tr>
          </tfoot>
        </table>

        <!-- Message for empty history users-->

  </section>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'


const history = ref([])
const { user } = useAuth()

async function fetchHistory() {
  try {
    const response = await fetch(`/api/quiz/attempts/user/${user.value.id}`)

    if (!response.ok) {
      throw new Error('Could not fetch history')
    }

    const data = await response.json()
    history.value = data.attempts || []
  } catch (error) {
    console.error('Error fetching history:', error)
  }
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>

.history {
  margin: 0 auto;
  text-align: center;
}
table {
  padding: 3rem;
}

th{
  padding: 2rem;
}

td{
  padding: 1rem;
}

</style>