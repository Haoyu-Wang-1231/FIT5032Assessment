<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { db, auth, functions } from '@/firebase'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import DataView from 'primevue/dataview'

import CommentDialog from '@/components/commentDialog.vue'
import AddRecipeDialog from '@/components/AddRecipeDialog.vue'

const recipes = ref([])
const userStore = useUserStore()
const { isSignedIn, isAdmin, role, email, loading } = storeToRefs(userStore)

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

// const deleteRecipe = async(recipeId) => {
//     if(userStore.role !== 'admin'){
//         return
//     }

//     try{
//         // console.log(recipeId)
//         await deleteDoc(doc(db, 'recipe', recipeId))
//         console.log("Delete: " +recipeId)
//     }catch(error){
//         console.log(error)
//     }
//     window.location.reload()
// }
</script>

<template>
  <div class="container d-flex justify-content-center" style="padding-top: 5%; padding-bottom: 5%">
    <div
      class="col-xxl-12 col-lg-12 col-md-12 col-sm-12 col-10 background"
      style="padding-bottom: 5%"
    >
      <h1 class="mt-5 text-center">Nutrition Recipes</h1>

      <!-- <div>
                <div v-for="(card, index) in recipes" :key="index" class="card m-3">
                    <div class="card-header d-flex justify-content-between flex-column flex-sm-row">
                        <div>
                            {{ card.title }}
                        </div>
                        <div v-if="userStore.role === 'admin'">
                            <button class="btn btn-danger" @click="deleteRecipe(card.id)">remove recipe</button>
                        </div>

                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Author: {{ card.author }}</li>
                        <li class="list-group-item d-flex justify-content-between gap-2 flex-column flex-sm-row">
                            <div>
                                rating: {{ card.rating ? card.rating : "no rating" }} ({{ card.ratingNum ? card.ratingNum : 0
                                }} reviews)
                            </div>
                            <CommentDialog :recipe="card.title" :recipe-id="card.id"/>


                        </li>
                        <li class="list-group-item">prepare time: {{ card.prepTime }}</li>
                        <li class="list-group-item">description: {{ card.description }}</li>
                    </ul>
                </div>

            </div> -->

      <DataView class="m-3" :value="recipes" paginator :rows="10" :rowsPerPageOptions="[5, 10, 15]">
        <template #list="slotProps">
          <div
            v-for="card in slotProps.items"
            :key="card.id"
            class="background flex align-items-center border-bottom-1 surface-border"
          >
            <div class="card">
              <div class="card-header d-flex justify-content-between flex-column flex-sm-row">
                <div>
                  {{ card.title }}
                </div>
                <div v-if="userStore.role === 'admin'">
                  <button class="btn btn-danger" @click="deleteRecipe(card.id)">
                    remove recipe
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
                  <CommentDialog :recipe="card.title" :recipe-id="card.id" />
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
        <AddRecipeDialog @recipeSaved="reloadReciepes" v-if="userStore.role === 'admin'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.background {
      padding: 16px;

  border-radius: 30px;
  background-clip: content-box;
  background-color: antiquewhite;
}

</style>
