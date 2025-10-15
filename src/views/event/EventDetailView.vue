<template>
  <div class="container" style="padding-top: 3%">
    <div class="background mt-3 align-items-center">
      <div class="d-flex justify-content-around pt-4">
        <div><button class="btn btn-secondary" @click="goBack">Back</button></div>
        <h1 class="eventTitle">{{ eventData.title }}</h1>
        <div>
          <button
            v-if="!registedState"
            class="btn btn-primary"
            style="width: 120px"
            @click="registerStateChange(true)"
          >
            Register
          </button>
          <button
            v-else
            class="btn btn-secondary"
            style="width: 120px"
            @click="registerStateChange(false)"
          >
            UnRegister
          </button>
        </div>
      </div>
      <div class="mt-3 d-flex flex-column">
        <div class="content ms-5">
          <div v-if="eventData">
            <span class="label">Organizer:</span>
            <span class="value">{{ eventData.organizer }}</span>
          </div>
          <div v-if="eventData">
            <span class="label">Category:</span>
            <span class="value">{{ eventData.category }}</span>
          </div>
          <div v-if="eventData">
            <span class="label">Description:</span>
            <span class="value">{{ eventData.description }}</span>
          </div>
          <div v-if="eventData">
            <span class="label">Event Date:</span>
            <span class="value">{{ eventData.displayDate }}</span>
          </div>
          <div v-if="eventData.subscriber">
            <span class="label">Number of subscribe:</span>
            <span class="value">{{ eventData.subscriber.length }}</span>
          </div>
        </div>
      </div>

      <div class="pb-4">
        <div class="m-5" style="height: 500px">
          <div
            id="eventMap"
            ref="mapContainer"
            style="height: 100%; width: 100%"
            class="map-container"
          ></div>
        </div>
        <!-- map -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onBeforeUnmount, watch } from 'vue'
import { auth, functions } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { useRoute, useRouter } from 'vue-router'
import { MapboxMap, MapboxMarker, MapboxPopup } from '@studiometa/vue-mapbox-gl'
import { toJsDate, formatYMDHMS } from '@/utils/datetime'
import { useUserStore } from '@/store/user'
import html2canvas from 'html2canvas'
import mapboxgl from 'mapbox-gl'

import EventMapCard from '@/components/EventMapCard.vue'

const token =
  'pk.eyJ1IjoiaGFveXV3YW5nMDMyOCIsImEiOiJjbWdlcnNyY2cwMG1iMmxvbWh3d3BxZWJ0In0.ZbK4M5WAO0u6y7O37turjg'
const route = useRoute()
const eventData = ref({})
const router = useRouter()
const registedState = ref(false)
const userStore = useUserStore()
const eid = ref('')
const mapContainer = ref(null)
let map = null

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
      eventData.value.displayDate = formatYMDHMS(toJsDate(eventData.value.date))
    } else {
      router.back()
    }

    console.log(eventData.value)
  } catch (e) {
    console.log(e)
  }
}

const registerStateChange = async (state) => {
  // console.log(state)

  const payload = { uid: userStore.uid, eid: eid.value, registerState: state }
  console.log('registerStateChange')
  console.log(payload)
  try {
    const call = httpsCallable(functions, 'userRegisterStateChange')
    const result = await call(payload)

    console.log('result:')
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

  if (state) {
    if (!map.loaded()) {
      await new Promise((resolve) => map.once('idle', resolve))
    }
    const mapElement = document.getElementById('eventMap')
    const canvas = await html2canvas(mapElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })
    const imgData = canvas.toDataURL('image/png').split(',')[1]

    console.log('register event')
    const call = httpsCallable(functions, 'sendMail')

    const payload = {
      to: userStore.email,
      subject: `${eventData.value.category} Event Registed`,
      text: `Organizer: ${eventData.value.organizer}\ndescription: ${eventData.value.description}`,
      attachments: [
        {
          filename: 'EventMap.png',
          content: imgData,
          encoding: 'base64',
        },
      ],
    }
    const result = await call(payload)
    console.log(result.data)
    // console.log(imgData)
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

// watch(location, (loc) => {
//   if (map && loc) {
//     map.flyTo({ center: loc, zoom: 13 })
//     new mapboxgl.Marker().setLngLat(loc).addTo(map)
//   }
// })

function initMap(center = [144.9631, -37.8136]) {
  mapboxgl.accessToken = token
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center,
    zoom: 12,
    preserveDrawingBuffer: true,
  })
  map.addControl(new mapboxgl.NavigationControl())

  map.on('load', () => {
    if (eventData.value.lat && eventData.value.lng) {
      const loc = [eventData.value.lng, eventData.value.lat]
      map.flyTo({ center: loc, zoom: 13 })
      new mapboxgl.Marker({ color: '#3FB1CE' }).setLngLat(loc).addTo(map)
    }
  })
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
  initMap()
})

onBeforeUnmount(() => {
  // Clean up when component unmounts
  if (map) map.remove()
})

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
}

.background {
  border-radius: 30px;
  background-color: antiquewhite;
}

.eventTitle {
  font-size: 40px;
  font-weight: bold;
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
