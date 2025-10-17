<template>
  <div class="container d-flex justify-content-center" style="padding-top: 5%; padding-bottom: 5%">
    <div
      class="col-xxl-12 col-lg-12 col-md-12 col-sm-12 col-10 background"
      style="padding-bottom: 5%"
    >
      <div class="d-flex justify-content-around align-items-center flex-column flex-sm-row">
        <div></div>
        <h1 class="mt-5 text-center">Nutrition Recipes</h1>
        
        <div>
          <button @click="exportCSV" class="btn btn-primary mt-5">Export to CSV</button>
        </div>
      </div>
      <DataView class="m-3" :value="recipes" paginator :rows="10" :rowsPerPageOptions="[5, 10, 15]">
        <template #list="slotProps">
          <div
            v-for="card in slotProps.items"
            :key="card.id"
            class="background flex align-items-center border-bottom-1 surface-border"
          >
            <div class="card">
              <div class="card-header d-flex justify-content-between p-2 flex-column flex-sm-row">
                <div class="p-2">
                  {{ card.title }}
                </div>
                <div class="p-2">
                  <button class="btn btn-primary" @click="goDetail(card.id)">Detail</button>
                  <button v-if="userStore.role === 'admin'" class="btn btn-danger ms-2" @click="deleteRecipe(card.id)">
                    remove
                  </button>
                </div>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">Author: {{ card.author }}</li>
                <li
                  class="list-group-item d-flex justify-content-between gap-2 flex-column flex-sm-row"
                >
                  <div>
                    rating: {{ card.rating ? card.rating : 'no rating' }} ({{
                      card.ratingNum ? card.ratingNum : 0
                    }}
                    reviews)
                  </div>
                  <!-- <CommentDialog :recipe="card.title" :recipe-id="card.id" /> -->
                </li>
                <li class="list-group-item">prepare time: {{ card.prepTime }}</li>
                <li class="list-group-item">description: {{ card.description }}</li>
              </ul>
            </div>
          </div>
        </template>
      </DataView>

      <div class="d-flex justify-content-center">
        <!-- <button v-if="userStore.role === 'admin'" class="btn btn-primary">Add Recipes</button> -->
        <AddRecipeDialog class="mb-3" @recipeSaved="reloadReciepes" v-if="userStore.role === 'admin'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { db, auth, functions } from '@/firebase'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
// import DataView from 'primevue/dataview'
import { DataTable,DataView, Column, Select } from 'primevue'

import CommentDialog from '@/components/dialog/commentDialog.vue'
import AddRecipeDialog from '@/components/dialog/AddRecipeDialog.vue'
import { average } from 'firebase/firestore'
const searchType = ref('')

const selections = ref([
  { name: 'title' },
  { name: 'organizer' },
  { name: 'Category' },
  { name: 'description' },
])


const recipes = ref([])
const userStore = useUserStore()
const router = useRouter()

const { isSignedIn, isAdmin, role, email, loading } = storeToRefs(userStore)


const exportCSV = ()=>{
  const data = recipes.value.map(recipe => ({
    title: recipe.title,
    author: recipe.author,
    description: recipe.description,
    instruction: recipe.instruction,
    average_rating: recipe.rating,
    rating: recipe.ratingNum
  }))

  const csvContent = convertToCSV(data)
  const blob = new Blob([csvContent], [{type: 'text/csv;charset=utf-8'}])
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'export_data.csv')
  link.click()

}

const convertToCSV= (data)=>{
  const headers = Object.keys(data[0])
  const rows = data.map(obj=> headers.map(header =>obj[header]))
  const headerRow = headers.join(',')
  const csvRows = [headerRow, ...rows.map(row=> row.join(','))]
  return csvRows.join('\n')

}


const goDetail = (input) => {
  console.log(input)
  router.push({ name: 'RecipeDetail', params: { id: input } })
}

function waitForAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off()
      resolve(u)
    })
  })
}

async function loadRecipes() {
  try {
    const call = httpsCallable(functions, 'getRecipes')
    const result = await call()
    recipes.value = result.data
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const user = await waitForAuth()
  if (user) {
    console.log('User is signed in: ', user.email)
    // await userStore.setUser(user.uid, user.email)
    await loadRecipes()
  }
})

const reloadReciepes = async () => {
  await loadRecipes()
}

const deleteRecipe = async (recipeId) => {
  try {
    // console.log(recipeId)
    const payload = { id: recipeId }

    const call = httpsCallable(functions, 'deleteRecipe')
    const result = await call(payload)
    console.log(result.data)
  } catch (error) {
    console.log(error)
  }
  reloadReciepes()
}
</script>

<style scoped>
.background {
  padding: 16px;

  border-radius: 30px;
  background-clip: content-box;
  background-color: antiquewhite;
}
</style>
