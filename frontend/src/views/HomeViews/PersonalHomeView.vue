<template>
  <main class="personal-home">
    <header class="welcome">
      <h1>Welcome back, {{ username }}!</h1>
    </header>

    <section class="continue">
      <article>
        <h2>Continue where you left off</h2>

        <RouterLink to="/quiz"> Keep Improving </RouterLink>
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

const { username } = useAuth()
</script>

<style scoped>
.personal-home {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
  text-align: center;
}

.welcome {
  grid-column: 1 / -1;
}

.continue {
  display: flex;
  justify-content: flex-start;
  margin-top: 2rem;
}

.continue article {
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
  padding: 2.5rem 2rem;
  background-color: var(--color-dark-accenturate);
  border: 1px solid var(--color-text-muted);
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.continue h2 {
  margin: 0;
}

.continue a {
  display: inline-block;
  padding: 0.75rem 1.75rem;
  background-color: var(--color-button);
  color: var(--color-button-text);
  border: 1px solid var(--color-button-border);
  border-radius: 10px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.continue a:hover {
  background-color: var(--color-button-hover);
}

.history {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .personal-home {
    grid-template-columns: 1fr;
  }

  .continue {
    justify-content: center;
  }
}
</style>
