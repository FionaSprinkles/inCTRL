/**
This is a template for all different quiz-category startpages. 
Shows name, description and fetches relevant quizzes  of that category.

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
  <main v-if="category">
    <h1>{{ category.name }}</h1>
    <p>{{ category.description }}</p>

    <section>
      <h2>Available quizzes in this category</h2>

      <ListQuizzesCard class="quizCard"
        :filteredQuizzes="quizzes"
        @start-quiz="startQuiz"
      />

      <button>
        <RouterLink to="/categories">Go to all quizzes!</RouterLink></button>
    </section>

  </main>

  <p v-else-if="loading">Loading category...</p>

  <p v-else-if="error">{{ error }}</p>
</template>



<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchQuizzes, filterQuizzes } from '@/services/quizService'
import ListQuizzesCard from '@/components/ListQuizzesCard.vue'

const route = useRoute()
const router = useRouter()

const category = ref(null) // gets information of what the category contains, like id, name, slug and description
const quizzes = ref([]) // this will sort and show only quizzes relevant for that category
const loading = ref(true) // knows if we are trying to load info from backend
const error = ref('') // gets error message



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


/*The code for the button is from the "all categories page. Should this be i global.css instead?*/ 
button {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  padding: 1rem;
}

button {
  background: #1d4ed8;
}
</style>