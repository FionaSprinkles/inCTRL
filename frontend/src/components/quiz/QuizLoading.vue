<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: 'Fetching quiz questions from backend...',
  },
})
</script>

<template>
  <section class="quiz-loading-container" role="status" aria-live="polite">
    <div class="quiz-loading-card">
      <div class="spinner-area">
        <LoadingSpinner size="lg" />
      </div>

      <div class="loading-info">
        <h3 v-if="title" class="quiz-loading-title">{{ title }}</h3>
        <p class="quiz-loading-message">{{ message }}</p>
      </div>

      <!-- Animated skeleton preview to avoid empty screen feeling -->
      <div class="skeleton-preview" aria-hidden="true">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-body"></div>
        <div class="skeleton-line skeleton-body short"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.quiz-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem 1rem;
  width: 100%;
}

.quiz-loading-card {
  width: 100%;
  max-width: 580px;
  padding: 2.5rem 2rem;
  text-align: center;
  border-radius: 20px;
  background: rgba(18, 86, 98, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.spinner-area {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.loading-info {
  margin-bottom: 1.5rem;
}

.quiz-loading-title {
  font-family: var(--font-display), serif;
  font-size: 1.25rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-text-white);
  margin: 0 0 0.5rem;
}

.quiz-loading-message {
  font-family: var(--font-body), sans-serif;
  font-size: 1rem;
  color: var(--color-light-accenturate);
  margin: 0;
}

.skeleton-preview {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 1.25rem;
  padding: 1.25rem;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.15);
}

.skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.8s ease-in-out infinite;
}

.skeleton-title {
  width: 65%;
  height: 18px;
  margin-bottom: 0.25rem;
}

.skeleton-body {
  width: 90%;
}

.skeleton-body.short {
  width: 70%;
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
