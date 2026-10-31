/** This is a template for dropdowns. Should be used for both browse-dropdown and username-dropdown. 

This component is responsible for:
- The dropdown button
- Open/close dropdown
- Click outside

*/

<template>
  <div ref="dropdown" class="dropdown">
    <button
      class="nav-link"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      {{ label }}
    </button>

    <div v-if="isOpen" class="dropdown-menu"
    :class ="`dropdown-menu--${side}`"> <!--dropdown to the "left" or "right"--> 
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'



// The text displayed on the dropdown button
defineProps({ //what the information the component needs from its parent (ex. navbar)
  label: {
    type: String,
    required: true
  },
  side: { //which side does dropdown open
    type: String,
    default: 'left'
  }
})
const isOpen = ref(false) // Is thedropdown open
const dropdown = ref(null)

// Closes the dropdown when clicking outside of it
function closeDropdown(event) {
   if (!dropdown.value?.contains(event.target) ||
    event.target.closest('.dropdown-menu a, .dropdown-menu button')) { // Close dropdown when clicking outside or inside
    isOpen.value = false
  }
}

// The click listener lives on the document, so it must be removed on unmount
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})
onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})


</script>


<style scoped>


.dropdown {
  position: relative;
}


.dropdown-menu {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 100%; /* starts right below the Browse button */
  z-index: 10; /* stays on top of other elements */
  width: max-content; 
  min-width: 140px;
  max-width: calc(100vw - 2rem);
  box-sizing: border-box;
  padding: 1rem;


    /* Glass effect for the dropdown */
  background: rgba(255, 255, 255, 0.12); /* Semi-transparent white background */
  backdrop-filter: blur(16px) saturate(160%); /* Blurs background and boosts color saturation */
  -webkit-backdrop-filter: blur(16px) saturate(160%); /* Safari support for backdrop filter */
  border: 1px solid rgba(255, 255, 255, 0.25); /* Subtle light border for glass edge */
  border-radius: 20px; /* Rounded corners */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25); /* Soft shado% */
}


  .dropdown-menu--left {
  left: 0;
  right: auto;
}

.dropdown-menu--right {
  right: 0;
  left: auto;
}





/* Smaller font for links inside the dropdown */
.dropdown-menu :slotted(.nav-link),
.dropdown-menu :slotted(.category-section) .nav-link {
  font-family: var(--font-body), sans-serif;
  font-size: 16px;
  text-align: left;
}


</style>