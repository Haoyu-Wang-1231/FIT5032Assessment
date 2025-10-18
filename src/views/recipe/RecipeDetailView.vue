<template>
  <div>
    <div id="pdfContent" v-if="showPDF" class="card p-4 shadow">
      <h1>{{ recipe.title }}</h1>
      <p><b>Author:</b> {{ recipe.author }}</p>
      <p><b>average rating:</b> {{ recipe.ratingAvg }}</p>
      <p><b>rating count:</b> {{ recipe.ratingCount }}</p>

      <p><b>Difficulty:</b> {{ recipe.difficulty }}</p>
      <div>
        <b>Ingredients:</b>
        <ul class="value">
          <li v-for="(item, index) in recipe.ingredients" :key="index">{{ item }}</li>
        </ul>
      </div>

      <p><b>Description:</b> {{ recipe.description }}</p>
      <p><b>Instruction:</b> {{ recipe.instruction }}</p>
      <div v-if="AIAnlayze"><b>AI analyze:</b> {{ AIAnlayze }}</div>
    </div>

    <div class="container d-flex justify-content-center" style="padding-top: 3%">
      <div v-if="initLoad" class="col-xxl-12 col-lg-12 col-md-12 col-sm-12 col-12 background">
        <div class="title d-flex justify-content-around pt-4">
          <div><button class="btn btn-secondary" @click="goBack">Back</button></div>

          <h1>{{ recipe.title }}</h1>
          <div>
            <button class="btn btn-primary me-2" @click="exportRecipe">Export</button>
            <button
              v-if="!favourState"
              class="btn btn-primary"
              style="width: 120px"
              @click="favourStateChange(true)"
            >
              Favour
            </button>
            <button
              v-else
              class="btn btn-secondary"
              style="width: 120px"
              @click="favourStateChange(true)"
            >
              Unfavour
            </button>
            <!-- <button v-else class="btn btn-secondary" style="width: 120px" @click="registerStateChange(false)">UnRegister</button> -->
          </div>
        </div>
        <div class="ms-5 mt-3">
          <div v-if="recipe.author">
            <span class="label">Author:</span>
            <span class="value">{{ recipe.author }}</span>
          </div>
          <div v-if="recipe.difficulty">
            <span class="label">difficulty:</span>
            <span class="value">{{ recipe.difficulty }}</span>
          </div>
          <div v-if="recipe.author">
            <span class="label">AVG Rate:</span>
            <span class="value">{{ recipe.ratingAvg }}</span>
          </div>
          <div class="mt-3" v-if="recipe.ingredients">
            <span class="label">Ingredients:</span>
            <ul class="value">
              <li v-for="(item, index) in recipe.ingredients" :key="index">{{ item }}</li>
            </ul>

            <!-- <span class="label">Description:</span>
          <div class="value">{{ recipe.description }}</div> -->
          </div>
          <div class="mt-3" v-if="recipe.author">
            <span class="label">Description:</span>
            <div class="value">{{ recipe.description }}</div>
          </div>

          <div class="mt-3" v-if="recipe.author">
            <span class="label">Instruction:</span>
            <div class="value">{{ recipe.instruction }}</div>
          </div>
          <div class="mt-3" v-if="AIAnlayze">
            <span class="label">AI analyze:</span>
            <div class="value">{{ AIAnlayze }}</div>
          </div>

          <!-- <div v-if="recipe"></div> -->
        </div>
        <div class="d-flex justify-content-center mt-3 mb-3">
          <button class="btn btn-primary" @click="recipeGenAIAnalyze">Ask for AI</button>

          <div class="ms-5" v-if="recipe" style="width: 120px">
            <CommentDialog @rating="loadRecipe" :recipe="recipe.title" :recipe-id="recipe.id" />
          </div>
        </div>

        <div class="comments" v-if="comments.length > 0">
          <div class="commentTitle ms-5">Comments:</div>

          <DataTable
            :value="comments"
            class="m-3"
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20]"
          >
            <Column field="username" header="username"></Column>
            <Column field="description" header="description"></Column>
            <Column field="rating" header="rating"></Column>
            <Column field="createTime" header="Post Time"></Column>
            <Column header="Delete">
              <template #body="{ data }">
                <button
                  v-if="userStore.isAdmin || data.poster === userStore.uid"
                  class="btn btn-danger ms-4"
                  @click="removeComment(data)"
                  severity="secondary"
                  rounded
                >
                  Delete
                </button></template
              >
            </Column>
            <!-- createTime -->
          </DataTable>
        </div>
      </div>
      <div v-else class="col-xxl-12 col-lg-12 col-md-12 col-sm-12 col-12 background">
        <h1>Loading</h1>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { auth, functions } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { useRoute, useRouter } from 'vue-router'
