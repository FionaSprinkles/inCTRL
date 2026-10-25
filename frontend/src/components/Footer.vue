<template>
  <footer class="footer">
    <!-- Top part: brand + three link columns -->
    <div class="footer-top">
      <!-- Logo and slogan -->
      <div class="footer-brand">
        <RouterLink to="/" class="footer-logo">InCtrl</RouterLink>
        <p>Take control of your keyboard.</p>
      </div>

      <!-- Courses column -->
      <div class="footer-col">
        <h3>Courses by Category</h3>
        <div class="courses-links">
          <RouterLink to="/categories/essential-navigation">Essential Windows Navigation</RouterLink>
          <RouterLink to="/categories/system-troubleshooting">System & Troubleshooting</RouterLink>
          <RouterLink to="/categories/file-explorer">File Explorer & Windows Tools</RouterLink>
          <RouterLink to="/categories/multitasking">Multitasking & Window Management</RouterLink>
          <RouterLink to="/categories/window-snapping">Window Snapping & Layout</RouterLink>
          <RouterLink to="/categories/virtual-desktops">Virtual Desktops</RouterLink>
          <RouterLink to="/categories/power-keys">Windows Power Keys</RouterLink>
          <RouterLink to="/categories/keyboard-practice">Interactive Keyboard Practice</RouterLink>
          <RouterLink to="/categories/text-editing">Text Editing & Formatting</RouterLink>
          <RouterLink to="/categories/taskbar">Taskbar & System Tray</RouterLink>
          <RouterLink to="/categories/dialogs-settings">Dialog Boxes & Settings</RouterLink>
        </div>
      </div>

      <!-- Company column -->
      <div class="footer-col">
        <h3>Company</h3>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/contact">Contact us</RouterLink>
        <RouterLink to="/faq">FAQ</RouterLink>
      </div>

      <!-- Legal column -->
      <div class="footer-col">
        <h3>Legal</h3>
        <RouterLink to="/privacy">Privacy policy</RouterLink>
        <RouterLink to="/terms">Terms of service</RouterLink>
        <RouterLink to="/cookies">Manage cookies</RouterLink>
      </div>
    </div>

    <!-- Bottom part: copyright -->
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
  margin-top: 4rem; /* space between page content and footer */
  padding: 3rem 2rem 1.5rem; /* top, left/right, bottom */
  border-top: 1px solid rgba(255, 255, 255, 0.25); /* thin line at the top */
  background: rgba(20, 12, 8, 0.75); /* dark, slightly transparent */
}

.footer-top {
  display: grid; /* columns side by side */
  grid-template-columns: 2fr 1fr 1fr 1fr; /* so every column is beside each other */
  gap: 5rem; /* space between columns */
  margin: 0 auto; /* centers the grid */
  text-align: left; /* overrides main's centered text */
}

.footer-col a:hover {
  color: var(--color-text-main);
  text-decoration: none;
}

.footer-col a {
  font-size: 16px;
  font-family: var(--font-body), sans-serif; /* Jost instead of the global link font */
  color: var(--color-text-accenturate);
  text-decoration: none; /* no underline */
  transition: color 0.2s ease; /* smooth color change on hover */
}

.footer-col {
  display: flex; /* stack heading and links */
  flex-direction: column; /* vertically */
  gap: 0.5rem; /* space between links */
}

.footer-col h3 {
  font-size: 14px; /* smaller than the global h3 */
  margin: 0 0 0.5rem; /* no top margin, small space below */
}

.footer-logo {
  font-size: 2rem;
  color: var(--color-text-main);
  text-decoration: none; /* no underline */
}

.footer-bottom {
  margin: 2rem auto 0; /* space above, centered */
  padding-top: 1rem; /* space between line and text */
  border-top: 1px solid rgba(255, 255, 255, 0.15); /* faint divider line */
  text-align: center; /* centered copyright */
}

.footer-bottom p {
  font-size: 14px;
  margin: 0; /* removes global p margin */
}

/* Links layout in courses column */

.courses-links {
  column-count: 3;
  column-gap: 2rem;
}

.courses-links a {
  display: block;
  break-inside: avoid;
  margin-bottom: 1.35rem;
}

/* Distance between the columns */
.footer-top > .footer-col:nth-child(2) {
  margin-right: 1.5rem;
}
</style>
