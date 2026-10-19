import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeViews/HomeView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import ShortcutsView from '../views/ShortcutsView.vue'
import QuizPrototypeView from '../views/QuizPrototypeView.vue'
import SignUpView from '@/views/AuthViews/SignUpView.vue'
import AboutView from '@/views/AboutView.vue'
import Leaderboard from '@/views/Leaderboard.vue'
import History from '@/components/History.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
    },
    {
      path: '/shortcuts',
      name: 'shortcuts',
      component: ShortcutsView,
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
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/leaderboards',
      name: 'leaderboards',
      component: Leaderboard,
    },
    {
      path: '/history',
      name: 'history',
      component: History
    }
  ],
})

export default router
