<template>
  <div class="container d-flex justify-content-center" style="padding-top: 3%">
    <div class="col-xxl-12 col-lg-12 col-md-12 col-sm-12 col-12 background">
      <h1 class="profileTitle mt-5 text-center">Profile</h1>
      <div class="content ms-5">
        <div v-if="userInfo">
          <span class="label">Username:</span>
          <span class="value">{{ userInfo.username }}</span>
        </div>
        <div v-if="userInfo">
          <span class="label">Email:</span>
          <span class="value">{{ userInfo.email }}</span>
        </div>
        <div v-if="userInfo">
          <span class="label">Role:</span>
          <span class="value">{{ userInfo.role }}</span>
        </div>
      </div>

      <div class="recipes">
        <div class="favourTitle ms-5">Favour Recipes</div>
        <DataTable
          :value="favourRecipes"
          class="m-3"
          paginator
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
        >
          <Column field="title" header="title"></Column>
          <Column field="author" header="author"></Column>
          <Column field="prepTime" header="prepare time"></Column>
          <Column field="description" header="description"></Column>
          <Column field="instruction" header="instruction"></Column>
          <Column class="w-24 !text-end">
            <template #body="{ data }">
              <button
                class="btn btn-primary ms-4"
                @click="selectRecipe(data)"
                severity="secondary"
                rounded
              >
                Check
              </button>
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="registEvent">
        <div class="eventTitle ms-5">Registed Events:</div>
        <DataTable
          :value="events"
          class="m-3"
          paginator
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
        >
          <Column field="title" header="title"></Column>
          <Column field="organizer" header="organizer"></Column>
          <Column field="category" header="Category"></Column>
          <Column field="description" header="description">
            <template #body="{ data }">{{ data.description || 'null' }}</template>
          </Column>
          <Column field="displayDate" header="Date"></Column>
          <Column class="w-24 !text-end">
            <template #body="{ data }">
              <button
                class="btn btn-primary ms-4"
                @click="selectEvent(data)"
                severity="secondary"
                rounded
              >
                View
              </button>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useUserStore } from '@/store/user'
import { onMounted, onUpdated, ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '@/firebase'
import { DataTable, Column } from 'primevue'
import { toJsDate, formatYMDHMS } from '@/utils/datetime'

import { useRouter } from 'vue-router'

const userStore = useUserStore()
const events = ref([])
const favourRecipes = ref([])

const userInfo = ref({})
const router = useRouter()

const selectRecipe = (data) => {
  console.log('jump to: ', data.id)
  router.push({ name: 'RecipeDetail', params: { id: data.id } })
}

const selectEvent = (data) => {
  console.log('jump to ', data.id)
  router.push({ name: 'EventDetails', params: { id: data.id } })
  // router.push({ name: 'Profile', params: { id: userStore.uid } })
}
// const displayDate = computed(() => {
//   return formatYMDHMS(toJsDate(props.event.date))
// })

const getRegistedEvents = async () => {
  // const eventIdList = request.data?.idList
  try {
    const call = httpsCallable(functions, 'getEventListByIds')
    const payload = { idList: userInfo.value.registedEvent }

    const result = await call(payload)
    console.log('events:')
    events.value = result.data.events
    events.value.map((record) => {
      record.displayDate = formatYMDHMS(toJsDate(record.date))
    })
    // userInfo.value = result.data.profile
  } catch (e) {
    console.log(e)
  }
}

const getFavourRecipes = async () => {
  try {
    const call = httpsCallable(functions, 'getRecipeListByIds')
    const payload = { idList: userInfo.value.favourRecipe }
    const result = await call(payload)
    console.log('recipes:')
    console.log(result.data)
    favourRecipes.value = result.data.recipes
  } catch (e) {
    console.log(e)
  }
}

function waitforAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off()
      resolve(u)
    })
  })
}

async function loadUserInfo() {
  try {
    const call = httpsCallable(functions, 'getUserInfo')
    const result = await call(userStore.id)
    console.log('results from uid: ', userStore.id)

    userInfo.value = result.data.profile
    console.log(userInfo.value)

    await getFavourRecipes()
    await getRegistedEvents()
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const user = await waitforAuth()
  if (user) {
    console.log('User is signed in: ', user.email)
    await loadUserInfo()
  }
})
</script>

<style scoped>
.background {
  border-radius: 30px;
  background-color: antiquewhite;
}
.profileTitle {
  font-size: 40px;
  font-weight: bold;
}

.favourTitle,
.eventTitle {
  font-size: 20px;
  font-weight: bold;
  font-style: italic;
}

.label {
  display: inline-block;
  width: 100px; /* same width for all labels */
  font-weight: bold;
}

.value {
  font-style: italic;
  flex: 1;
}
</style>
