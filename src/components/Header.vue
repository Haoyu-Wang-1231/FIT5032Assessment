<template>
  <!-- sm,md,lg,xxl -->

  <div class="container-fluid d-flex justify-content-between gne-header flex-column flex-sm-row">
    <div class="col-xxl-3 col-lg-3 col-md-5 col-sm-5 col-12" @click="toHome">
      General Nutrition Educator
    </div>
    <div
      class="col-xxl-5 col-lg-5 col-md-6 col-sm-7 col-12 d-flex justify-content-around flex-column flex-sm-row"
    >
      <div v-for="link in links" :key="link.name">
        <UserDropMenu
          :ref="(el) => (menuRefs[link.name] = el)"
          v-if="link.name === 'User' && link.children"
          @goProfile="goProfile"
          @logout="logout"
        >
          <template #trigger>
            <div
              class="focusable-div user-trigger"
              tabindex="0"
              role="button"
              @keydown.enter="openUserMenu"
              @keydown.space.prevent="openUserMenu"
            >
              {{ link.name }}
            </div>
          </template>

          <!-- <template #trigger>
            <div class="focusable-div user-trigger">{{ link.name }}</div>
          </template> -->
        </UserDropMenu>

        <RecipeDropMenu
          :ref="(el) => (menuRefs[link.name] = el)"
          v-else-if="link.name === 'Recipes'"
          @goRecipeList="goRecipeList"
          @goFavour=""
          @goRecipeManager="goRecipeManager"
        >
          <template #trigger>
            <div
              class="focusable-div user-trigger"
              tabindex="0"
              role="button"
              @keydown.enter="openRecipeMenu"
              @keydown.space.prevent="openRecipeMenu"
            >
              {{ link.name }}
            </div>
          </template>

          <!-- <template #trigger>
            <div class="focusable-div user-trigger">{{ link.name }}</div>
          </template> -->
        </RecipeDropMenu>

        <EventDropMenu
          :ref="(el) => (menuRefs[link.name] = el)"
          v-else-if="link.name === 'Events' && link.children"
          @goEventsList="goEventsList"
          @goEventsMap="goEventsMap"
          @goEventsManager="goEventsManager"
        >
          <template #trigger>
            <div
              class="focusable-div user-trigger"
              tabindex="0"
              role="button"
              @keydown.enter="openEventMenu"
              @keydown.space.prevent="openEventMenu"
            >
              {{ link.name }}
            </div>
          </template>

          <!-- <template #trigger>
            <div class="focusable-div user-trigger">{{ link.name }}</div>
          </template> -->
        </EventDropMenu>

        <RouterLink
          v-else
          :to="link.to"
          :class="{ active: route.path === link.to }"
          @click="() => handleActive(link)"
          @keydown.enter="handleActive(link)"
          @keydown.space.prevent="handleActive(link)"
        >
          {{ link.name }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, reactive } from 'vue'
import { RouterLink, routerViewLocationKey, useRoute, useRouter } from 'vue-router'
import { navConfig } from '@/config/nav'
import { auth, db, functions } from '@/firebase'
import { useUserStore } from '@/store/user'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'

import UserDropMenu from './dropMenu/UserDropMenu.vue'
import EventDropMenu from './dropMenu/EventDropMenu.vue'
import RecipeDropMenu from './dropMenu/RecipeDropMenu.vue'

const route = useRoute()
const userStore = useUserStore()
const router = useRouter()

const menuRefs = reactive({})

const openUserMenu = () => {
  console.log(menuRefs['User'])
  menuRefs['User']?.openWithDelay?.(true)
}

const openRecipeMenu = () => {
  console.log(menuRefs['Recipes'])
  menuRefs['Recipes']?.openWithDelay?.(true)
}

const openEventMenu = () => {
  console.log(menuRefs['Events'])
  menuRefs['Events']?.openWithDelay?.(true)
}

const links = computed(() => {
  const key = userStore.role || 'guest'
  console.log('key:' + key)
  return navConfig[key] || []
})

const toHome = () => {
  console.log('to home')
  router.push({ name: 'Home' })
}

const goProfile = () => {
  console.log('uid' + userStore.uid)
  menuRefs['User']?.openWithDelay?.(false)

  router.push({ name: 'Profile', params: { id: userStore.uid } })
  // router.push({ name: 'UserProfile', params: { uid: userStore.id } })
}

const goRecipeManager = () => {
  if (userStore.isAdmin) {
    router.push({ name: 'RecipeManager' })
  }
}

const goEventsManager = () => {
  if (userStore.isAdmin) {
    router.push({ name: 'EventManager' })
  }
}

const goRecipeList = () => {
  router.push({ name: 'RecipeList' })
}


const goEventsList = () => {
  router.push({ name: 'EventList' })
}
const goEventsMap = () => {
  router.push({ name: 'EventMap' })
}

const logout = async () => {
  try {
    await userStore.logout()
    router.replace('/login')
  } catch (err) {
    console.error('Error logging out:', err)
  }
}

const handleActive = async (link) => {
  if (link.name === 'Log out') {
    try {
      userStore.logout()
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }
}
async function waitForAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off()
      resolve(u)
    })
  })
}

async function loadUser() {
  try {
    const call = httpsCallable(functions, 'getUserInfo')
    // console.log('uid: ' + userStore.id)
    const payload = { userId: userStore.id }

    const result = await call(payload)
    console.log(result)

    // totalRows.value = events.value.length;
    // console.log('Events loaded:', events.value);
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const user = await waitForAuth()
  if (user) {
    // await userStore.setUser(user.uid, user.email)
    await loadUser()
  }
})
</script>

<style scoped>
.gne-header {
  background-color: #03fc90;
}

a:focus {
  box-shadow: none !important;
  outline: 2px solid #005fcc !important;
}

.focusable-div:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}
</style>
