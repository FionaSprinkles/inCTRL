<script setup></script>
<template>
  <main>
    <!-- Hero Section: Introduction at the top of the page -->
    <section class="hero-section">
      <p class="about">ABOUT US</p>
      <h1>Small shortcuts. Big time savings.</h1>
      <p class="description">
        InCtrl helps you learn Windows keyboard shortcuts by practicing them, not by memorizing a
        list.
      </p>
    </section>

    <!-- Story Section: Explaining the background and why the product was built -->
    <section class="story-section">
      <!-- Left column with title and highlights -->
      <div class="left-column">
        <span class="story">OUR STORY</span>
        <h2 class="title">Why we built InCtrl</h2>
        <p class="highlight-text">The fastest way to learn a shortcut is to use it.</p>
      </div>

      <!-- Right side -->
      <div class="right-column">
        <p>
          Most of us spend hours at a computer every day and still reach for the mouse for things
          the keyboard can do in a split second. Shortcut lists exist, but nobody really learns from
          a list.
        </p>
        <p>
          So we built a quiz. InCtrl turns shortcuts into short rounds across Windows, Microsoft
          Office, productivity, the internet and programming. You get instant feedback, try again,
          and slowly your hands start to remember.
        </p>
      </div>
    </section>

    <!-- Features / Interactive Preview Section: Showing a taste of what the user will learn -->
    <section class="features-section">
      <div class="white-card">
        <div class="card-left">
          <span class="taste">A TASTE OF WHAT YOU LEARN</span>
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
    </section>
  </main>
</template>

<style>
/* Hero section styling */
.hero-section {
  padding: 60px 20px 60px 80px;
}

.hero-section h1 {
  font-size: 50px;
}

.hero-section .description {
  color: var(--color-text-white);
}

/* Story section layout and columns */
.story-section {
  background-color: #fffcf9;
  padding: 60px 20px;
  display: flex;
  margin: 0 auto;
}

.story-section .left-column {
  flex: 2;
  padding-left: 70px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.story-section .right-column {
  flex: 1.5;
  padding-right: 70px;
}

.right-column p {
  color: var(--color-text-black);
}

/* Features section and white card layout */
.features-section {
  background-color: #fffcf9;
  padding: 20px 20px 60px 20px;
}

.white-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 40px;
}

/* Typography and common text elements */
.about {
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 12px;
}

.story {
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 12px;
}

.taste {
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 12px;
}

.title {
  font-size: 40px;
  font-family: Georgia, serif;
  color: var(--color-dark-teal);
  padding-bottom: 12px;
  border-bottom: 2px solid #5d827c;
  margin-bottom: -10px;
  display: inline-block;
}

.left-column h2 {
  color: var(--color-text-black);
  text-transform: none;
  letter-spacing: 1px;
  font-size: 40px;
}

.left-column .highlight-text {
  font-family: var(--font-display), sans-serif;
  color: var(--color-dark-teal);
  font-size: 25px;
  font-weight: 500;
}

/* Card left and right content styling */
.card-left {
  flex: 2;
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

.card-right {
  padding-top: 20px;
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Shortcut rows and keyboard keys styling */
.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

.keys {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plus {
  color: #888;
  font-size: 0.9rem;
}

kbd {
  background-color: #ffffff;
  border: 1px solid #dcdcdc;
  border-bottom-width: 2px;
  border-radius: 6px;
  padding: 6px 10px;
  font-family: inherit;
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

/* Team section styling */
.team-section {
  background-color: #fcfbfa;
  padding: 40px 20px 80px 20px;
  text-align: center;
  width: 100%;
}

/* Styles the heading inside the team section */
.team-section h2 {
  font-size: 30px;
  font-family: var(--font-display), sans-serif;
  color: var(--color-dark-teal);
  margin-bottom: 50px;
}

/* Creates a flex container to align team members horizontally */
.team-grid {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

/* Defines layout and alignment for individual team members */
.team-member {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Styles the circular avatar containing the team member's initials */
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

/* Styles the text descriptions or names under the team members */
.team-member p {
  font-size: 20px;
  color: var(--color-dark-teal);
}
</style>
