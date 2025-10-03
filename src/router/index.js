import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
// import AboutView from '../views/AboutView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import RecipeView from '@/views/RecipeView.vue'
import MapView from '@/views/MapView.vue'
import EventsView from '@/views/eventsView.vue'
import { useUserStore } from '@/store/user'
import { auth } from '@/firebase'


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
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView,
    meta: {navkey: "default"}
  },
  {
    path: '/events',
    name: 'Events',
    component: EventsView,
    meta: {navkey: "default"}
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

// router.beforeEach(async(to) => {
//   const userStore = useUserStore()
// });

export default router
