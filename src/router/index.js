import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
// import AboutView from '../views/AboutView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/authentication/LoginView.vue'
import RegisterView from '../views/authentication/RegisterView.vue'
import RecipeListView from '@/views/recipe/RecipeListView.vue'
import MapView from '@/views/event/MapView.vue'
import EventsView from '@/views/event/EventListView.vue'
import ProfileView from '@/views/ProfileView.vue'
import EventDetailView from '@/views/event/EventDetailView.vue'
import RecipeDetailView from '@/views/recipe/RecipeDetailView.vue'
import { useUserStore } from '@/store/user'
import RecipeManagerView from '@/views/recipe/RecipeManagerView.vue'
import EventManageView from '@/views/event/EventManageView.vue'
import getEventsAPI from '@/api/getEventsAPI.vue'
import getRecipesAPI from '@/api/getRecipesAPI.vue'
import NotFoundComponent from '@/components/NotFoundComponent.vue'
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
    meta: { navkey: 'viewer' },
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
    path: '/recipes',
    name: 'Recipes',
    meta: { navkey: 'viewer' },
    children: [
      { path: 'rid=:id', name: 'RecipeDetail', props: true, component: RecipeDetailView },
      { path: 'list', name: 'RecipeList', component: RecipeListView },
      { path: 'manager', name: 'RecipeManager', component: RecipeManagerView },
    ],
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView,
    meta: { navkey: 'viewer' },
  },
  {
    path: '/events',
    meta: { navkey: 'viewer' },
    children: [
      { path: 'eid=:id', name: 'EventDetails', props: true, component: EventDetailView },
      { path: 'list', name: 'EventList', component: EventsView },
      { path: 'map', name: 'EventMap', component: MapView },
      { path: 'manager', name: 'EventManager', component: EventManageView },
    ],
  },
  // api

  {
    path: '/getEventsList',
    name: 'GetEventList',
    component: getEventsAPI,
    meta: { hidden: true },
  },
  {
    path: '/getRecipesList',
    name: 'GetRecipesList',
    component: getRecipesAPI,
    meta: { hidden: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundComponent,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

export default router
