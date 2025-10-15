<script setup>
import { onMounted, ref } from "vue";

import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { auth, db } from '@/firebase';
import Select from 'primevue/select';

import { sanitizePlainText } from "@/security/sanitize";
import { useUserStore } from "@/store/user";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

const emit = defineEmits(['recipeSaved']);

const functions = getFunctions();

// emulator


const userStore = useUserStore()
const visible = ref(false);

const recipe = ref({
    title: '',
    author: '',
    description: '',
    prepTime: '',
})

const resetReciptValue = () => {
    recipe.value.title = '';
    recipe.value.author = '';
    recipe.value.description = '';
    recipe.value.prepTime = ''; 
}


onMounted(async() => {
    if(!userStore.isAdmin){
        return;
    }
})

const saveRecipe = async() => {
    try{
        const payload = {
            title: sanitizePlainText(recipe.value.title, 50),
            author: sanitizePlainText(recipe.value.author, 20),
            description: sanitizePlainText(recipe.value.description, 250),
            prepTime: sanitizePlainText(recipe.value.prepTime, 20),
        }

        const call = httpsCallable(functions, "saveRecipe");
        const result = await call(payload);
        console.log(result.data);
        resetReciptValue();

        visible.value = false;
        emit('recipeSaved');
    }catch(e){
        console.log('error:'+e)
    }
};
</script>

<template>
    <div class="card flex justify-center">
        <button class="btn btn-primary" label="Show" @click="visible = true">Add Recipe</button>
        <Dialog class="col-xxl-4 col-lg-6 col-md-8 col-sm-10 col-12" v-model:visible="visible" modal header="Insert Recipe">
            <div class="d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3">
                <label for="username" class="font-semibold w-24">Title</label>
                <InputText v-model="recipe.title" id="email" class="flex-auto" :style="{ width: '40%' }" autocomplete="off" />
                <!-- <Select v-model="recipe.rating" :options="scores" placeholder="Select rating" :style="{ width: '40%' }" /> -->
            </div>
            <div class="d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3">
                <label for="email" class="font-semibold w-24">author</label>
                <InputText v-model="recipe.author" id="email" class="flex-auto" :style="{ width: '40%' }" autocomplete="off" />


                <!-- <InputText v-model="recipe.description" id="email" class="flex-auto" :style="{ width: '40%' }" autocomplete="off" /> -->
            </div>
            <div class="d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3">
                <label for="email" class="font-semibold w-24">description</label>
                <InputText v-model="recipe.description" id="email" class="flex-auto" :style="{ width: '40%' }" autocomplete="off" />

                <!-- <InputText v-model="recipe.description" id="email" class="flex-auto" :style="{ width: '40%' }" autocomplete="off" /> -->
            </div>
            <div class="d-flex justify-content-between align-items-center flex-column flex-sm-row mb-3">
                <label for="email" class="font-semibold w-24">Prepare time</label>
                <InputText v-model="recipe.prepTime" id="email" class="flex-auto" :style="{ width: '40%' }" autocomplete="off" />

                <!-- <InputText v-model="recipe.description" id="email" class="flex-auto" :style="{ width: '40%' }" autocomplete="off" /> -->
            </div>
            <div class="d-flex justify-content-center align-items-center flex-column flex-sm-row">
                <button class="btn btn-secondary me-2" type="button" label="Cancel" severity="secondary"
                    @click="visible = false">Cancel</button>
                <button class="btn btn-primary" type="button" label="Save" @click="saveRecipe">Upload</button>
            </div>
        </Dialog>
    </div>
</template>

