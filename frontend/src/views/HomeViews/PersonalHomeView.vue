<template>
  <main class="personal-home">
    <header class="welcome">
      <h1 v-if="isFirstLogin">Welcome, {{ username }}!</h1>
      <h1 v-else>Welcome back, {{ username }}!</h1>
    </header>

    <!-- Continue where you left off-->
    <section class="widget">
      <article>
        <h2>{{ isFirstLogin ? 'Get started' : 'Continue where you left off' }}</h2>

        <RouterLink to="/quiz">
          {{ isFirstLogin ? 'Start Learning' : 'Keep Improving' }}
        </RouterLink>
      </article>
    </section>

    <!--History widget-->
    <section class="widget">
      <article>
        <!-- Get the compact variant of History.vue-->
        <History compact />
      </article>
    </section>

    <!-- Leaderboard-widget? With your place on the leaderboard and top 3-->

  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import History from '@/components/History.vue';

const { username, isFirstLogin } = useAuth()
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

.widget {
  display: flex;
  justify-content: flex-start;
  margin-top: 2rem;
}

.widget article {
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

.widget h2 {
  margin: 0;
}

.widget a {
  display: inline-block;
  padding: 0.75rem 1.75rem;
  background-color: var(--color-button);
  color: var(--color-button-text);
  border: 1px solid var(--color-button-border);
  border-radius: 10px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.widget a:hover {
  background-color: var(--color-button-hover);
}

@media (max-width: 768px) {
  .personal-home {
    grid-template-columns: 1fr;
  }

  .widget {
    justify-content: center;
  }
}
</style>
