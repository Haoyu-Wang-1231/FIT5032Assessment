<template>
  <div class="container" style="padding-top: 3%">
    <div class="pt-5 pb-5 background">
      <h1 class="EventTitle text-center mb-5">Event Management</h1>

      <div class="d-flex justify-content-center align-items-center flex-column flex-sm-row">
        <Select
          style="width: 160px"
          checkmark
          v-model="searchType"
          :options="selections"
          optionLabel="name"
          placeholder="Search type"
        ></Select>

        <InputText
          v-model="searchWord"
          id="search"
          class="flex-auto ms-3"
          :style="{ width: '40%' }"
          autocomplete="off"
          placeholder="Enter event's title"
        />
        <button class="btn btn-primary ms-3 me-3" type="button" label="Save" @click="search">
          Search
        </button>
        <!-- <AddRecipeDialog @recipeSaved="reloadReciepes" v-if="userStore.role === 'admin'" /> -->
        <AddEventDialog @eventSaved="reloadEvents" />
        <!-- <button class="btn btn-primary ms-3"> Add Event</button> -->
      </div>
      <div class="m-3">
        <DataTable
          sortMode="multiple"
          :value="events"
          class="m-3"
          paginator
          :rows="10"
          removableSort
          :rowsPerPageOptions="[5, 10, 20]"
          selectionMode="single"
          @rowSelect="selectRow"
        >
          <template #empty> No customers found. </template>

          <Column field="title" sortable header="title"></Column>
          <Column field="organizer" sortable header="organizer">
            <template #body="{ data }">{{ data.organizer || 'null' }}</template>
          </Column>
          <Column field="category" sortable header="Category">
            <template #body="{ data }">{{ data.category || 'null' }}</template>
          </Column>
          <Column field="description" header="description">
            <template #body="{ data }">{{ data.description || 'null' }}</template>
          </Column>
          <Column field="displayDate" sortable header="Date"></Column>
          <Column class="w-24 !text-end">
            <template #body="{ data }">
              <ModifyEventDialog :id="data.id" @eventSaved="reloadEvents"></ModifyEventDialog>
              <button @click="removeEvent(data.id)" style="width: 120px;" class="btn btn-danger">Remove</button>

              <!-- <button
                class="btn btn-primary ms-4"
                severity="secondary"
                rounded
              >
                Modify
              </button> -->
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { useUserStore } from '@/store/user'
import { db, auth, functions } from '@/firebase'
import DataView from 'primevue/dataview'
import EventViewCard from '@/components/EventViewCard.vue'
import InputText from 'primevue/inputtext'
import { DataTable, Column, Select } from 'primevue'
import { toJsDate, formatYMDHMS } from '@/utils/datetime'
import { useRoute, useRouter } from 'vue-router'
import AddEventDialog from '@/components/dialog/AddEventDialog.vue'
import ModifyEventDialog from '@/components/dialog/ModifyEventDialog.vue'
import { Loader } from '@googlemaps/js-api-loader'

const events = ref([])
const searchWord = ref('')
const searchType = ref('')
const router = useRouter()
const useStore = useUserStore()

const selections = ref([
  { name: 'title' },
  { name: 'organizer' },
  { name: 'category' },
  { name: 'description' },
])

function waitforAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off()
      resolve(u)
    })
  })
}

async function loadEvents() {
  try {
    const call = httpsCallable(functions, 'getEvents')
    const result = await call()
    events.value = result.data
    events.value.map((record) => {
      record.displayDate = formatYMDHMS(toJsDate(record.date))
    })
  } catch (e) {
    console.log(e)
  }
}

const removeEvent = async (eid) => {
  try {
    const call = httpsCallable(functions, 'removeEvent')
    const payload = { id: eid , isAdmin: useStore.isAdmin}
    const result = await call(payload)
    
    // const result = await call()
    // events.value = result.data
    console.log(result.data)
    await loadEvents()
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const user = await waitforAuth()
  if (user) {
    console.log('User is signed in: ', user.email)

    await loadEvents()
  }
})

const search = async () => {
  try {
    const call = httpsCallable(functions, 'getEventListByTitle')
    const payload = { searchWord: searchWord.value, type: searchType.value.name }
    console.log(payload)
    const result = await call(payload)
    events.value = result.data
    events.value.map((record) => {
      record.displayDate = formatYMDHMS(toJsDate(record.date))
    })
  } catch (err) {
    console.log(err)
  }
}

const reloadEvents = async () => {
  await loadEvents()
}

const selectRow = (event) => {
  console.log(event.data.id)
  router.push({ name: 'EventDetails', params: { id: event.data.id } })
}
</script>

<style scoped>
.background {
  border-radius: 30px;
  background-color: antiquewhite;
}

.EventTitle {
  font-size: 60px;
  font-weight: bold;
}
</style>
