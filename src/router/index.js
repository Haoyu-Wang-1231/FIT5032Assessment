import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
// import AboutView from '../views/AboutView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import RecipeView from '@/views/RecipeView.vue'
import MapView from '@/views/event/MapView.vue'
import EventsView from '@/views/event/EventsView.vue'
import ProfileView from '@/views/ProfileView.vue'
import EventDetailView from '@/views/event/EventDetailView.vue'
import { useUserStore } from '@/store/user'
import { auth } from '@/firebase'
const EmptyRouterView = { render: () => h('router-view') }

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { navkey: 'guest' },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { navkey: 'auth' },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { navkey: 'auth' },
  },

  //user
  {
    path: '/user',
    meta: { navkey: 'viewer', hidden: true },
    children: [
      {
        path: 'profile/uid=:id',
        name: 'Profile',
        props: true,
        component: ProfileView,
      },
    ],
  },

  {
    path: '/recipe',
    name: 'Recipe',
    component: RecipeView,
    meta: { navkey: 'viewer' },
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView,
    meta: { navkey: 'viewer' },
  },
  {
    path: '/events',
    meta: { navkey: 'viewer', hidden: true },
    children: [
      { path: 'eid=:id', name: 'EventDetails', props: true, component: EventDetailView },
      { path: 'list', name: 'EventList', component: EventsView },
      { path: 'map', name: 'EventMap', component: MapView },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

// router.beforeEach(async(to) => {
//   const userStore = useUserStore()
// });

export default router
