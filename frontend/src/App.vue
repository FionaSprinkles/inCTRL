<template>
  <div class="app-layout">
    <NavBar v-if="route.name !== 'signup'" />
    <RouterView class="page" />
    <Footer v-if="route.name !== 'signup'" />
  </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

const route = useRoute()
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page {
  flex: 1;
}
</style>
