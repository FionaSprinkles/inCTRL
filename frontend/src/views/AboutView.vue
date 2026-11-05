<script setup></script>
<template>
  <main>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="content-container">
        <p class="eyebrow">ABOUT US</p>
        <h1>Small shortcuts. Big time savings.</h1>
        <p class="description">
          InCtrl helps you learn Windows keyboard shortcuts by practicing them, not by memorizing a
          list.
        </p>
      </div>
    </section>

    <!-- Story Section -->
    <section class="story-section">
      <div class="content-container story-inner">
        <!-- Left column with title and highlights -->
        <div class="left-column">
          <span class="eyebrow">OUR STORY</span>
          <h2 class="title">Why we built InCtrl</h2>
          <p class="highlight-text">The fastest way to learn a shortcut is to use it.</p>
        </div>

        <!-- Right side -->
        <div class="right-column">
          <p>
            Most of us spend hours at a computer every day and still reach for the mouse for things
            the keyboard can do in a split second. Shortcut lists exist, but nobody really learns
            from a list.
          </p>
          <p>
            So we built a quiz. InCtrl turns shortcuts into short rounds across Windows, Microsoft
            Office, productivity, the internet and programming. You get instant feedback, try again,
            and slowly your hands start to remember.
          </p>
        </div>
      </div>
    </section>

    <!-- Features / Interactive Preview Section: Showing a taste of what the user will learn -->
    <section class="features-section">
      <div class="white-card">
        <div class="card-left">
          <span class="eyebrow">A TASTE OF WHAT YOU LEARN</span>
          <h2>Three seconds saved, a thousand times.</h2>
          <p>
            A shortcut only saves a moment. But you use the same ones over and over, and those
            moments add up to minutes every day.
          </p>
        </div>
        <div class="card-right">
          <!-- Shortcut Row 1: Copy -->
          <div class="shortcut-row">
            <div class="keys">
              <kbd>Ctrl</kbd>
              <span class="plus">+</span>
              <kbd>C</kbd>
            </div>
            <span class="shortcut-description">Copy</span>
          </div>

          <!-- Shortcut Row 2: Show desktop -->
          <div class="shortcut-row">
            <div class="keys">
              <kbd>Win</kbd>
              <span class="plus">+</span>
              <kbd>D</kbd>
            </div>
            <span class="shortcut-description">Show the desktop</span>
          </div>

          <!-- Shortcut Row 3: Switch windows -->
          <div class="shortcut-row">
            <div class="keys">
              <kbd>Alt</kbd>
              <span class="plus">+</span>
              <kbd>Tab</kbd>
            </div>
            <span class="shortcut-description">Switch windows</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="team-section">
      <div class="content-container">
        <h2>Meet The Team</h2>

        <div class="team-grid">
          <div class="team-member">
            <div class="avatar-initials">ON</div>
            <p>Oscar Nidemar</p>
          </div>

          <div class="team-member">
            <div class="avatar-initials">FF</div>
            <p>Fiona Friberg</p>
          </div>

          <div class="team-member">
            <div class="avatar-initials">EFS</div>
            <p>Erika Falk Svendsen</p>
          </div>

          <div class="team-member">
            <div class="avatar-initials">FM</div>
            <p>Firas Mossa</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.content-container {
  max-width: 1100px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0 2rem;
}

/* HERO SECTION*/
.hero-section {
  padding: 60px 0;
  width: 100%;
}

.hero-section .eyebrow {
  color: var(--color-light-accenturate);
  font-weight: 600;
  font-size: 12px;
}

.hero-section h1 {
  font-size: 50px;
}

.hero-section .description {
  color: var(--color-text-main);
  letter-spacing: 3px;
  font-size: 1.1rem;
}

/* STORY SECTION */
.story-section {
  background-color: #fffcf9;
  padding: 60px 0;
  width: 100%;
  box-sizing: border-box;
}

.story-inner {
  display: flex;
}

.story-section .eyebrow {
  color: var(--color-dark-accenturate);
  font-weight: 600;
  font-size: 12px;
}

/* Left-column layout */
.story-section .left-column {
  flex: 2;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Right-column layout */
.story-section .right-column {
  flex: 1.5;
  padding-right: 0;
}

/* Left-column title */
.title {
  font-size: 40px;
  font-weight: 600;
  color: var(--color-text-black);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-dark-teal);
  margin-bottom: -10px;
  display: inline-block;
  text-transform: none;
  letter-spacing: 1px;
}

/* Left-column highlight text */
.left-column .highlight-text {
  font-family: var(--font-display), sans-serif;
  color: var(--color-dark-teal);
  font-size: 25px;
  font-weight: 500;
}

/* Right-column text */
.right-column p {
  color: var(--color-text-black);
}

/* FEATURES SECTION*/
.features-section {
  background-color: #fffcf9;
  padding: 20px 2rem 60px 2rem;
  width: 100%;
  box-sizing: border-box;
}

/* Card layout */
.white-card {
  background-color: var(--color-text-white);
  border-radius: 16px;
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 40px;
  box-sizing: border-box;

  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  transition: all 0.3s ease;
}

.card-left {
  flex: 2;
}

.card-right {
  padding-top: 20px;
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.features-section .eyebrow {
  color: var(--color-dark-accenturate);
  font-weight: 600;
  font-size: 12px;
}

.card-left h2 {
  color: var(--color-dark-teal);
  text-transform: none;
  letter-spacing: 1px;
  font-size: 40px;
  font-weight: 500;
}

.card-left p {
  color: var(--color-text-black);
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--color-text-white);
  border-bottom: 1px solid #f0f0f0;
}

.keys {
  display: flex;
  align-items: center;
  gap: 8px;
}

kbd {
  background-color: #ffffff;
  border: 1px solid #dcdcdc;
  border-bottom-width: 2px;
  border-radius: 6px;
  padding: 6px 10px;
  font-family: var(--font-body), sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-width: 28px;
  text-align: center;
}

.shortcut-description {
  color: var(--color-text-black);
  font-size: 0.95rem;
}

.plus {
  color: #888;
  font-size: 0.9rem;
}

/* TEAM SECTION*/
.team-section {
  background-color: #fcfbfa;
  padding: 40px 0 80px 0;
  width: 100%;
  box-sizing: border-box;
}

.team-section h2 {
  font-size: 30px;
  font-family: var(--font-display), sans-serif;
  color: var(--color-dark-accenturate);
  margin-bottom: 50px;
}

.team-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.team-member {
  flex: 1 1 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-initials {
  width: 80px;
  height: 80px;
  background-color: var(--color-dark-teal);
  color: var(--color-text-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  margin-top: 16px;
}

.team-member p {
  font-size: 20px;
  color: var(--color-dark-teal);
}

@media (max-width: 850px) {
  .hero-section {
    padding: 40px 0;
  }

  .hero-section h1 {
    font-size: 36px;
  }

  .story-inner {
    flex-direction: column;
    gap: 20px;
  }

  .story-section {
    padding: 40px 0;
  }

  .white-card {
    flex-direction: column;
    padding: 24px;
    gap: 24px;
  }

  .title,
  .card-left h2 {
    font-size: 30px;
  }

  .shortcut-row {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
