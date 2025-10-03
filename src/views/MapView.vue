<script setup>
import { GoogleMap, AdvancedMarker } from 'vue3-google-map'
import { onMounted, ref } from 'vue'

const API = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const center = ref({ lat: -37.8136, lng: 144.9631 }) // Melbourne

onMounted(() => {
  // You can update the center dynamically if needed
  // center.value = { lat: newLat, lng: newLng };
})
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
      >
      </GoogleMap>
    </div>
  </div>
</template>
