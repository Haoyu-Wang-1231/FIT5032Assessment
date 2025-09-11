<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router';
import { db } from '@/firebase'
import { useUserStore } from '@/store/user';



import {
    collection,
    addDoc,
    onSnapshot,
    query,
    serverTimestamp,
    where,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
} from 'firebase/firestore'
import { onMounted } from 'vue';
import CommentDialog from '@/components/commentDialog.vue';
import AddRecipeDialog from '@/components/AddRecipeDialog.vue';

const recipes = ref([])
const userStore = useUserStore()


const recipesCollection = collection(db, 'recipe')
// const commentsCollection = collection(db, 'recipe/{recipleId/comment}')


const loadrating = async (recipeId) => {
    const q = query(collection(db, 'recipe', recipeId, 'comment'))
    let sum = 0
    let count = 0

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(d => {
        const r = d.data().rating
        if (typeof r === 'number') {
            sum += r
            count += 1
        }
    })


    return { avg: count ? +(sum / count).toFixed(1) : 0, count: count ? count : 0 }

}


const recipesNotesListener = async () => {
    const q = query(recipesCollection)
    const querySnapshot = await getDocs(q);
    const rows = await Promise.all(
        querySnapshot.docs.map(async (d) => {
            const rate = await loadrating(d.id)
            const rating = rate.avg
            const ratingNum = rate.count

            return { id: d.id, ...d.data(), rating, ratingNum }
        })
    )
    recipes.value = rows
    console.log("recipesNotesListener", recipes)
}

onMounted(() => {
    recipesNotesListener()
    console.log("load data")
    console.log(recipes)
    console.log('Recipe View Mounted');
})

const deleteRecipe = async(recipeId) => {
    if(userStore.role !== 'admin'){
        return
    }
    
    try{
        // console.log(recipeId)
        await deleteDoc(doc(db, 'recipe', recipeId))
        console.log("Delete: " +recipeId)
    }catch(error){
        console.log(error)
    }
}

</script>

<template>
    <div class="container d-flex justify-content-center" style="padding-top: 5%; padding-bottom: 5%;">
        <div class="col-xxl-12 col-lg-12 col-md-12 col-sm-12 col-10 background" style="padding-bottom: 5%;">
            <h1 class="mt-5 text-center">Nutrition Recipes</h1>
            <div>
                <div v-for="(card, index) in recipes" :key="index" class="card m-5">
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
                            <!-- <button type="submit" class="btn btn-primary me-3 mb-3">Login</button> -->


                        </li>
                        <li class="list-group-item">prepare time: {{ card.prepTime }}</li>
                        <li class="list-group-item">description: {{ card.description }}</li>
                    </ul>
                </div>

            </div>
            <div class="d-flex justify-content-center">
                <!-- <button v-if="userStore.role === 'admin'" class="btn btn-primary">Add Recipes</button> -->
                <AddRecipeDialog v-if="userStore.role=== 'admin'"/>
            </div>
        </div>
    </div>
</template>


<style scoped>
.background {
    border-radius: 30px;
    background-color: antiquewhite;
}
</style>