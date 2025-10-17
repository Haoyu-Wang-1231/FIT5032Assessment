<template>
  <div class="container d-flex justify-content-center" style="padding-top: 3%">
    <div class="col-xxl-12 col-lg-12 col-md-12 col-sm-12 col-12 background">
      <h1 class="mapTitle mt-5 text-center">Map</h1>
      <div class="content m-5">
        <div class="map-container pt-4" style="height: 500px">
          <div
            id="eventMap"
            ref="mapContainer"
            style="height: 100%; width: 100%"
            class="map-container"
          ></div>
        </div>
      </div>
    </div>
  </div>

  <div class="container"></div>
</template>

<script setup>
import { computed, onMounted, ref, createApp } from 'vue'
import {
  MapboxMap,
  MapboxMarker,
  MapboxPopup,
  MapboxGeolocateControl,
} from '@studiometa/vue-mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import EventMapCard from '@/components/EventMapCard.vue'
import mapboxgl from 'mapbox-gl'
import { RouterLink, routerViewLocationKey, useRoute, useRouter } from 'vue-router'

import { auth, functions } from '@/firebase'
const router = useRouter()

const token = import.meta.env.VITE_MAPBOX_MAPS_API_KEY

const mapCenter = ref([144.9631, -37.8136])
const events = ref([])
const userLocation = ref({})

const mapContainer = ref(null)
let map = null

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

async function navigateTo(destLng, destLat) {
  if (!userLocation.value.lng || !userLocation.value.lat) {
    alert('Geolocation not supported')
    return
  }

  const start = `${userLocation.value.lng},${userLocation.value.lat}`
  const end = `${destLng},${destLat}`
  const profile = 'driving'

  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start};${end}?geometries=geojson&access_token=${token}`

  //   console.log(start)
  //   console.log(end)

  try {
    // return
    const response = await fetch(url)
    const data = await response.json()
    if (!data || !data.routes || data.routes.length === 0) {
      console.error('No route found.', data)
      return
    }

    const route = data.routes[0].geometry

    // remove existed route
    if (map.getSource('route')) {
      map.removeLayer('route')
      map.removeSource('route')
    }

    // add route
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route,
      },
    })

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#2563eb', // Use your accent color for the route
        'line-width': 6,
        'line-opacity': 0.8,
      },
    })

    const coordinates = route.coordinates
    const bounds = coordinates.reduce(
      (bounds, coord) => {
        return bounds.extend(coord)
      },
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
    )

    map.fitBounds(bounds, {
      padding: 75, // Add padding around the route
    })
  } catch (err) {
    console.log(err)
  }
}

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

  const geolocationControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    showUserLocation: true,
    trackUserLocation: true,
    showUserHeading: true,
  })
  map.addControl(geolocationControl)

  geolocationControl.on('geolocate', (e) => {
    console.log('load user location')
    if (!e.coords) {
      const pos = geolocationControl._lastKnownPosition
      if (!pos) {
        console.warn('no location provided')
        return
      }
      const { longitude, latitude } = pos.coords
      userLocation.value = { lng: longitude, lat: latitude }
    } else {
      const { longitude, latitude } = e.coords
      userLocation.value = { lng: longitude, lat: latitude }
    }
    // if (!e.coords) {
    //   console.warn(
    //     'Geolocation event fired without coordinates (e.coords is undefined/null). Skipping update.',
    //   )
    //   return // Stop execution of the handler immediately
    // }
  })

  map.on('load', () => {
    events.value.map((record) => {
      if (record.lat && record.lng) {
        const loc = [record.lng, record.lat]

        const popupContent = document.createElement('div')
        const popupApp = createApp(EventMapCard, { event: record, onNavigate: navigateTo })
        popupApp.use(router)
        popupApp.mount(popupContent)

        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
        }).setDOMContent(popupContent).on('close', ()=>{
          popupApp.unmount()
          popupContent.remove()
        })

        new mapboxgl.Marker({ color: '#3FB1CE' }).setLngLat(loc).setPopup(popup).addTo(map)
      }
    })
  })
}

onMounted(async () => {
  const user = await waitforAuth()

  await loadEvents()
  initMap()
})
</script>
<!-- const center = ref({ lat: -37.8136, lng: 144.9631 }) // Melbourne -->

<style scoped>
.background {
  border-radius: 30px;
  background-color: antiquewhite;
}

.mapTitle {
  font-size: 60px;
  font-weight: bold;
}

.map-container {
  height: 100%;
  width: 100%;
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
