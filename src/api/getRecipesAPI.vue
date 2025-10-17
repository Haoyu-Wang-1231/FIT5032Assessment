<template>
  <pre>{{ jsondata }}</pre>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

const jsondata = ref(null)
const error = ref(null)

onMounted(async () => {
  await getRecipesAPI()
})

const getRecipesAPI = async () => {
  try {
    const response = await axios.get('https://getrecipesapi-jdbghckipq-ts.a.run.app')
    jsondata.value = response.data
    error.value = null
  } catch (e) {
    console.log(e)
    error.value = e
  }
}
</script>