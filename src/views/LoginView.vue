<script setup>
import { ref } from 'vue'
import router from '@/router';
import { onBeforeMount } from 'vue';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase'

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
} from 'firebase/firestore'


const notes = ref([])
const userCollection = collection(db, 'user_role')


// userStore.email
// userStore.role

const formData = ref({
    email: '',
    password: ''
})

async function getUser(email){
    const q = query(userCollection, where("email", "==", email));
    const noteData = []
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc) => {
        noteData.push(doc.data())
        // console.log(doc.id, " => ", doc.data());
    });
    notes.value = noteData
}


const errors = ref('')

function registering() {
    router.push({ name: 'Register' })
}

const submitLogin = async() => {
    
    try{
        const userCredential = await signInWithEmailAndPassword(auth, formData.value.email, formData.value.password)

        await getUser(userCredential.user.email);
        // userStore.setUser(auth.currentUser.uid, auth.currentUser.email, notes.value[0].role)
    }catch(e){
        errors.value = e.message
        console.log('Login failed: ', e)
    }finally{
        console.log(auth.currentUser)
        console.log(notes.value)
        console.log('Login Finished')
    }
    
    if(errors.value == ''){

        router.push({ name: 'Home' })
    }
}

async function justLogin () {
    try{
        const userCredential = await signInWithEmailAndPassword(auth, '1658129453@qq.com', 'Harland123#')
        
        await getUser(userCredential.user.email);
        // userStore.email = auth.currentUser.email
        // userStore.role = notes.value[0].role
    }catch(e){
        errors.value = e.message
        console.log('Login failed: ', e)
    }finally{
        console.log(auth.currentUser)
        console.log(notes.value)
        console.log('Login Finished')   
    }

    if(errors.value == ''){
        router.push({ name: 'Home' })
    }
}


async function justAdmin () {
    try{
        const userCredential = await signInWithEmailAndPassword(auth, 'admin@qq.com', 'Harland123#')
        
        await getUser(userCredential.user.email);
        // userStore.setUser(auth.currentUser.uid, auth.currentUser.email, notes.value[0].role)

    }catch(e){
        errors.value = e.message
        console.log('Login failed: ', e)
    }finally{
        console.log(auth.currentUser)
        console.log(notes.value)
        console.log('Login Finished')   
    }

    if(errors.value == ''){
        router.push({ name: 'Home' })
    }
}
</script>

<template>
        <div class="container d-flex justify-content-center" style="padding-top: 10%;">
            <div class="col-xxl-8 col-lg-8 col-md-8 col-sm-10 col-10 background">
                <h1 class="mt-5 text-center">Login</h1>
                <div class="d-flex justify-content-center">
                    <form class="col-xxl-6 col-lg-6 col-md-7 col-sm-8 col-10" @submit.prevent="submitLogin">
                        <div class="mb-3">
                            <label for="email" class="form-label">user name</label>
                            <input type="text" class="form-control"
                                v-model="formData.email" id="email">
                            </input>
                            <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
                            <!-- <input type="text" class="form-control" id="username" @blur="() => validateName(true)"
                            @input="() => validateName(false)" v-model="formData.username">
                        <div v-if="errors.username" class="text-danger">{{ errors.username }}</div> -->
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">password</label>
                            <input type="text" class="form-control"
                                v-model="formData.password" id="password">
                            </input>
                            <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>

                        </div>

                        <div class="text-center">
                            <button type="button" @click="registering"
                                class="btn btn-secondary me-3 mb-3">Register</button>
                            <button type="submit" class="btn btn-primary me-3 mb-3">Login</button>
                            <button type="button" @click="justLogin" class="btn btn-primary me-3 mb-3">just login</button>
                            <button type="button" @click="justAdmin" class="btn btn-primary me-3 mb-3">just admin</button>


                        </div>
                    </form>
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