<template>
  <main class="personal-home">
    <header class="welcome">
      <h1>Welcome back, {{ firstName }}!</h1>
    </header>

    <section class="continue">
      <h2>Continue where you left off</h2>

      <article>
        <h2>Windows</h2>
        <h3>Quiz 4</h3>

        <RouterLink to="/quiz"> Continue </RouterLink>
      </article>
    </section>

    <!--At a later stage: The history section should have a small widget of History.vue component-->
    <section class="history">
      <RouterLink to="/history"> History </RouterLink>
    </section>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { firstName } = useAuth()
</script>

<style scoped>
.personal-home {
  text-align: center;
}
.continue {
  justify-content: center; /* Help buttons to be in center of the page */
  gap: 1rem; /* Makes space of 1rem between elements */
  margin-top: 2rem; /* Makes space above the element */
}

.continue a {
  padding: 0.9rem 1.5rem;
  text-decoration: none;
  color: #e8d8ca;
  border: 1px solid #85b4be;
}
.continue a:hover {
  background-color: #694627;
}

.continue article {
  width: 100%;
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #275d69;
  text-align: center;
}
</style>