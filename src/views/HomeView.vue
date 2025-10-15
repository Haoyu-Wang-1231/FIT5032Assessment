<template>
  <div>Welcome to General Nutrition Educator</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { auth, functions } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'

import { useUserStore } from '@/store/user'
import { DataTable, Column } from 'primevue'
import { toJsDate, formatYMDHMS } from '@/utils/datetime'

function waitforAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off()
      resolve(u)
    })
  })
}

onMounted(async () => {
  const user = await waitforAuth()
  if (user) {
    // await email()
    // await getUserInfo()
    // await loadRecipe()
  }
})
</script>

<style scoped></style>
