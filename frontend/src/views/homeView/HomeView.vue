/** This file can be removed if we start using authentication/navigation guards. 
Then the router could do this navigation instead. **/

<template>
  <main>

    <!-- ===== LOGGED OUT ===== -->

    <!-- This is the homepage if a user is not logged in -->
    <PublicHome v-if="!isLoggedIn" />

    <!-- ===== LOGGED IN ===== -->

    <!-- This is the homepage if a user is logged in -->
    <PersonalHome v-else />

  </main>
</template>

<script setup>
import PublicHome from '../homeView/publicHome.vue'
import PersonalHome from '../homeView/personalHome.vue'

//This is for testing. Will change later
const isLoggedIn = false
</script>