import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
// import AboutView from '../views/AboutView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import RecipeView from '@/views/RecipeView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: {navkey: "default"}
  },
  {
    path: '/recipe',
    name: 'Recipe',
    component: RecipeView,
    meta: {navkey: "default"}

  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: {navkey: "auth"}
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {navkey: "auth"}
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

export default router
