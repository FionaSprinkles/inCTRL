import { createRouter, createWebHistory } from 'vue-router'
import QuizPrototypeView from '../views/QuizPrototypeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'quiz',
      component: QuizPrototypeView,
    },
  ],
})

export default router
