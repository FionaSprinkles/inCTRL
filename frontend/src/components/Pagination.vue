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
  font-family: var(--font-body);
  color: var(--color-text-main);
  letter-spacing: 1px;
}

</style>
