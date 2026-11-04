/**
This is a template for all different quiz-category startpages. 
Shows name, description and fetches relevant quizzes  of that category.
Sorts quizzes by difficulty

It should be connected to backend -> data -> categoriesSeed.json to read slug.

Flow:
Frontend categoryViewTemplate collects data from the endpoint in backend.

categoriesSeed.json
+
MySQL
+
GET /api/categories/:slug
+
categoryViewTemplate.vue
*/

<template>
  
    <p v-if="loading">Loading category...</p>

    <section v-else-if="error">
      <p >{{ error }}</p>
      <button class="btn-retry" @click="fetchCategory">Try again</button>
    </section>

    <main v-else-if="category">
      <h1>{{ category.name }}</h1>
      <p>{{ category.description }}</p>

    <section>
      <h2>Available quizzes in this category</h2>

      <p v-if="attemptsUnavailable">
        Quiz history could not be loaded. Best scores are temporarily unavailable.
      </p>

      <ListQuizzesCard v-if="sortedQuizzes.length > 0" class="quizCard"
        :filteredQuizzes="sortedQuizzes"
        :bestScores="bestScores"
        @start-quiz="startQuiz"
      />

      <p v-else>
        No quizzes are available in this category yet.
      </p>

      
        <RouterLink class="all-quizzes" to="/categories">Go to all quizzes!</RouterLink>
    </section>

  </main>


</template>



<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchQuizzes, filterQuizzes, fetchUserAttempts } from '@/services/quizService'
import ListQuizzesCard from '@/components/ListQuizzesCard.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()

const category = ref(null) // gets information of what the category contains, like id, name, slug and description
const quizzes = ref([]) // this will sort and show only quizzes relevant for that category
const loading = ref(true) // knows if we are trying to load info from backend
const error = ref('') // gets error message
const { user } = useAuth()
const userAttempts = ref([])
const attemptsUnavailable = ref(false)

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

watch(
  () => user.value?.id,
  async (userId) => {
    attemptsUnavailable.value = false
    if (!userId) {
      userAttempts.value = []
      return
    }

    userAttempts.value = []


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
  {immediate:true}
)

function startQuiz(quiz) {
  if (!quiz || !quiz.id) return

  router.push({ path: '/quiz', query: { id: quiz.id } })
}

// fetch category from backend
async function fetchCategory() {
  loading.value = true
  error.value = '' 
  category.value = null
  quizzes.value = []

  const slug = route.params.slug //get category slug
  try {
    
    const response = await fetch(`/api/categories/${slug}`) // make http-call with slug

    console.log(response)

    if (!response.ok) {
      const data = await response.json()//read response and convert to json
        .catch(() => ({}))// if json cant be read use empty object

      throw new Error(data.error || `Server error (${response.status})`)

    
    }

    const data = await response.json()

    if (route.params.slug !== slug) return // if slug in url doesnt match slug request - return

    category.value = data.category


    const allQuizzes = await fetchQuizzes()// Fetch all quizzes from backend

    quizzes.value = filterQuizzes(allQuizzes, {    // Filter quizzes belonging to current category
      categoryId: category.value.id
    })

  } catch (err) {

    if (route.params.slug !== slug) return// if slug in url doesnt match slug request - return

    error.value = err.message || 'Could not load category.'
  } finally {
    if (route.params.slug === slug) { // this asks "does the url slug match the requested slug from the start of the call?"
    loading.value = false // stop loading and go to page
    }
  }
}

watch(
  () => route.params.slug, //watch this route if anything changes
  () => { //what to put in when it changes
    fetchCategory()
},
{ immediate : true} ) //run change imediatly

const sortedQuizzes = computed(() => {
  const order = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
  }

  return [...quizzes.value].sort((a, b) => {
    return (order[a.difficulty?.toLowerCase()] ?? 99) -
           (order[b.difficulty?.toLowerCase()] ?? 99)
  })
})
</script>

//===== STYLE =====//

<style scoped>
main{
  text-align: center;
}

.quizCard{
  max-width: 960px;
  margin: 0 auto;
  padding: 4rem;
}


.all-quizzes,
.btn-retry {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.5rem 1.15rem;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(10, 40, 50, 0.7) 0%, rgba(10, 40, 50, 0.5) 100%);
  color: var(--color-text-white);
  font-weight: 600;
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.all-quizzes:hover,
.btn-retry:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
}

</style>
