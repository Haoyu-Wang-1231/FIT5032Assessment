<template>
  <div class="container" style="padding-top: 3%">
    <div class="pt-5 pb-5 background">
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
        <button class="btn btn-primary ms-5" type="button" label="Save" @click="search">
          Search
        </button>
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
 
const events = ref([])
const searchWord = ref('')
const searchType = ref('')
const router = useRouter()
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
</style>
