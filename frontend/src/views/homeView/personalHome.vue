<template>
  <main class="personal-home">

    <header class="welcome">
      <!--Change later för user name-->
      <h1>Welcome back, Fiona!</h1>
    </header>

    <section class="continue">
      <h2>Continue where you left off</h2>

      <article>
        <h2>Windows</h2>
        <h3>Quiz 4</h3>

        <RouterLink to="/quiz">
          Continue
        </RouterLink>
      </article>
    </section>

  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>


<style scoped>

.continue {
  justify-content: center; /* Help buttons to be in center of the page */
  gap: 1rem; /* Makes space of 1rem between elements */
  margin-top: 2rem; /* Makes space above the element */
}

.continue a{
  padding: 0.9rem 1.5rem;
  text-decoration: none;
  color: #E8D8CA;
  border: 1px solid #85B4BE;

}
.continue a:hover{
  background-color: #694627;
}



.continue article {
  width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #275D69;
  text-align: center;
}

</style>