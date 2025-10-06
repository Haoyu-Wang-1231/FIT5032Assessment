<script setup>
import { ref, onMounted } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { useUserStore } from '@/store/user'
import { db, auth, functions } from '@/firebase'
import DataView from 'primevue/dataview'
import EventViewCard from '@/components/EventViewCard.vue'
import InputText from 'primevue/inputtext'

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
  <div class="container">
    <div class="d-flex justify-content-center align-items-center pt-5">
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
    <DataView class="p-5" :value="events" paginator :rows="10" :rowsPerPageOptions="[5, 10, 15]">
      <template #list="{ items }">
        <EventViewCard v-for="event in items" :key="event.id" :event="event" />
      </template>

      <!-- <template #list="slotProps">
        <div
          v-for="event in slotProps.items"
          :key="event.id"
          class="flex align-items-center p-3 border-bottom-1 surface-border"
        >
          <div class="flex-1">
            <div class="text-muted">title: {{ event.title }}</div>
            <div>Organizer: {{ event.organizer }}</div>
            <div>Location: lat: {{ event.lat }} lng: {{ event.lng }}</div>
            <div>Description: {{event.description}}</div>
          </div>
        </div>
      </template> -->
    </DataView>
  </div>
</template>
