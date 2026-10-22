<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import Pagination from '@/components/Pagination.vue'

const shortcuts = ref([])
const loading = ref(true)
const error = ref('')
const q = ref('')
const showDropdown = ref(false)
const selectedCategories = ref([])
const selectedDifficulty = ref('')
const filterRef = ref(null)

// Toggles the visibility state of the filter dropdown menu
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleClickOutside(event) {
  if (filterRef.value && !filterRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  fetchShortcuts()
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

// Toggles a category in the multi-select array (adds or removes it)
function toggleCategory(category) {
  if (category === '') {
    selectedCategories.value = []
    return
  }
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1) // Remove if already selected
  } else {
    selectedCategories.value.push(category) // Add if not selected
  }
}

// Selects a difficulty
function selectDifficulty(difficulty) {
  if (selectedDifficulty.value === difficulty) {
    selectedDifficulty.value = ''
  } else {
    selectedDifficulty.value = difficulty
  }
}

// Filter for search, categories and difficulty
const filteredShortcuts = computed(() => {
  const query = q.value.toLowerCase().trim()

  return shortcuts.value.filter((shortcut) => {
    // Search query filter
    const matchesQuery =
      !query ||
      (shortcut.title || '').toLowerCase().includes(query) ||
      (shortcut.keyCombo || '').toLowerCase().includes(query) ||
      (shortcut.description || '').toLowerCase().includes(query) ||
      (shortcut.categoryName || 'Uncategorized').toLowerCase().includes(query) ||
      (shortcut.difficulty || '').toLowerCase().includes(query)

    // Category filter
    const matchesCategory =
      selectedCategories.value.length === 0 ||
      selectedCategories.value.some((cat) => {
        const target = cat.toLowerCase().trim()

        const sId = String(shortcut.categoryId || '').toLowerCase()
        const sSlug = String(shortcut.categorySlug || '').toLowerCase()
        const sName = String(shortcut.categoryName || '').toLowerCase()

        return (
          sId === target ||
          sSlug === target ||
          sName === target ||
          sName.includes(target) ||
          target.includes(sName)
        )
      })

    // Difficulty filter
    const matchesDifficulty =
      !selectedDifficulty.value ||
      (shortcut.difficulty || '').toLowerCase() === selectedDifficulty.value.toLowerCase()

    return matchesQuery && matchesCategory && matchesDifficulty
  })
})

