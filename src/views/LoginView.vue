<script setup>
import { ref } from 'vue'
import router from '@/router';

const users = JSON.parse(localStorage.getItem('users'))

const formData = ref({
    username: '',
    password: ''
})

const errors = ref({
    username: null,
    password: null
})

const submitLogin = () => {
    const u = users.find(x => { return x.username === formData.value.username });
    if (!u) {
        formData.value.username = '';
        formData.value.password = '';
        errors.value.username = "user not exist.";

    } else if (u.password !== formData.value.password) {
        if (formData.value.password === '') {
            errors.value.password = "no password input"
        } else {
            formData.value.password = '';
            errors.value.password = "password not correct.";
        }
    } else {
        sessionStorage.setItem('currentUser', u.username);
        sessionStorage.setItem('usertype', '' + u.usertype);
        router.push({ name: 'Home' })
    }
}

const validateUsername = () => {
    errors.value.username = null
}

const validatePassword = () => {
    errors.value.password = null
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
                            <label for="username" class="form-label">user name</label>
                            <input type="text" class="form-control" @focus="validateUsername"
                                v-model="formData.username" id="username">
                            </input>
                            <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
                            <!-- <input type="text" class="form-control" id="username" @blur="() => validateName(true)"
                            @input="() => validateName(false)" v-model="formData.username">
                        <div v-if="errors.username" class="text-danger">{{ errors.username }}</div> -->
                        </div>
                        <div class="mb-3">
                            <label for="username" class="form-label">password</label>
                            <input type="text" class="form-control" @focus="validatePassword"
                                v-model="formData.password" id="username">
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