import { MapboxMap, MapboxMarker, MapboxPopup } from '@studiometa/vue-mapbox-gl'
import { toJsDate, formatYMDHMS } from '@/utils/datetime'
import { useUserStore } from '@/store/user'
import { DataTable, Column } from 'primevue'
import CommentDialog from '@/components/dialog/commentDialog.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const initLoad = ref(false)
const route = useRoute()
const rid = ref('')
const recipe = ref({})
const comments = ref([])
const router = useRouter()
const userStore = useUserStore()
const favourState = ref(false)
const showPDF = ref(false)
const AIAnlayze = ref(null)

function getRid(r = route) {
  rid.value = r.params.id
  // return String(r.params.id ?? '')
}

const formatRecipeToString = (input) => {
  let text = `Recipe Title: ${input.title}.\n`

  // Include the description, instructions, and ingredients for best analysis
  if (input.description) text += `Description: ${input.description}\n`
  if (input.instruction) text += `Instructions: ${input.instruction}\n`
  if (input.ingredients && input.ingredients.length > 0) {
    text += `Ingredients: ${input.ingredients.join(', ')}\n`
  }

  // Optional: Include time/difficulty if you think it adds context
  text += `Prep Time: ${input.prepTime}, Difficulty: ${input.difficulty}`

  return text
}

const recipeGenAIAnalyze = async () => {
  try {
    const call = httpsCallable(functions, 'analyzeRecipe')
    const payload = { recipe: formatRecipeToString(recipe.value) }
    // const payload = { rid: rid.value, comment: input }
    // const result = await call(payload)
    const result = await call(payload)
    console.log(result.data)

    AIAnlayze.value = result.data.nutritionData.overallEvaluation
  } catch (err) {
    console.log(err)
  }
}

const removeComment = async (input) => {
  console.log(input)

  try {
    const call = httpsCallable(functions, 'removeComment')
    const payload = { rid: rid.value, comment: input }
    const result = await call(payload)
    console.log(result.data)
    await loadRecipe()
  } catch (err) {
    console.log(err)
  }
}

// export recipe data pdf
const exportRecipe = async () => {
  showPDF.value = true
  await nextTick()

  const content = document.getElementById('pdfContent')
  if (!content) {
    console.error(' pdfContent not found in DOM')
    return
  }
  try {
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')

    if (!imgData.startsWith('data:image/png;base64,')) {
      throw new Error('Invalid image data returned from html2canvas')
    }
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${recipe.title}.pdf`)
  } catch (err) {
    console.log(err)
  }
  showPDF.value = false
}

const favourStateChange = async (state) => {
  const payload = { uid: userStore.uid, rid: rid.value, favourState: state }
  console.log('FavourStateChange')
  console.log(payload)
  try {
    const call = httpsCallable(functions, 'userFavourStateChange')
    const result = await call(payload)
    const favourList = result.data.newDoc.favourRecipe
    if (favourList.includes(rid.value)) {
      favourState.value = true
    } else {
      favourState.value = false
    }
  } catch (e) {
    console.log(e)
  }
}

function waitforAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off()
      resolve(u)
    })
  })
}

const loadCommentPoster = async (list) => {
  try {
    // getUsernamesByIds
    const call = httpsCallable(functions, 'getUsernamesByIds')
    const payload = { idList: list }
    const result = await call(payload)
    const usernameList = result.data.usernames

    // // create a quick lookup dictionary for usernames
    const usernameMap = Object.fromEntries(usernameList.map((u) => [u.id, u.username]))

    comments.value = comments.value.map((c) => ({
      ...c,
      username: usernameMap[c.poster] || 'Unknown',
    }))

    console.log(result.data)
  } catch (err) {
    console.log(err)
  }
}

const loadRecipe = async () => {
  try {
    const call = httpsCallable(functions, 'getRecipeById')
    const payload = { id: rid.value }
    const result = await call(payload)
    recipe.value = result.data
    comments.value = recipe.value.comments

    comments.value.map((record) => {
      record.createTime = formatYMDHMS(toJsDate(record.createdAt))
    })
    const commentPosters = comments.value.map((record) => {
      return record.poster
    })
    // getUsernamesByIds
    await loadCommentPoster(commentPosters)
  } catch (err) {
    console.log(err)
  }
}

const getUserInfo = async () => {
  try {
    const call = httpsCallable(functions, 'getUserInfo')
    const result = await call(userStore.id)
    const favourList = result.data.profile.favourRecipe
    if (favourList.includes(rid.value)) {
      favourState.value = true
    } else {
      favourState.value = false
    }
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const user = await waitforAuth()
  getRid()
  if (user) {
    await getUserInfo()
    await loadRecipe()
  }
  initLoad.value = true
})

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.background {
  border-radius: 30px;
  background-color: antiquewhite;
}

.label {
  display: inline-block;
  width: 100px; /* same width for all labels */
  font-weight: bold;
}

.value {
  font-style: italic;

  flex: 1;
}

.commentTitle {
  font-size: 20px;
  font-weight: bold;
  font-style: italic;
}
</style>
