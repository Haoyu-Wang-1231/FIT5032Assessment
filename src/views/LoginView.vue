<script setup>
import { ref } from 'vue'
import router from '@/router';
import userJson from '@/data/user.json'

const users = ref(userJson)

const formData = ref({
    username: '',
    password: ''
})

// const errors = ref({
//     username: null,
//     password: null
// })




const submitLogin = () => {    
    // console.log(users.value)


    router.push({name: 'Home'})


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
                    <input type="text" class="form-control" id="username">
                    </input>
                    <!-- <input type="text" class="form-control" id="username" @blur="() => validateName(true)"
                            @input="() => validateName(false)" v-model="formData.username">
                        <div v-if="errors.username" class="text-danger">{{ errors.username }}</div> -->
                </div>
                <div class="row mb-3">
                    <label for="username" class="form-label">password</label>
                    <input type="text" class="form-control" id="username">
                    </input>
                </div>

                <div class="text-center">
                    <button type="button" @click="registering" class="btn btn-secondary me-2">Register</button>
                    <button type="submit"  class="btn btn-primary me-2">Login</button>

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