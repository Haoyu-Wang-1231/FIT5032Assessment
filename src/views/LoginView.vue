<script setup>
import { ref } from 'vue'
import router from '@/router';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase'


const users = JSON.parse(localStorage.getItem('users'))

const formData = ref({
    email: '',
    password: ''
})

const errors = ref('')

const submitLogin = async() => {
    
    try{
        await signInWithEmailAndPassword(auth, formData.value.email, formData.value.password)
    }catch(e){
        errors.value = e.message
        console.log('Login failed: ', e)
    }finally{
        console.log('Login Finished')
    }
    
    if(errors.value == ''){
        router.push({ name: 'Home' })
    }
}



function registering() {
    router.push({ name: 'Register' })
}

function justLogin() {
    sessionStorage.setItem('currentUser', 'harland');
    sessionStorage.setItem('usertype', '' + 'admin');

    router.push({ name: 'Home' })
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