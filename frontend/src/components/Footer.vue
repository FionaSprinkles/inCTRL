<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="footer-brand">
        <RouterLink to="/" class="footer-logo">InCtrl</RouterLink>
        <p>Take control of your keyboard.</p>
      </div>

      <div class="footer-col">
        <h3>Courses</h3>
        <RouterLink to="/courses/windows">Windows</RouterLink>
        <RouterLink to="/courses/office">Microsoft Office</RouterLink>
        <RouterLink to="/courses/productivity">Productivity</RouterLink>
        <RouterLink to="/courses/internet">Internet</RouterLink>
        <RouterLink to="/courses/programming">Programming</RouterLink>
      </div>

      <div class="footer-col">
        <h3>Company</h3>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/contact">Contact us</RouterLink>
        <RouterLink to="/faq">FAQ</RouterLink>
      </div>

      <div class="footer-col">
        <h3>Legal</h3>
        <RouterLink to="/privacy">Privacy policy</RouterLink>
        <RouterLink to="/terms">Terms of service</RouterLink>
        <RouterLink to="/cookies">Manage cookies</RouterLink>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2026 InCtrl. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.footer {
  margin-top: 4rem;
  padding: 3rem 2rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(20, 12, 8, 0.75);
}

.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: left;
}

.footer-col a:hover {
  color: var(--color-text-main);
  text-decoration: none;
}

.footer-col a {
  font-size: 16px;
  font-family: var(--font-body);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-col h3 {
  font-size: 14px;
  margin: 0 0 0.5rem;
}

.footer-logo {
  font-size: 2rem;
  color: var(--color-text-main);
  text-decoration: none;
}

.footer-bottom {
  max-width: 1200px;
  margin: 2rem auto 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  text-align: center;
}

.footer-bottom p {
  font-size: 14px;
  margin: 0;
}
</style>
