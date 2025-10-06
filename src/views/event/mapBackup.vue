<script setup>
import { GoogleMap, CustomMarker } from 'vue3-google-map'
import { onMounted, onBeforeUnmount, computed ,ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import EventViewCard from '@/components/EventViewCard.vue'

import { auth, functions } from '@/firebase'

const API = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const center = ref({ lat: -37.8136, lng: 144.9631 }) // Melbourne
const events = ref([])

const openId = ref(null)
const toggle = (id) => (openId.value = openId.value === id ? null : id)
const onEsc = (e) => {
  if (e.key === 'Escape') openId.value = null
}

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
    const call = httpsCallable(functions, 'getMapEvents')
    const result = await call()
    events.value = result.data
    console.log(events.value)

    // totalRows.value = events.value.length;
    // console.log('Events loaded:', events.value);
  } catch (e) {
    console.log(e)
  }
}
onBeforeUnmount(() => window.removeEventListener('keydown', onEsc))

onMounted(async () => {
  window.addEventListener('keydown', onEsc)
  const user = await waitforAuth()
  if (user) {
    // console.log('User is signed in: ', user.email)
    // await userStore.setUser(user.uid, user.email)
    // await loadRecipes()
    await loadEvents()
  }
})




const resetCenter = (newLat, newLng) => {
  center.value = { lat: newLat, lng: newLng }
}
</script>

<template>
  <div class="container">
    <div>Event Map</div>
    <div class="map-container">
      <GoogleMap
        :api-key="API"
        :center="center"
        :zoom="13"
        map-type-id="roadmap"
        style="width: 100%; height: 600px"
        @click="openId = null"
      >
        <CustomMarker
          v-for="ev in events"
          :key="ev.id"
          :options="{
            position: { lat: Number(ev.lat), lng: Number(ev.lng) },
            zIndex: openId === ev.id ? 999 : 1,
          }"
        >
          <div class="marker-wrap" @click.stop="toggle(ev.id)">
            <div class="marker-pin"></div>
            <transition name="fade-scale">
              <div v-if="openId === ev.id" class="marker-card" @click.stop>
                <EventViewCard :event="ev" />
              </div>
            </transition>
          </div>
        </CustomMarker>
      </GoogleMap>
    </div>
  </div>
</template>

<style scoped>
.marker-wrap {
  position: relative;
}

.marker-pin {
  position: relative;
  width: 18px;
  height: 18px;
  background: #ff0000;
  border: 2px solid #fff;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transform: translate(-50%, -100%);
}
.marker-pin::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #ff0000;
}

.marker-card {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.15s ease;
}
.fade-scale-enter-from {
  opacity: 0;
  transform: translate(-50%, 6px) scale(0.98);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px) scale(0.98);
}
</style>
