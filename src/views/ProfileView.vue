<template>
  <div class="container d-flex justify-content-center" style="padding-top: 3%">
    <div class="col-xxl-12 col-lg-12 col-md-12 col-sm-12 col-12 background">
      <h1 class="mt-5 text-center">Profile</h1>
      <div class="">
        <div v-if="userInfo">Username: {{ userInfo.username }}</div>
        <div>
          <div>Registed Events:</div>
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
            <Column class="w-24 !text-end" header="View location">
              <template #body="{ data }">
                <button
                class="btn btn-primary ms-4"
                @click="selectRow(data)"
                  severity="secondary"
                  rounded
                >View</button>
              </template>
            </Column>
          </DataTable>
        </div>
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

const userStore = useUserStore()
const events = ref([])
const userInfo = ref({})

const selectRow = (data)=>{
  console.log("jump to ", data) 
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
    console.log('results:')
    userInfo.value = result.data.profile
    console.log(userInfo.value)

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
</style>
