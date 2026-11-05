<template>
  <main class="personal-home">
    <div class="content-container">
      <header class="welcome">
        <h1 v-if="isFirstLogin">Welcome, {{ username }}!</h1>
        <h1 v-else>Welcome back, {{ username }}!</h1>
      </header>

      <section class="continue">
        <div class="white-card">
          <div class="card-left">
            <span class="eyebrow">{{ isFirstLogin ? 'GET STARTED' : 'CONTINUE LEARNING' }}</span>
            <h2>{{ isFirstLogin ? 'Get started' : 'Continue where you left off' }}</h2>
            <p class="description">
              {{
                isFirstLogin
                  ? 'Jump into your first quiz and start mastering keyboard shortcuts.'
                  : 'Pick up right where you left off and sharpen your skills.'
              }}
            </p>
          </div>
          <div class="card-right">
            <RouterLink to="/quiz" class="btn-action">
              {{ isFirstLogin ? 'Start Learning' : 'Keep Improving' }}
            </RouterLink>
          </div>
        </div>
      </section>

      <!--At a later stage: The history section should have a small widget of History.vue component-->
      <section class="history-section">
        <RouterLink to="/history" class="btn-history"> My history → </RouterLink>
      </section>
    </div>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { username, isFirstLogin } = useAuth()
</script>

<style scoped>
.personal-home {
  width: 100%;
  background-color: #fffcf9;
  padding: 60px 0 80px 0;
  box-sizing: border-box;
}

.content-container {
  max-width: 1100px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.welcome {
  margin-bottom: 40px;
}

.white-card .eyebrow {
  color: var(--color-dark-accenturate);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.15em;
  display: block;
  margin-bottom: 8px;
}

.welcome h1 {
  font-size: 40px;
  font-family: var(--font-heading), serif;
  color: var(--color-text-black);
  text-transform: none;
  letter-spacing: 1px;
  margin: 0;
}

.continue {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 30px;
}

/* White-card */
.white-card {
  background-color: var(--color-text-white);
  border-radius: 16px;
  padding: 40px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  box-sizing: border-box;

  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  transition: all 0.3s ease;
}

.card-left {
  flex: 2;
}

.card-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.white-card h2 {
  color: var(--color-dark-teal);
  text-transform: none;
  letter-spacing: 1px;
  font-size: 32px;
  font-weight: 500;
  margin: 0 0 12px 0;
}

.white-card .description {
  color: var(--color-text-black);
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.btn-action {
  display: inline-block;
  padding: 0.85rem 2rem;
  background-color: var(--color-dark-teal);
  color: var(--color-text-white);
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(10, 40, 50, 0.2);
  white-space: nowrap;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(10, 40, 50, 0.3);
}

.history-section {
  margin-top: 10px;
}

.btn-history {
  display: inline-block;
  padding: 0.6rem 1.5rem;
  color: var(--color-dark-teal);
  background: transparent;
  border: 1px solid var(--color-dark-teal);
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-history:hover {
  background: var(--color-dark-teal);
  color: var(--color-text-white);
}

@media (max-width: 768px) {
  .welcome h1 {
    font-size: 30px;
  }

  .white-card {
    flex-direction: column;
    padding: 24px;
    text-align: center;
    gap: 24px;
  }

  .card-right {
    justify-content: center;
    width: 100%;
  }

  .btn-action {
    width: 100%;
    text-align: center;
    box-sizing: border-box;
  }
}
</style>
