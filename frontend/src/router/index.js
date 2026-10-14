import { createRouter, createWebHistory } from 'vue-router'
import  HomeView  from "../views/HomeViews/HomeView.vue";
import QuizPrototypeView from '../views/QuizPrototypeView.vue'
import SignUpView from '@/views/AuthViews/SignUpView.vue'

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
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
  ],
})

export default router
