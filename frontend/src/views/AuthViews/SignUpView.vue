<template>
  <div class="signup-page">
    <!-- Glassmorphism card holding all content -->
    <div class="glass-card">
      <h1>Sign Up</h1>
      <!-- Paragraph with the "already have an account" text -->
      <p class="member">
        Already a member?
        <!-- Navigates to /login -->
        <RouterLink to="/login">Log in</RouterLink>
      </p>

      <!-- Sign up form -->
      <form @submit.prevent="handleSubmit">
        <input
          type="text"
          placeholder="Username"
          aria-label="Username"
          autocomplete="username"
          required
        />
        <input
          type="text"
          placeholder="First name"
          aria-label="First name"
          autocomplete="given-name"
          required
        />
        <input
          type="text"
          placeholder="Last name"
          aria-label="Last name"
          autocomplete="family-name"
          required
        />
        <input type="email" placeholder="Email" aria-label="Email" autocomplete="email" required />
        <input
          type="password"
          placeholder="Password"
          aria-label="Password"
          autocomplete="new-password"
          required
        />
        <button type="submit" class="btn-primary">Sign Up</button>
      </form>

      <!-- Divider text with a line on each side -->
      <div class="divider"><span>or sign up with</span></div>

      <!-- Social login buttons (no backend) -->
      <div class="social">
        <button type="button" class="btn-social">Google</button>
        <button type="button" class="btn-social">Apple</button>
        <button type="button" class="btn-social">Facebook</button>
      </div>

      <!-- Navigates to home page  -->
      <RouterLink to="/" class="back-link">Back to home</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

// Runs when the form is submitted
function handleSubmit() {
  console.log('Form submitted')
}
</script>

<style scoped>
.signup-page {
  min-height: 85vh;
  display: flex;
  align-items: center; /* Centers the card vertically */
  justify-content: center; /* Centers the card horizontally */
  padding: 2rem;
}

/* Glass-card */
.glass-card {
  width: 100%; /* Takes the full available width on small screens */
  max-width: 380px; /* Never gets wider than 380px on large screens */
  padding: 1rem 2rem;
  text-align: center;

  background: rgba(255, 255, 255, 0.09); /* Makes background more transparent */
  backdrop-filter: blur(16px) saturate(160%); /* Blurs the background */
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25); /* Thin light border */
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

/* Heading spacing */
h1 {
  margin-bottom: 0.5rem;
}

.member a {
  font-size: 18px;
  text-decoration: underline;
}

.member a:hover {
  color: var(--color-button-text);
}

/* Form layout */
form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: var(--font-body);
}

/* Input fields */
input {
  padding: 8px 2px;
  background: transparent;
  border: none; /* Removes the default border on all sides */
  border-bottom: 1px solid rgba(255, 255, 255, 0.6); /* Underline for each field */
  color: white;
  outline: none; /* Removes the browser's default focus outline */
  font-family: var(--font-body);
}

/* Color of the placeholder text */
input::placeholder {
  color: rgba(255, 255, 255, 0.9);
}

/* When a field is selected the underline becomes fully white */
input:focus {
  border-bottom-color: white;
}

/* Sign up button */
.btn-primary {
  margin-top: 0.5rem;
  padding: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Sign up button hover */
.btn-primary:hover {
  background: var(--color-button-hover);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: box-shadow 0.25s ease;
}

/* Divider with "or sign up with" text */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 1.5rem 0 1rem;
  font-size: 0.8rem;
  color: var(--color-text-heading);
}

/* Two lines beside the "or sign up with" text */
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* Social buttons layout*/
.social {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* Social buttons design*/
.btn-social {
  padding: 8px 16px;
  background-color: #1d7874;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.25s ease; /* Smooth hover transition */
}

/* Social buttons hover */
.btn-social:hover {
  background-color: var(--color-button-hover);
  color: var(--color-button-text);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: box-shadow 0.25s ease;
}

/* Back to home link */
.back-link {
  display: block;
  margin-top: 1.5rem;
  color: var(--color-text-main);
}

/* Back to home link hover */
.back-link:hover {
  color: var(--color-button-text);
}
</style>
