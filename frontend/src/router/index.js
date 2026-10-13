import { createRouter, createWebHistory } from 'vue-router'
import CategoriesView from '../views/CategoriesView.vue'
import QuizPrototypeView from '../views/QuizPrototypeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'categories',
      component: CategoriesView,
    },
    {
      path: '/categories',
      redirect: '/',
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: QuizPrototypeView,
    },
  ],
})

export default router
