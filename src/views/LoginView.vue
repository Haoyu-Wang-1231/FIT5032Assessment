<script setup>
import { ref } from 'vue'
import router from '@/router';
import userJson from '@/data/user.json'

const users = ref(userJson)

const formData = ref({
    username: '',
    password: ''
})

const errors = ref({
    username: null,
    password: null
})

const submitLogin = () => {
    const u = users.value.find(x => {return x.username === formData.value.username});
    if(!u){
        formData.value.username = '';
        formData.value.password = '';
        errors.value.username = "user not exist.";
        
    }else if (u.password !== formData.value.password){
        if(formData.value.password === ''){
            errors.value.password = "no password input"
        }else{
            formData.value.password = '';
            errors.value.password = "password not correct.";
        }
    }else{
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

</script>

<template>
    <div class="mt-5 container">
        <div class="col-sm-10 col-md-8 offset-2 col-lg-8">
            <h1 class="text-center">Login Page</h1>
            <form @submit.prevent="submitLogin">
                <div class="row mb-3">
                    <label for="username" class="form-label">user name</label>
                    <input type="text" class="form-control"
                        @focus="validateUsername"
                        v-model="formData.username" id="username">
                    </input>
                    <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
                    <!-- <input type="text" class="form-control" id="username" @blur="() => validateName(true)"
                            @input="() => validateName(false)" v-model="formData.username">
                        <div v-if="errors.username" class="text-danger">{{ errors.username }}</div> -->
                </div>
                <div class="row mb-3">
                    <label for="username" class="form-label">password</label>
                    <input type="text" class="form-control"
                        @focus="validatePassword"

                        v-model="formData.password" id="username">
                    </input>
                    <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>

                </div>

                <div class="text-center mb-">
                    <button type="button" @click="registering" class="btn btn-secondary me-3 mb-3">Register</button>
                    <button type="submit" class="btn btn-primary me-3 mb-3">Login</button>


                </div>
            </form>
        </div>
    </div>
</template>



<style scoped>
.container {
    background-color: antiquewhite;
}
</style>