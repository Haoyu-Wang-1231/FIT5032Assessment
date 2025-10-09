<script setup>
import { ref, onMounted } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { useUserStore } from '@/store/user'
import { db, auth, functions } from '@/firebase'
import DataView from 'primevue/dataview'
import EventViewCard from '@/components/EventViewCard.vue'
import InputText from 'primevue/inputtext'
import { DataTable, Column } from 'primevue'
import { toJsDate, formatYMDHMS } from '@/utils/datetime'

const events = ref([])
const searchWord = ref(null)

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

const search = () => {
  console.log(searchWord.value)
}
</script>

<template>
  <div class="container" style="padding-top: 3%">
    <div class="pt-5 pb-5 background">
      <div class="d-flex justify-content-center align-items-center">
        <div class="pt-2">Search Event:</div>
        <InputText
          v-model="searchWord"
          id="search"
          class="flex-auto"
          :style="{ width: '40%' }"
          autocomplete="off"
        />
        <button class="btn btn-primary" type="button" label="Save" @click="search">Search</button>
      </div>
      <div class="m-3">
        <DataTable
          :value="events"
          class="m-3"
          paginator
          :rows="10"
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

<style scoped>
.background {
  border-radius: 30px;
  background-color: antiquewhite;
}
</style>
