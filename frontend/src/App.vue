<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <RouterLink to="/" class="brand">in<strong>CTRL</strong></RouterLink>
      <nav>
        <RouterLink to="/">Categories</RouterLink>
        <RouterLink to="/quiz">Quiz</RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  margin-bottom: 1rem;
}
.brand {
  font-size: 1.25rem;
  text-decoration: none;
  color: #2563eb;
}
nav {
  display: flex;
  gap: 1rem;
}
nav a {
  text-decoration: none;
  color: inherit;
  font-weight: 500;
}
nav a.router-link-active {
  color: #2563eb;
  font-weight: 700;
}
</style>
