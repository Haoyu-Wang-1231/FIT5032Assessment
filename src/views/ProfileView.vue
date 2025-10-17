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

      <div v-if="userStore.isAdmin" class="recipes">
        <div class="favourTitle ms-5">Recipes overview</div>
        <DataTable
          :value="recipesList"
          class="m-3"
          paginator
          removableSort
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
        >
          <Column field="title" sortable header="title"></Column>
          <Column field="favours.length()" sortable header="favours">
            <template #body="data">
              {{ data.data.favours.length }}
            </template>
          </Column>
          <Column field="author" sortable header="author"></Column>
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

      <div v-if="userStore.isAdmin" class="registEvent">
        <div class="eventTitle ms-5">Events Manager</div>
        <DataTable
          :value="eventsList"
          class="m-3"
          paginator
          removableSort
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
        >
          <Column field="title" sortable header="title"></Column>
          <Column header="Registers" sortable>
            <template #body="data">
              {{ data.registers ? data.registers.length : 0 }}
            </template>
          </Column>
          <!-- <Column header="Registers">
            <template #body="data">
              {{ data.data.registers.length || 0 }}
            </template>
          </Column> -->
          <Column field="organizer" sortable header="organizer"></Column>
          <Column field="category" sortable header="Category"></Column>
          <Column field="description" header="description">
            <template #body="{ data }">{{ data.description || 'null' }}</template>
          </Column>
          <Column field="displayDate" sortable header="Date"></Column>
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

      <div v-if="userStore.isAdmin" class="recipes">
        <div class="favourTitle ms-5">User Infomation</div>
        <DataTable
          :value="usersList"
          class="m-3"
          paginator
          removableSort
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
        >
          <Column field="username" sortable header="username"></Column>
          <Column field="email" sortable header="email"></Column>
          <Column field="displayDate" sortable header="created at"></Column>
          <Column field="role" sortable header="role"></Column>
          <Column header="registed events" sortable>
            <template #body="data">
              {{ data.data.registedEvent ? data.data.registedEvent.length : 0 }}
            </template>
          </Column>
          <Column header="favour recipe" sortable>
            <template #body="data">
              {{ data.data.favourRecipe ? data.data.favourRecipe.length : 0 }}
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="users">
        <div class="eventTitle ms-5">Favour Recipes</div>
        <DataTable
          :value="favourRecipes"
          class="m-3"
          paginator
          :rows="5"
          removableSort
          :rowsPerPageOptions="[5, 10, 20]"
        >
          <Column field="title" sortable header="title"></Column>

          <Column field="author" sortable header="author"></Column>
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
          removableSort
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
        >
          <Column field="title" sortable header="title"></Column>
          <Column field="organizer" sortable header="organizer"></Column>
          <Column field="category" sortable header="Category"></Column>
          <Column field="description" header="description">
            <template #body="{ data }">{{ data.description || 'null' }}</template>
          </Column>
          <Column field="displayDate" sortable header="Date"></Column>
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

//admin used
const recipesList = ref([])
const eventsList = ref([])
const usersList = ref([])

const userInfo = ref({})
const router = useRouter()

const printting = (input)=>{
  console.log(input)
}


const selectRecipe = (data) => {
  console.log('jump to: ', data.id)
  router.push({ name: 'RecipeDetail', params: { id: data.id } })
}

const selectEvent = (data) => {
  console.log('jump to ', data.id)
  router.push({ name: 'EventDetails', params: { id: data.id } })
  // router.push({ name: 'Profile', params: { id: userStore.uid } })
}

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

const adminLoad = async () => {
  try {
    const eventCall = httpsCallable(functions, 'getEvents')
    const eventResult = await eventCall()
    eventsList.value = eventResult.data
    eventsList.value.map((record) => {
      record.displayDate = formatYMDHMS(toJsDate(record.date))
    })
    const recipeCall = httpsCallable(functions, 'getRecipes')
    const recipeResult = await recipeCall()
    recipesList.value = recipeResult.data

    // getUsers
    const userCall = httpsCallable(functions, 'getUsers')
    const userResult = await userCall()
    usersList.value = userResult.data
    usersList.value.map((record) => {
      record.displayDate = formatYMDHMS(toJsDate(record.createdAt))
    })
    console.log("userlist")

    console.log(usersList.value[0].registedEvent.length)
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const user = await waitforAuth()
  if (user) {
    console.log('User is signed in: ', user.email)

    if (userStore.isAdmin) {
      await adminLoad()
    }
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
