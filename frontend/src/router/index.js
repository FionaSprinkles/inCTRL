import { createRouter, createWebHistory } from 'vue-router'
import  HomeView  from "../views/homeView/HomeView.vue";
import QuizPrototypeView from '../views/QuizPrototypeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: QuizPrototypeView,
    },
  ],
})

export default router
