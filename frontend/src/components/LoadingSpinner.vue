<script setup>
defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  text: {
    type: String,
    default: '',
  },
  ariaLabel: {
    type: String,
    default: 'Loading',
  },
})
</script>

<template>
  <div class="loading-spinner-wrapper" role="status" :aria-label="text || ariaLabel">
    <div class="spinner-circle" :class="`spinner-${size}`" aria-hidden="true"></div>
    <span v-if="text" class="spinner-label">{{ text }}</span>
  </div>
</template>

<style scoped>
.loading-spinner-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.spinner-circle {
  border-radius: 50%;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.15);
  border-top-color: var(--color-light-accenturate, #85b4be);
  animation: spin 0.85s linear infinite;
}

.spinner-sm {
  width: 22px;
  height: 22px;
  border-width: 2.5px;
}

.spinner-md {
  width: 38px;
  height: 38px;
  border-width: 3.5px;
}

.spinner-lg {
  width: 54px;
  height: 54px;
  border-width: 4px;
}

.spinner-label {
  font-family: var(--font-body), sans-serif;
  font-size: 0.95rem;
  color: var(--color-text-main, #e6d5b8);
  letter-spacing: 0.5px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
