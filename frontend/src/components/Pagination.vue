<script setup>
import { computed, ref, watch } from 'vue'
import { paginate } from '@/utils/paginate'

const props = defineProps({
  items: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 10 },
  previousLabel: { type: String, default: 'Previous' },
  nextLabel: { type: String, default: 'Next' },
  label: { type: String, default: 'Pagination' },
})

const page = ref(1)

const state = computed(() => paginate(props.items, page.value, props.pageSize))

watch(
  () => [props.items, props.pageSize],
  () => {
    page.value = 1
  },
)

watch(state, (value) => {
  if (page.value !== value.page) page.value = value.page
})

function setPage(next) {
  page.value = next
}
</script>

<template>
  <slot
    :items="state.items"
    :page="state.page"
    :page-count="state.pageCount"
    :total="state.total"
  />
  <nav v-if="state.pageCount > 1" class="pager" :aria-label="label">
    <button type="button" :disabled="state.page <= 1" @click="setPage(state.page - 1)">
      {{ previousLabel }}
    </button>
    <span>{{ state.page }} / {{ state.pageCount }}</span>
    <button
      type="button"
      :disabled="state.page >= state.pageCount"
      @click="setPage(state.page + 1)"
    >
      {{ nextLabel }}
    </button>
  </nav>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.pager button:disabled {
  color: var(--color-text-main);
  cursor: default;
}

.pager span {
  font-family: var(--font-body), sans-serif;
  color: var(--color-text-main);
  letter-spacing: 1px;
}

.pager button {
  padding: 0.5rem 1.2rem;
  font-family: var(--font-body), sans-serif;
  font-size: 0.95rem;
  letter-spacing: 1px;
  color: var(--color-text-main);
  cursor: pointer;
  border-radius: 40px;

  /* Samma glas som dina andra knappar */
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);

  transition: all 0.3s ease;
}

.pager button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
}
</style>
