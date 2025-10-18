<template>
  <div class="card flex justify-center">
    <button class="btn btn-primary" label="Show" @click="visible = true">Add Recipe</button>
    <Dialog
      class="col-xxl-4 col-lg-6 col-md-8 col-sm-10 col-12"
      v-model:visible="visible"
      modal
      header="Insert Recipe"
    >
      <div class="content">
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="title" class="font-semibold w-24">Title:</label>
          <InputText v-model="recipe.title" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="author" class="font-semibold w-24">Author:</label>
          <InputText v-model="recipe.author" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="category" class="font-semibold w-24">Category:</label>
          <InputText v-model="recipe.category" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="difficulty" class="font-semibold w-24">Difficulty:</label>
          <InputText v-model="recipe.difficulty" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="instruction" class="font-semibold w-24">Instruction:</label>
          <InputText v-model="recipe.instruction" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="description" class="font-semibold w-24">Description:</label>
          <InputText v-model="recipe.description" class="value" autocomplete="off" />
        </div>
        <div
          class="label d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3"
        >
          <label for="prepTime" class="font-semibold w-24">Prepare Time:</label>
          <InputText v-model="recipe.prepTime" class="value" autocomplete="off" />
        </div>

        <div
          class="label d-flex justify-content-between align-items-start flex-column flex-sm-row mb-3"
        >
          <label for="ingredients" class="font-semibold w-24 mt-2">Ingredients:</label>

          <div class="value d-flex flex-column w-100">
            <InputText
              v-model="newIngredient"
              placeholder="Enter an ingredient"
              class="me-2 flex-grow-1"
              @keyup.enter="addIngredient"
            />
            <Button class="mt-2" label="Add" @click="addIngredient" />

            <ul class="list-unstyled ms-2">
              <li
                v-for="(item, index) in recipe.ingredients"
                :key="index"
                class="d-flex justify-content-between mt-2 mb-1 d-flex align-items-center"
              >
                <span>{{ item }}</span>
                <Button label="Danger" severity="danger" raised @click="removeIngredient(index)" />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <button
        class="btn btn-secondary me-2"
        type="button"
        label="Cancel"
        severity="secondary"
        @click="visible = false"
      >
        Cancel
      </button>
      <button class="btn btn-primary" type="button" label="Save" @click="saveRecipe">Upload</button>
    </Dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

import { auth, db, functions } from '@/firebase'
import Select from 'primevue/select'

import { sanitizePlainText } from '@/security/sanitize'
import { useUserStore } from '@/store/user'
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'

const emit = defineEmits(['recipeSaved'])


// emulator

const userStore = useUserStore()
const visible = ref(false)

const newIngredient = ref('')

function addIngredient() {
  if (newIngredient.value.trim()) {
    recipe.value.ingredients.push(newIngredient.value.trim())
    newIngredient.value = ''
  }
}

function removeIngredient(index) {
  recipe.value.ingredients.splice(index, 1)
}

const recipe = ref({
  title: '',
  author: '',
  category: '',
  ingredients: [],
  difficulty: '',
  instruction: '',
  description: '',
  prepTime: '',
})

const resetReciptValue = () => {
  recipe.value.title = ''
  recipe.value.author = ''
  recipe.value.description = ''
  recipe.value.prepTime = ''
}

onMounted(async () => {
  if (!userStore.isAdmin) {
    return
  }
})

const saveRecipe = async () => {
  try {
    const payload = {
      title: sanitizePlainText(recipe.value.title, 50),
      author: sanitizePlainText(recipe.value.author, 20),
      category: sanitizePlainText(recipe.value.author, 20),
      difficulty: recipe.value.difficulty,
      instruction: sanitizePlainText(recipe.value.instruction, 250),
      description: sanitizePlainText(recipe.value.description, 250),
      prepTime: sanitizePlainText(recipe.value.prepTime, 20),
      ingredients: recipe.value.ingredients,
      isAdmin: userStore.isAdmin
    }

    for (const [key, value] of Object.entries(payload)) {
      // For latitude/longitude, check for NaN specifically
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (typeof value === 'number' && isNaN(value))
      ) {
        alert(`Field "${key}" cannot be empty or invalid.`)
        return
      }
    }
    
    console.log(payload)
    const call = httpsCallable(functions, 'saveRecipe')
    const result = await call(payload)
    // console.log(result.data)

    visible.value = false
    emit('recipeSaved')
  } catch (e) {
    console.log('error:' + e)
  }
}
</script>

<style scoped>
.label label {
  text-align: left;

  display: inline-block;
  width: 100px; /* same width for all labels */
  font-weight: bold;
}

.value {
  font-style: italic;
  flex: 1;
}
</style>
