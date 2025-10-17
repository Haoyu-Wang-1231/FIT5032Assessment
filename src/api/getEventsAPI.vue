<template>
  <pre>{{ jsondata }}</pre>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { functions } from '@/firebase'
import { httpsCallable } from 'firebase/functions'

const jsondata = ref(null)
const error = ref(null)

onMounted(async () => {
  await getEventsAPI()
})

const getEventsAPI = async () => {
  try {
    const call = httpsCallable(functions, 'getEventsAPI')
    const result = await call()
    jsondata.value = result.data
    error.value = null
  } catch (e) {
    console.log(e)
    error.value = e
  }
}
</script>
<style scoped>


</style>