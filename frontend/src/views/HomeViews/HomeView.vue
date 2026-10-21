/** This file can be removed if we start using authentication/navigation guards. Then the router
could do this navigation instead. **/

<template>
  <!-- ===== LOGGED OUT ===== -->

  <!-- This is the homepage if a user is not logged in -->
  <PublicHomeView v-if="!isLoggedIn" />

  <!-- ===== LOGGED IN ===== -->

  <!-- This is the homepage if a user is logged in -->
  <PersonalHomeView v-else />
</template>

<script setup>
import PublicHomeView from './PublicHomeView.vue'
import PersonalHomeView from './PersonalHomeView.vue'
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn } = useAuth()
</script>