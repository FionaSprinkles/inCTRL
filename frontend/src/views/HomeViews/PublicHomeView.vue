import './assets/global.css'

<template>
  <main class="public-home">
    <section class="hero">
      <p class="eyebrow">MASTER WINDOWS SHORTCUTS</p>

      <h1>Take control of your keyboard</h1>

      <p class="hero-text">
        Learn practical Windows shortcuts through focused, challenging quizzes.
      </p>

      <div class="buttons">
        <RouterLink to="/signup" class="btn-hero"> Get started </RouterLink>

        <RouterLink to="/categories" class="btn-hero"> Explore categories </RouterLink>
      </div>
    </section>

    <section class="member">
      <div class="left-side">
        <h1>Join the community!</h1>
        <p>
          Save your quiz results, track your progress, and climb the leaderboards as you earn
          points.
        </p>
        <p class="ps">
          Psst! You'll need an account to save your progress and join the competition.
        </p>
      </div>
      <div class="right-side">
        <PodiumLeaderboard podium-only />
      </div>
    </section>

    <section class="how-it-works">
      <p class="how">HOW INCTRL WORKS</p>

      <h2>Learn. Practice. Improve.</h2>

      <p class="section-lead">
        Turn Windows shortcuts into practical skills through interactive quizzes and instant
        feedback.
      </p>

      <div class="features">
        <article>
          <span>01</span>
          <h3>Create an account</h3>
          <p>Sign up to start your journey and keep track of your learning progress.</p>
        </article>

        <article>
          <span>02</span>
          <h3>Choose what to learn & Test your knowledge</h3>
          <p>Pick a category and difficulty level. Challenge yourself with shortcut quizzes.</p>
        </article>

        <article>
          <span>03</span>
          <h3>Climb to the top!</h3>
          <p>Keep improving your skills, earn points, and climb the leaderboard!</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import PodiumLeaderboard from '@/components/PodiumLeaderboard.vue'
</script>

<style scoped>
/* HERO SECTION*/
.hero {
  max-width: 800px;
  margin: auto;
  padding: 6rem 2rem;
  text-align: center;
}

.hero-text {
  letter-spacing: 3px;
  font-size: 1.1rem;
}

h1 {
  font-size: 4rem; /* makes the font 4x bigger than standard h1 */
}

.eyebrow {
  color: var(--color-light-accenturate);
  font-size: 0.9rem;
  font-weight: bold; /* makes the font bold */
  letter-spacing: 0.15em;
  margin-top: -10px;
  padding-bottom: 10px;
}

.how {
  color: var(--color-light-accenturate);
  font-size: 0.9rem;
  font-weight: bold; /* makes the font bold */
  letter-spacing: 0.15em;
  margin-top: -10px;
}

.how-it-works h2 {
  color: var(--color-text-white);
}

/* HERO SECTION BUTTONS */
.buttons {
  display: flex;
  justify-content: center; /* Help buttons to be in center of the page */
  gap: 1.5rem; /* Makes space between elements */
  margin-top: 2rem; /* Makes space above the element */
}

.buttons a {
  position: relative;
  padding: 0.9rem 2.2rem;
  text-decoration: none;
  color: var(--color-text-white);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 12px;

  /* MÖRKT GLAS MED SILVERKANT */
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);

  transition: all 0.3s ease;
}

/* Silverglöd längs nedre kanten */
.buttons a::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 18%;
  width: 64%;
  height: 2px;
  border-radius: 50%;
  background: rgba(245, 247, 250, 0.95);
  box-shadow:
    0 0 10px 3px rgba(197, 204, 214, 0.6),
    0 0 22px 6px rgba(197, 204, 214, 0.3);
  pointer-events: none;
  transition: all 0.3s ease;
}

.buttons a:hover {
  color: #ffffff;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.08) 100%);
  border-color: rgba(230, 234, 240, 0.85);
  transform: translateY(-3px);
  box-shadow:
    8px 16px 32px rgba(0, 0, 0, 0.55),
    0 0 30px rgba(197, 204, 214, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.buttons a:hover::after {
  left: 10%;
  width: 80%;
  box-shadow:
    0 0 14px 4px rgba(230, 234, 240, 0.8),
    0 0 30px 8px rgba(197, 204, 214, 0.4);
}

/* MEMBER SECTION */
.member {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 3rem;
  max-width: 950px;
  margin: 0 auto;
  padding: 5rem 2rem;
}

.member .left-side {
  margin: 0;
}

.member .right-side {
  display: flex;
  justify-content: center;
}

.member h1 {
  font-size: 40px;
}

.member p {
  font-size: 20px;
}

.member .ps {
  font-size: 14px;
  font-style: italic;
  color: var(--color-light-accenturate);
}

/* HOW IT WORKS SECTION */
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

.features h3 {
  color: var(--color-text-white);
}

.features article {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  border-radius: 20px;
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);

  transition: all 0.3s ease;
}

.features span {
  color: var(--color-light-accenturate);
  font-weight: bold;
}

.features article:hover {
  box-shadow: 0 0 40px 6px rgba(197, 204, 214, 0.35);
}

.features article p {
  font-style: italic;
}

.section-lead {
  font-style: italic;
}
</style>