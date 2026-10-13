import './assets/global.css'

<template>
  <main class="public-home">
    <section class="hero">
      <p class="eyebrow">MASTER WINDOWS SHORTCUTS</p>

      <h1>Take control of your keyboard.</h1>

      <p>Learn practical Windows shortcuts through focused, challenging quizzes.</p>

      <div class="buttons">
        <RouterLink to="/login" class="btn-hero"> Get started </RouterLink>

        <RouterLink to="/courses" class="btn-hero"> Explore courses </RouterLink>
      </div>
    </section>

    <section class="how-it-works">
      <p class="eyebrow">HOW INCTRL WORKS</p>

      <h2>Learn. Practice. Improve.</h2>

      <p class="section-lead">
        Turn Windows shortcuts into practical skills through interactive quizzes and instant
        feedback.
      </p>

      <div class="features">
        <article>
          <span>01</span>
          <h3>Choose what to learn</h3>
          <p>Pick a category and difficulty level.</p>
        </article>

        <article>
          <span>02</span>
          <h3>Test your knowledge</h3>
          <p>Challenge yourself with shortcut quizzes.</p>
        </article>

        <article>
          <span>03</span>
          <h3>Learn from mistakes</h3>
          <p>Get instant feedback and see the correct answer.</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
0550</script>

<style scoped>
/* HERO SECTION*/
.hero {
  max-width: 800px;
  margin: auto;
  padding: 6rem 2rem;
  text-align: center;
}

.eyebrow {
  color: #85b4be;
  font-size: 0.9rem;
  font-weight: bold; /* makes the font bold */
  margin-top: -10px;
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

.buttons a {
  padding: 0.7rem 1.2rem;
  text-decoration: none;
  background-color: var(--color-button);
  color: var(--color-button-text);
  border: 1px solid #85b4be;
  transition: all 0.25s ease;
  font-size: 16px;
}

.buttons a:hover {
  background-color: var(--color-button-hover);
  color: var(--color-button-text);
  border-color: #fdfbf7;
  box-shadow: 0 0 30px rgba(45, 212, 191, 0.3);
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
  background-color: rgba(4, 47, 46, 0.4);
  border-color: #2dd4bf;
  text-align: center;
  transition: box-shadow 0.3s ease;
}

.features span {
  color: var(--color-text-muted);
  font-weight: bold;
}

.features article:hover {
  box-shadow: 0 0 50px 10px rgba(230, 213, 184, 0.7);
}

.features article p {
  font-style: italic;
}

.section-lead {
  font-style: italic;
}
</style>