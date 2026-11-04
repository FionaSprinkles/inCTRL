<template>
  <main class="personal-home">
    <header class="welcome">
      <h1 v-if="isFirstLogin">Welcome, {{ username }}!</h1>
      <h1 v-else>Welcome back, {{ username }}!</h1>
    </header>

    <section class="continue">
      <article>
        <h2>{{ isFirstLogin ? 'Get started' : 'Continue where you left off' }}</h2>

        <RouterLink to="/quiz">
          {{ isFirstLogin ? 'Start Learning' : 'Keep Improving' }}
        </RouterLink>
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
  background: linear-gradient(180deg, rgba(10, 40, 50, 0.7) 0%, rgba(10, 40, 50, 0.5) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  border-radius: 16px;
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.continue h2 {
  margin: 0;
  color: var(--color-text-white);
}

.continue a {
  display: inline-block;
  padding: 0.75rem 1.75rem;
  background: linear-gradient(180deg, rgba(10, 40, 50, 0.7) 0%, rgba(10, 40, 50, 0.5) 100%);
  color: var(--color-text-white);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  border-radius: 10px;
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.continue a:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
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
