<template>

  <main class="public-home">

    <section class="hero">

      <p class="eyebrow">MASTER WINDOWS SHORTCUTS
      </p>

      <h1>Take control of your keyboard.</h1>

      <p>
        Learn practical Windows shortcuts through focused,
        challenging quizzes.
      </p>

      <div class="buttons">
        <RouterLink to="/login" class="primary-button">
          Get started
        </RouterLink>

        <RouterLink to="/courses" class="secondary-button">
          Explore courses
        </RouterLink>
      </div>

    </section>

    <section class="how-it-works">

      <h3 class="eyebrow">HOW INCTRL WORKS</h3>

      <h2>Learn. Practice. Improve.</h2>

      <p>
        Turn Windows shortcuts into practical skills through
        interactive quizzes and instant feedback.
      </p>

      <div class="features">

        <article>
          <span>01</span>
          <h3>Choose what to learn</h3>
          <p>
            Pick a category and difficulty level.
          </p>
        </article>

        <article>
          <span>02</span>
          <h3>Test your knowledge</h3>
          <p>
            Challenge yourself with shortcut quizzes.
          </p>
        </article>

        <article>
          <span>03</span>
          <h3>Learn from mistakes</h3>
          <p>
            Get instant feedback and see the correct answer.
          </p>
        </article>

      </div>

    </section>

  </main>

</template>


<script setup>

import { RouterLink } from 'vue-router'

</script>


<style scoped>

/* HERO SECTION*/
.hero {
  max-width: 800px;
  margin: auto;
  padding: 6rem 2rem;
  text-align: center;
}

.eyebrow {
  color: #85B4BE;
  font-size: 0.9rem;
  font-weight: bold; /* makes the font bold */
}

h1 {
  font-size: 4rem; /* makes the font 4x bigger than standard h1 */
}

/* HERO SECTION BUTTONS */
.buttons {
  display: flex;
  justify-content: center; /* Help buttons to be in center of the page */
  gap: 1rem; /* Makes space of 1rem between elements */
  margin-top: 2rem; /* Makes space above the element */
}

.buttons a{
  padding: 0.9rem 1.5rem;
  text-decoration: none;
  color: #E8D8CA;
  border: 1px solid #85B4BE;

}
.buttons a:hover{
  background-color: #694627;
}


/* HOW IT WORKS SECTION*/
.how-it-works {
  padding: 5rem 2rem;
}

.how-it-works h2 {
  font-size: 2.5rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 3rem auto;
}

.features article {
  padding: 2rem;
  background-color: #275D69;
  text-align: left; /* text inside boxes to the left */
}

.features span {
  color: #85B4BE;
  font-weight: bold;
}
</style>