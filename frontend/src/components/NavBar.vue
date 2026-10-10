<!-- The navbar is always visible from any page. It changes depending on if a user is logged in or not. -->

<template>

  <nav class="navbar">

    <!-- Left side of the nav-bar -->

    <div class="nav-left">

      <RouterLink to="/" class="logo">
        inCTRL
      </RouterLink>

      <div class="nav-links">

        <!-- Browse -->
        <!-- The browse drop down can probably be moved to a seperate component at a later stage-->

        <div class="browse">

          <!-- On click will change const isBrowseOpen -->

          <button
            class="nav-link"
            @click="isBrowseOpen = !isBrowseOpen"
          >
            Browse
            <span>⌄</span>
          </button>


          <!-- Browse drop-down -->

          <div v-if="isBrowseOpen" class="browse-menu" >

            <div class="category-section">

              <h2>Courses by category</h2>

              <RouterLink to="/courses/windows" class="nav-link" @click="isBrowseOpen = false">
                Windows
              </RouterLink>

              <RouterLink to="/courses/office" class="nav-link" @click="isBrowseOpen = false">
                Microsoft Office
              </RouterLink>

              <RouterLink to="/courses/productivity" class="nav-link" @click="isBrowseOpen = false">
                Productivity
              </RouterLink>

              <RouterLink to="/courses/internet" class="nav-link" @click="isBrowseOpen = false">
                Internet
              </RouterLink>

              <RouterLink to="/courses/programming" class="nav-link" @click="isBrowseOpen = false">
                Programming
              </RouterLink>

            </div>

          </div>

        </div>

        <!-- Logged out -->

        <template v-if="!isLoggedIn">

          <RouterLink to="/courses" class="nav-link">
            Courses
          </RouterLink>

          <RouterLink to="/about" class="nav-link">
            About
          </RouterLink>

        </template>


        <!-- Logged in -->

        <template v-else>

          <RouterLink to="/" class="nav-link">
            Home
          </RouterLink>

          <RouterLink to="/courses" class="nav-link">
            Courses
          </RouterLink>

          <RouterLink to="/quiz" class="nav-link">
            Quiz
          </RouterLink>

        </template>

      </div>

    </div>


    <!-- Right side of the nav-bar -->

    <!-- Logged out -->

    <template v-if="!isLoggedIn">

      <div class="nav-right">

        <RouterLink to="/login" class="nav-link">
          Log in
        </RouterLink>

      </div>

    </template>

    <!-- Logged in -->

    <template v-else>

      <div class="nav-right">

        <!-- Change this later -->

        <div class="user">
          Fiona
        </div>

        <RouterLink to="/log-out" class="nav-link">
          Log out
        </RouterLink>

      </div>

    </template>

  </nav>

</template>


<!-- ===== SCRIPTS ======-->

<script setup>

import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const isBrowseOpen = ref(false)

// This is just for testing. Will change laterrr
const isLoggedIn = false


// This function makes the browse drop down disappear when clicking elsewhere
function closeBrowse(event) {
  if (!event.target.closest('.browse')) {
    isBrowseOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', closeBrowse)
})
onUnmounted(() => {
  document.removeEventListener('click', closeBrowse)
})
</script>

<!-- ===== STYLE ===== -->

<style scoped>
.navbar {
    display: flex;
    align-items: center;

    padding: 1rem 2rem;

    background-color: #275D69;
}

/* Left and Right side of the navbar */
.nav-left {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;

    margin-left: auto;
}

/* Logo */
.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #E8D8CA;
}

/* Links in nav-bar */

.nav-links {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-link {
    color: #E8D8CA;
    background-color: transparent;
    border: none;
    padding: 0.8rem 1rem;
    font-size: 16px;
    font-family: inherit;
    text-decoration: none;
    cursor: pointer;
}

.nav-link:hover {
    background-color: #694627;
    text-decoration: none;
}

/* Browse */
.browse {
    position: relative;
}

/* Browse dropdown */
.browse-menu {
  background-color: #694627;
  position: absolute;
  top: 100%;    
  left: 0;
  z-index: 10;
  width: 280px;
  padding: 1.5rem;
}

.category-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>