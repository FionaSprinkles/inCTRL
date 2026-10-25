<script setup>
import { onMounted, ref, computed } from 'vue'
import Pagination from '@/components/Pagination.vue'

const shortcuts = ref([])
const loading = ref(true)
const error = ref('')
const q = ref('')

// Filter shortcuts based on the search query
const filteredShortcuts = computed(() => {
  const query = q.value.toLowerCase().trim()
  if (!query) return shortcuts.value

  return shortcuts.value.filter((shortcut) => {
    return (
      (shortcut.title || '').toLowerCase().includes(query) ||
      (shortcut.keyCombo || '').toLowerCase().includes(query) ||
      (shortcut.description || '').toLowerCase().includes(query) ||
      (shortcut.categoryName || 'Uncategorized').toLowerCase().includes(query) ||
      (shortcut.difficulty || '').toLowerCase().includes(query)
    )
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
      <input
        v-model="q"
        type="text"
        placeholder="Search.."
        aria-label="Search shortcuts"
        class="search-input"
      />
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
  max-width: 960px;
  width: 100%;
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
  color: var(--color-text-white);
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
  font-size: 14px;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  color: var(--color-text-main);
  outline: none;
  width: 250px;
  transition: border-color 0.2s;
  backdrop-filter: blur(16px) saturate(160%);
}

/* Search bar text */
.search-input::placeholder {
  color: var(--color-text-main);
}

/* Search bar border */
.search-input:focus {
  border: 1px solid rgba(255, 255, 255, 0.35);
}
</style>
