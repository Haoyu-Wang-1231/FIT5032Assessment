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


</script>

<template>

    <div class="mt-5 container">
        <div class="col-sm-10 col-md-8 offset-2 col-lg-8">
            <h1 class="text-center">Register Page</h1>
            <form @submit.prevent="submitLogin">
                <div class="row mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username">
                    </input>
                    <!-- <input type="text" class="form-control" id="username" @blur="() => validateName(true)"
                            @input="() => validateName(false)" v-model="formData.username">
                        <div v-if="errors.username" class="text-danger">{{ errors.username }}</div> -->
                </div>
                <div class="row mb-3">
                    <label for="username" class="form-label">Password</label>
                    <input type="text" class="form-control" id="username">
                    </input>
                </div>
                <div class="row mb-3">
                    <label for="username" class="form-label">Confirm Password</label>
                    <input type="text" class="form-control" id="username">
                    </input>
                </div>

                <div class="pb-3 text-center">
                    <button type="button" @click="registering" class="btn btn-primary me-2">Sign Up</button>
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