<template>
  <div class="card flex justify-center">
    <button class="btn btn-primary" label="Show" @click="visible = true">Add Event</button>
    <Dialog
      class="col-xxl-4 col-lg-6 col-md-8 col-sm-10 col-12"
      v-model:visible="visible"
      modal
      header="Add Events"
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
            v-model="event.date"
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
          <InputText v-model="event.latitude" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="username" class="font-semibold w-24">longitude: </label>
          <InputText v-model="event.longitude" class="value" autocomplete="off" />
        </div>
        <button class="btn btn-primary" type="button" label="Save" @click="saveEvent">
          Upload
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

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




const userStore = useUserStore()
const visible = ref(false)

const event = ref({
  title: '',
  organizer: '',
  category: '',
  description: '',
  date: null,
  latitude: '',
  longitude: '',
})
onMounted(async () => {
  if (!userStore.isAdmin) {
    return
  }
})

const saveEvent = async () => {
  if (!event.value.date || isNaN(new Date(event.value.date).getTime())) {
    alert('Please provide a valid date.')
    return
  }

  try {
    const payload = {
      title: sanitizePlainText(event.value.title, 50),
      organizer: sanitizePlainText(event.value.organizer, 50),
      category: sanitizePlainText(event.value.category, 50),
      description: sanitizePlainText(event.value.description, 50),
      date: event.value.date,
      lat: parseFloat(event.value.latitude),
      lng: parseFloat(event.value.longitude),
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
    if (payload.lat > 90 || payload.lat < -90) {
      alert('Latitude must be between -90 and 90.')
      return
    }
    if (payload.lng > 180 || payload.lng < -180) {
      alert('Longitude must be between -180 and 180.')
      return
    }
    console.log(payload)

    const call = httpsCallable(functions, 'saveEvent')
    const result = await call(payload)
    console.log(result.data)

    // const call = httpsCallable(functions, 'getEvents')
    // const result = await call()
    // console.log(payload)
    visible.value=false
    emit('eventSaved');
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
