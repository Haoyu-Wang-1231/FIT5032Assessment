<script setup>
import { ref } from "vue";

import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { db } from '@/firebase';
import Select from 'primevue/select';
import {
    collection,
    addDoc,
    setDoc,
    onSnapshot,
    query,
    serverTimestamp,
    where,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
} from 'firebase/firestore'
import { useUserStore } from "@/store/user";

const props = defineProps({
    recipe: String,
    recipeId: String
})

const userStore = useUserStore()
const visible = ref(false);
const scores = [1, 2, 3, 4, 5]

const comment = ref({
    rating: 0,
    description: ''
})


const submitComment = async() => {
    if (!comment.value.rating || !comment.value.description){
        console.log('comment not complete')
        return
    }
    if (!userStore?.uid){
        console.log('no user id')
        return
    }
    const commentRef = doc(db, 'recipe', props.recipeId, 'comment', userStore.uid)
    try{
        await setDoc(commentRef, {
            userId: userStore.uid,
            rating: Number(comment.value.rating),
            comment: comment.value.description,
            createdAt: serverTimestamp()
        }, {merge: true})
    }catch(e){
        console.log("error!!")
        console.log(e)
    }finally{
        console.log("to recipe: " + props.recipeId + ", rating: " + comment.value.rating + ", description: " + comment.value.description)
    }

    console.log("rating: " + comment.value.rating)
    console.log(comment.value.description)
    visible.value = false
}

</script>


<template>
    <div class="card flex justify-center">
        <button class="btn btn-primary" label="Show" @click="visible = true">Rating</button>
        <Dialog v-model:visible="visible" modal :header="recipe" :style="{ width: '30%' }">
            <div class="text-surface-500 dark:text-surface-400 block mb-3">Sharing your comment</div>
            {{ recipeId }}
            <div class="flex items-center gap-4 mt-2 mb-4">
                <label for="username" class="font-semibold w-24">Rating</label>
                <!-- <input id="username" class="flex-auto" autocomplete="off" /> -->
                <Select v-model="comment.rating" :options="scores" placeholder="Select a number" class="w-40" />
            </div>
            <div class="flex items-center gap-4 mb-3">
                <label for="email" class="font-semibold w-24">Comments</label>
                <InputText v-model="comment.description" id="email" class="flex-auto" autocomplete="off" />
            </div>
            <div class="mt-2 flex justify-end gap-2">
                <button class="btn btn-secondary me-2" type="button" label="Cancel" severity="secondary"
                    @click="visible = false">Cancel</button>
                <button class="btn btn-primary" type="button" label="Save" @click="submitComment">Save</button>
            </div>
        </Dialog>
    </div>
</template>

