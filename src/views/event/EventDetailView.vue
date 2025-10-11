<template>
  <div class="container" style="padding-top: 3%">
    <div class="background mt-3 align-items-center">
      <div class="d-flex justify-content-around pt-4">
        <div><button class="btn btn-secondary" @click="goBack">Back</button></div>
        <h1>{{ eventData.title }}</h1>
        <div>
          <button v-if="!registedState" class="btn btn-primary" style="width: 120px" @click="registerStateChange(true)">
            Register
          </button>
          <button v-else class="btn btn-secondary" style="width: 120px" @click="registerStateChange(false)">UnRegister</button>
        </div>
      </div>
      <div class="mt-3 d-flex flex-column align-items-center">
        <div>
          <div v-if="eventData.organizer">organizer: {{ eventData.organizer }}</div>
          <div v-if="eventData.category">category: {{ eventData.category }}</div>

          <div v-if="eventData.description">description: {{ eventData.description }}</div>
          <div v-if="eventDate">eventDate: {{ eventDate }}</div>
          <div v-if="eventData.subscriber">
            Number of subscribe: {{ eventData.subscriber.length }}
          </div>
        </div>

        <!-- content -->
      </div>

      <div class="pb-4">
        <div class="m-5">
          <!-- <MapboxMap
            style="height: 400px"
            :access-token="token"
            mapStyle="mapbox://styles/mapbox/streets-v12"
            :center="location"
            :zoom="12"
          >
            <MapboxMarker :lng-lat="location" />
          </MapboxMap> -->
        </div>
        <!-- map -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { auth, functions } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { useRoute, useRouter } from 'vue-router'
import { MapboxMap, MapboxMarker, MapboxPopup } from '@studiometa/vue-mapbox-gl'
import { toJsDate, formatYMDHMS } from '@/utils/datetime'
import { useUserStore } from '@/store/user'

import EventMapCard from '@/components/EventMapCard.vue'

const token = import.meta.env.VITE_MAPBOX_MAPS_API_KEY
const route = useRoute()
const eventData = ref({})
const router = useRouter()
const registedState = ref(false)
const userStore = useUserStore()
const eid = ref('')

// const mapCenter = ref([144.9631, -37.8136])
const location = computed(() => {
  const lat = eventData.value.lat ?? null
  const lng = eventData.value.lng ?? null
  return [lng, lat]
})

const eventDate = computed(() => {
  const time = formatYMDHMS(toJsDate(eventData.value.date)) ?? null

  return time
})

function getEid(r = route) {
  eid.value = r.params.id
  // return String(r.params.id ?? '')
}

function waitforAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off()
      resolve(u)
    })
  })
}



async function loadEvent() {
  try {
    // console.log('event: '+ eid)

    const call = httpsCallable(functions, 'getEventById')
    const payload = { eventId: eid.value }
    console.log(payload)
    const result = await call(payload)
    if (result.data.exists) {
      eventData.value = result.data.event
    } else {
      router.back()
    }

    console.log(eventData.value)
  } catch (e) {
    console.log(e)
  }
}


const registerStateChange = async(state)=>{
  // console.log(state)

  const payload = {uid: userStore.uid, eid: eid.value, registerState: state}
  console.log("registerStateChange")
  console.log(payload)
  try {
    const call = httpsCallable(functions, 'userRegisterStateChange')
    const result = await call(payload)

    console.log("result:")
    console.log(result.data.newDoc)
    const registerList = result.data.newDoc.registedEvent
    if (registerList.includes(eid.value)) {
      registedState.value = true
    } else {
      registedState.value = false
    }
  } catch (e) {
    console.log(e)
  }
}



const getUserInfo = async () => {
  try {
    const call = httpsCallable(functions, 'getUserInfo')
    const result = await call(userStore.id)

    const registerList = result.data.profile.registedEvent
    console.log('uid:', eid.value)

    console.log(registerList)
    if (registerList.includes(eid.value)) {
      registedState.value = true
    } else {
      registedState.value = false
    }
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const user = await waitforAuth()
  getEid()
  if (user) {
    // console.log('User is signed in: ', user.email)
    // await userStore.setUser(user.uid, user.email)
    // await loadRecipes()
    
    await loadEvent()
    await getUserInfo()
  }
})

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.background {
  border-radius: 30px;
  background-color: antiquewhite;
}

:deep(.mapboxgl-popup-content) {
  background: transparent !important;
  box-shadow: none !important;
  border: 0 !important;
  border-radius: 0 !important;
  padding: 0 !important;
  position: relative;
  width: 280px;
}

:deep(.mapboxgl-popup-tip) {
  display: none !important;
}

:deep(.mapboxgl-popup-close-button) {
  position: absolute;
  top: 10px !important;
  right: 5px !important;
  color: #94a3b8;
  line-height: 1;
  font-size: 30px !important;
  border-radius: 999px;
  background: transparent;
}
</style>
