<template>
  <div>welcome to event</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { auth, functions } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { useRoute } from 'vue-router'

const route = useRoute()
const eventData = ref(null)

function getEid(r = route) {
  return String(r.params.id ?? '')
}

function waitforAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off()
      resolve(u)
    })
  })
}

async function loadEvent(eid) {
  try {
    // console.log('event: '+ eid)

    const call = httpsCallable(functions, 'getEventById')
    const payload = { eventId: eid }
    console.log(payload)
    const result = await call(payload)
    eventData.value = result.data

    console.log(eventData.value)
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const user = await waitforAuth()
  if (user) {
    // console.log('User is signed in: ', user.email)
    // await userStore.setUser(user.uid, user.email)
    // await loadRecipes()
    await loadEvent(getEid())
  }
})
</script>
