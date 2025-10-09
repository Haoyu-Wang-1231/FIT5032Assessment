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
import { sanitizePlainText } from "@/security/sanitize";
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

// Todo: need to switch to functions
const submitComment = async() => {
    if (!comment.value.rating || !comment.value.description){
        console.log('comment not complete')
        return
    }
    if (!userStore?.uid){
        console.log('no user id')
        return
    }
    const commentRef = doc(db, 'recipe', props.recipeId, 'comments', userStore.uid)
    try{
        await setDoc(commentRef, {
            userId: userStore.uid,
            rating: Number(comment.value.rating),
            comment: sanitizePlainText(comment.value.description, 250),
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
        <Dialog class="col-xxl-4 col-lg-6 col-md-8 col-sm-10 col-12" v-model:visible="visible" modal :header="recipe">
            <div class="text-surface-500 dark:text-surface-400 block mb-3">Sharing your comment</div>
            <div class="d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3">
                <label for="username" class="font-semibold w-24">Rating</label>
                <!-- <input id="username" class="flex-auto" autocomplete="off" /> -->
                <Select v-model="comment.rating" :options="scores" placeholder="Select rating" :style="{ width: '40%' }" />
            </div>
            <div class="d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3">
                <label for="email" class="font-semibold w-24">Comments</label>
                <InputText v-model="comment.description" id="email" class="flex-auto" :style="{ width: '40%' }" autocomplete="off" />
            </div>
            <div class="d-flex justify-content-center align-items-center flex-column flex-sm-row">
                <button class="btn btn-secondary me-2" type="button" label="Cancel" severity="secondary"
                    @click="visible = false">Cancel</button>
                <button class="btn btn-primary" type="button" label="Save" @click="submitComment">Save</button>
            </div>
        </Dialog>
    </div>
</template>

