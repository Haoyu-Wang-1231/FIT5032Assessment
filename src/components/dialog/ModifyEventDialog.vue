<template>
  <div class="card flex justify-center" style="width: 120px;">
    <button class="btn btn-primary"  label="Show" @click="visible = true">Modify</button>
    <Dialog
      class="col-xxl-4 col-lg-6 col-md-8 col-sm-10 col-12"
      v-model:visible="visible"
      modal
      header="Modify Events"
    >
      <div class="content">
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="username" class="font-semibold w-24">Title:</label>
          <InputText v-model="event.title" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="username" class="font-semibold w-24">Organizer: </label>
          <InputText v-model="event.organizer" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="username" class="font-semibold w-24">Category: </label>
          <InputText v-model="event.category" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="username" class="font-semibold w-24">description: </label>
          <InputText v-model="event.description" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="username" class="font-semibold w-24">date: </label>
          <DatePicker
            class="value"
            id="datepicker-24h"
            v-model="event.newDate"
            showTime
            hourFormat="24"
            showIcon
            fluid
            :showOnFocus="false"
          />

          <!-- <InputText v-model="event.category" class="value" autocomplete="off" /> -->
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="username" class="font-semibold w-24">latitude: </label>
          <InputText v-model="event.lat" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="username" class="font-semibold w-24">longitude: </label>
          <InputText v-model="event.lng" class="value" autocomplete="off" />
        </div>
        <button class="btn btn-primary" type="button" label="Save" @click="modifyEvent">
          Modify
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { db, auth, functions } from '@/firebase'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { Timestamp } from 'firebase/firestore'
import { sanitizePlainText } from '@/security/sanitize'
import { useUserStore } from '@/store/user'
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { Alert } from 'bootstrap'
const emit = defineEmits(['eventSaved'])
import { toJsDate, formatYMDHMS } from '@/utils/datetime'

// emulator

const userStore = useUserStore()
const visible = ref(false)

const props = defineProps({
  id: String,
})

const event = ref({
  title: '',
  organizer: '',
  category: '',
  description: '',
  newDate: null,
  lat: '',
  lng: '',
})

async function loadEvent() {
  try {
    // console.log('event: '+ eid)

    const call = httpsCallable(functions, 'getEventById')
    const payload = { eventId: props.id }
    // console.log(payload)
    const result = await call(payload)
    if (result.data.exists) {
      event.value = result.data.event
      event.value.newDate = formatYMDHMS(toJsDate(event.value.date))
    } else {
      router.back()
    }

    console.log(event.value)
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  if (!userStore.isAdmin) {
    return
  }

  try {
    await loadEvent()
  } catch (err) {
    console.log(err)
  }
})

const modifyEvent = async () => {
  if (!event.value.newDate || isNaN(new Date(event.value.newDate).getTime())) {
    alert('Please provide a valid date.')
    return
  }

  try {
    const payload = {
      id: props.id,
      title: sanitizePlainText(event.value.title, 50),
      organizer: sanitizePlainText(event.value.organizer, 50),
      category: sanitizePlainText(event.value.category, 50),
      description: sanitizePlainText(event.value.description, 50),
      date: event.value.newDate,
      lat: parseFloat(event.value.lat),
      lng: parseFloat(event.value.lng),
      isAdmin: userStore.isAdmin
    }

    for (const [key, value] of Object.entries(payload)) {
      // For latitude/longitude, check for NaN specifically
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (typeof value === 'number' && isNaN(value))
      ) {
        alert(`Field "${key}" cannot be empty or invalid.`)
        return
      }
    }
    const now = new Date()
    if(payload.date < now){
      alert('Time invalid')
      return
    }

    if (payload.lat > 90 || payload.lat < -90) {
      alert('Latitude must be between -90 and 90.')
      return
    }
    if (payload.lng > 180 || payload.lng < -180) {
      alert('Longitude must be between -180 and 180.')
      return
    }
    console.log(payload)

    const call = httpsCallable(functions, 'modifyEvent')
    const result = await call(payload)
    console.log(result.data)


    visible.value = false;
    emit('eventSaved')
  } catch (err) {
    // alert(err)
    console.warn(err)
    return
  }
}

// const saveRecipe = async() => {
//     try{
//         const payload = {
//             title: sanitizePlainText(recipe.value.title, 50),
//             author: sanitizePlainText(recipe.value.author, 20),
//             description: sanitizePlainText(recipe.value.description, 250),
//             prepTime: sanitizePlainText(recipe.value.prepTime, 20),
//         }

//         const call = httpsCallable(functions, "saveRecipe");
//         const result = await call(payload);
//         console.log(result.data);
//         resetReciptValue();

//         visible.value = false;
//         emit('recipeSaved');
//     }catch(e){
//         console.log('error:'+e)
//     }
// };
</script>
<style scoped>
.label label {
  text-align: left;

  display: inline-block;
  width: 100px; /* same width for all labels */
  font-weight: bold;
}

.value {
  font-style: italic;
  flex: 1;
}
</style>
