/**
This is a template for all different quiz-category startpages. 
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
  </main>

  <p v-else-if="loading">Loading category...</p>

  <p v-else-if="error">{{ error }}</p>
</template>



<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const category = ref(null) // gets information of what the category contains, like id, name, slug and description
const loading = ref(true) // knows if we are trying to load info from backend
const error = ref('') // gets error message


// fetch category from backend
async function fetchCategory() {
  loading.value = true
  error.value = '' 
  category.value = null

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