<script setup>
import { computed, onMounted, ref } from 'vue'
import { MapboxMap, MapboxMarker, MapboxPopup } from '@studiometa/vue-mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import EventMapCard from '@/components/EventMapCard.vue'

import { auth, functions } from '@/firebase'

const token = import.meta.env.VITE_MAPBOX_MAPS_API_KEY

const mapCenter = ref([144.9631, -37.8136])
const events = ref([])

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

onMounted(async () => {
  const user = await waitforAuth()
  if (user) {

    await loadEvents()
  }
})


</script>
<!-- const center = ref({ lat: -37.8136, lng: 144.9631 }) // Melbourne -->

<template>
  <div class="container">
    <div class="map-container pt-4">
      <MapboxMap
        style="height: 500px"
        :access-token="token"
        mapStyle="mapbox://styles/mapbox/streets-v12"
        :center="mapCenter"
        :zoom="12"
      >
        <MapboxMarker v-for="event in events" :lng-lat="[event.lng, event.lat]">
          <template #popup>
            <EventMapCard :event="event" />
          </template>
        </MapboxMarker>
      </MapboxMap>
    </div>
  </div>
</template>

<style scoped>
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
