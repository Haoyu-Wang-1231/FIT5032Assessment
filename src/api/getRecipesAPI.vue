<template>
  <pre>{{ jsondata }}</pre>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { functions } from '@/firebase'
import { httpsCallable } from 'firebase/functions'

const jsondata = ref(null)
const error = ref(null)

onMounted(async () => {
  await getRecipesAPI()
})

const getRecipesAPI = async () => {
  try {
    const call = httpsCallable(functions, 'getRecipesAPI')
    const result = await call()
    jsondata.value = result.data
    error.value = null
  } catch (e) {
    console.log(e)
    error.value = e
  }
}
</script>
