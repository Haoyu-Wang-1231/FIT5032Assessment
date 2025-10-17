<template>
  <div class="container d-flex justify-content-center" style="padding-top: 3%">
    <div class="col-xxl-12 col-lg-12 col-md-12 col-sm-12 col-12 background">
      <h1 class="homeTitle mt-5 text-center">Welcome to General Nutrition Educator</h1>
      <div class="content ms-5">
        <div class="mt-4">
          <div class="value ms-5 ">We provide the Reciepes and help you to join the Events</div>
          <div class="value ms-5 mb-5">You can view the recipes and view others' comments and use GenAI to analyze it</div>
        </div>
      </div>
    </div>
  </div>
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

<style scoped>
.background {
  border-radius: 30px;
  background-color: antiquewhite;
}

.homeTitle {
  font-size: 60px;
  font-weight: bold;
}

.content {
  font-size: 20px;
  font-style: italic;
  flex: 1;
}

</style>
<!-- 
{
  "title": "Vegetable Stir-Fry",
  "category": "lecture",
  "description": "Crisp veggies in a simple soy-garlic sauce for a quick and nutritious meal.",
  "instruction": "Stir-fry vegetables in hot oil for 5 6 minutes, add sauce, and cook until thickened.",
  "ingredients": [
    "Broccoli", "Soy sauce"
  ],
  "prepTime": "10 mins",
  "cook_time": "10 mins",
  "difficulty": "Easy",
} -->