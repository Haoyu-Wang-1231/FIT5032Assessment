<script setup>

import { ref } from 'vue'
import userJson from '@/data/user.json'
import router from '@/router';


const users = ref(userJson)

const formData = ref({
    username: '',
    password: '',
    confirmPassword: ''
})

const errors = ref({
    username: null,
    password: null,
    confirmPassword: null
})

const submitRegister = () => {
    validateUsername();
    validatePassword();
    validateConfirmPassword();
    console.log("activate")

    if (errors.value.username !== null || errors.value.password !== null || errors.value.confirmPassword !== null) {
        return;
    }
    const u = users.value.find(x => { return x.username === formData.value.username && x.password === formData.value.password })


    console.log(formData.value.username)
    console.log(formData.value.password)

    if (u) {
        errors.value.username = "user already exist!"
        users.value.push({
            username: formData.value.username,
            password: formData.value.password
        })

    } else {
        router.push({ name: 'Login' })
    }


}


const validateUsername = (blur) => {
    const username = formData.value.username;
    if (username.length < 3) {
        if (blur) {
            errors.value.username = "Username have at least 3 characters"
        }
    } else {
        errors.value.username = null
    }
}

const validatePassword = (blur) => {
    const password = formData.value.password;
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
        if (blur) {
            errors.value.password = `password must have at least ${minLength} characters long.`;
        }
        errors.value.password = `password must have at least ${minLength} characters long.`;

    } else if (!hasUppercase) {
        if (blur) errors.value.password = "password must have at least one uppercase letter.";
    } else if (!hasLowercase) {
        if (blur) errors.value.password = "password must have at least one lowercase letter.";
    } else if (!hasNumber) {
        if (blur) errors.value.password = "password must have at least one number.";
    } else if (!hasSpecialChar) {
        if (blur) errors.value.password = "password must have at least one special character.";
    } else {
        errors.value.password = null
    }
}

const validateConfirmPassword = (blur) => {
    if (formData.value.password !== formData.value.confirmPassword) {
        if (blur) {
            errors.value.confirmPassword = "password not matched."
        }
    } else if (errors.value.password !== null) {
        if (blur) {
            errors.value.confirmPassword = errors.value.password
        }
    } else {
        errors.value.confirmPassword = null
    }
}
</script>

<template>
    <!-- xs,sm,lg,xxl -->
    <div class="mt-5 container d-flex justify-content-center">
        <div class="col-xxl-8 col-lg-8 col-md-8 col-sm-10 col-10 background">
            <h1 class="mt-5 text-center">Register Page</h1>
            <div class="d-flex justify-content-center">
                <form class="col-xxl-6 col-lg-6 col-md-7 col-sm-8 col-10" @submit.prevent="submitRegister">
                    <div class="mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input type="text" class="form-control" @blur="() => validateUsername(true)"
                            @input="() => validateUsername(false)" v-model="formData.username" id="username">
                        </input>
                        <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
                    </div>
                    <div class="mb-3">
                        <label for="username" class="form-label">Password</label>
                        <input type="text" class="form-control mx-auto" @blur="() => validatePassword(true)"
                            @input="() => validatePassword(false)" v-model="formData.password" id="username">
                        </input>
                        <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
                    </div>
                    <div class="mb-3">
                        <label for="username" class="form-label">Confirm Password</label>
                        <input type="text" class="form-control" @blur="() => validateConfirmPassword(true)"
                            @input="() => validateConfirmPassword(false)" v-model="formData.confirmPassword"
                            id="username">
                        </input>
                        <div v-if="errors.confirmPassword" class="text-danger">{{ errors.confirmPassword }}</div>
                        <!-- <div v-if="errors.confirmPassword" class="text-danger">{{ errors.confirmPassword }} </div> -->

                        <div class="mt-2 pb-3 text-center">
                            <button type="submit" class="btn btn-primary me-2">Sign Up</button>
                        </div>
                    </div>


                </form>
            </div>

        </div>
    </div>
</template>



<style scoped>
.background {
    background-color: antiquewhite;
}
</style>