async function fetchShortcuts() {
  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/shortcuts')
    const data = await res.json().catch(() => null)
    if (!res.ok || !data || data.success === false || !Array.isArray(data.shortcuts)) {
      throw new Error('Could not load shortcuts.')
    }
    shortcuts.value = data.shortcuts
  } catch {
    shortcuts.value = []
    error.value = 'Could not load shortcuts.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchShortcuts)
</script>

<template>
  <main class="shortcuts-page">
    <div class="page-header">
      <h1>Shortcuts</h1>
      <div class="header-controls">
        <!-- Filter button -->
        <div class="filter-wrapper" ref="filterRef">
          <button class="filter-btn" @click="toggleDropdown">Filter</button>
          <!-- Dropdown -->
          <div v-if="showDropdown" class="dropdown-menu">
            <div class="dropdown-section">
              <!-- Categories -->
              <p class="dropdown-title">Categories</p>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.length === 0 }"
                @click="toggleCategory('')"
              >
                All categories
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('Essential Windows Navigation') }"
                @click="toggleCategory('Essential Windows Navigation')"
              >
                Essential Windows Navigation
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('System & Troubleshooting') }"
                @click="toggleCategory('System & Troubleshooting')"
              >
                System & Troubleshooting
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('File Explorer & Windows Tools') }"
                @click="toggleCategory('File Explorer & Windows Tools')"
              >
                File Explorer & Windows Tools
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('Multitasking & Window Management') }"
                @click="toggleCategory('Multitasking & Window Management')"
              >
                Multitasking & Window Management
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('Window Snapping & Layout') }"
                @click="toggleCategory('Window Snapping & Layout')"
              >
                Window Snapping & Layout
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('Virtual Desktops') }"
                @click="toggleCategory('Virtual Desktops')"
              >
                Virtual Desktops
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('Windows Power Keys') }"
                @click="toggleCategory('Windows Power Keys')"
              >
                Windows Power Keys
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('Interactive Keyboard Practice') }"
                @click="toggleCategory('Interactive Keyboard Practice')"
              >
                Interactive Keyboard Practice
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('Text Editing & Formatting') }"
                @click="toggleCategory('Text Editing & Formatting')"
              >
                Text Editing & Formatting
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('Taskbar & System Tray') }"
                @click="toggleCategory('Taskbar & System Tray')"
              >
                Taskbar & System Tray
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedCategories.includes('Dialog Boxes & Settings') }"
                @click="toggleCategory('Dialog Boxes & Settings')"
              >
                Dialog Boxes & Settings
              </button>
            </div>

            <div class="dropdown-section">
              <!-- Difficulty -->
              <p class="dropdown-title">Difficulty</p>
              <button
                class="dropdown-item"
                :class="{ active: selectedDifficulty === '' }"
                @click="selectDifficulty('')"
              >
                All difficulties
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedDifficulty === 'beginner' }"
                @click="selectDifficulty('beginner')"
              >
                Beginner
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedDifficulty === 'intermediate' }"
                @click="selectDifficulty('intermediate')"
              >
                Intermediate
              </button>
              <button
                class="dropdown-item"
                :class="{ active: selectedDifficulty === 'advanced' }"
                @click="selectDifficulty('advanced')"
              >
                Advanced
              </button>
            </div>
          </div>
        </div>

        <!-- The search field -->
        <input
          v-model="q"
          type="text"
          placeholder="Search.."
          aria-label="Search shortcuts"
          class="search-input"
        />
      </div>
    </div>

    <p v-if="error" role="alert">{{ error }}</p>
    <p v-else-if="loading">Loading shortcuts...</p>
    <p v-else-if="shortcuts.length === 0">No shortcuts to show.</p>
    <p v-else-if="filteredShortcuts.length === 0">No results.</p>

    <Pagination v-else :items="filteredShortcuts" :page-size="10">
      <template #default="{ items }">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Shortcut</th>
                <th scope="col">What it does</th>
                <th scope="col">Category</th>
                <th scope="col">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="shortcut in items" :key="shortcut.id">
                <td>
                  <kbd>{{ shortcut.keyCombo }}</kbd>
                </td>
                <td>{{ shortcut.description }}</td>
                <td>{{ shortcut.categoryName || 'Uncategorized' }}</td>
                <td>{{ shortcut.difficulty }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>
  </main>
</template>

<style scoped>
.shortcuts-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.table-wrap {
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.85rem 1rem;
  text-align: left;
  vertical-align: top;
}

th {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 450;
  letter-spacing: 1px;
  color: var(--color-text-main);
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
}

td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

tbody tr:last-child td {
  border-bottom: none;
}

kbd {
  color: var(--color-text-heading);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 6px;
  padding: 0.15rem 0.45rem;
  white-space: nowrap;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* Search bar design */
.search-input {
  padding: 0.6rem 1rem;
  font-size: 18px;
  font-family: var(--font-display);
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  outline: none;
  width: 250px;
  transition: border-color 0.2s;
  backdrop-filter: blur(16px) saturate(160%);
  color: var(--color-text-main);
}

.search-input::placeholder {
  color: var(--color-text-main);
}

.search-input:focus {
  border: 1px solid rgba(255, 255, 255, 0.35);
}

/* Opens the dropdown filter menu */
.filter-wrapper {
  position: relative;
}

/* Filter button position */
.header-controls {
  display: flex;
  gap: 1rem;
}

/* Filter button design */
.filter-btn {
  padding: 0.6rem 1.2rem;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(16px) saturate(160%);
}

/* Filter button hover */
.filter-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: box-shadow 0.25s ease;
}

/* Dropdown menu styling */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  width: 280px;
  max-height: 350px;
  overflow-y: auto;
  background: var(--color-dark-teal);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  padding: 1rem;
  z-index: 100;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

/* Dropdown title */
.dropdown-title {
  font-size: 18px;
  text-transform: uppercase;
  color: var(--color-text-heading);
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-family: var(--font-display);
}

/* Dropdown buttons */
.dropdown-item {
  width: 100%;
  text-align: left;
  border: none;
  color: var(--color-text-main);
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  font-family: var(--font-body);
}

/* Dropdown buttons hover */
.dropdown-item:hover {
  background: var(--color-button-hover);
  color: var(--color-dark-teal);
}

/* Dropdown buttons when marked */
.dropdown-item.active {
  background: rgba(255, 255, 255, 0.25);
  font-weight: 600;
}
</style>
