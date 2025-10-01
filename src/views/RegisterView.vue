<script setup>

import { onMounted, ref } from 'vue'
import router from '@/router';
import { onBeforeMount } from 'vue';
import {
    collection,
    addDoc,
    setDoc,
    onSnapshot,
    query,
    serverTimestamp,
    where,
    deleteDoc,
    doc,
} from 'firebase/firestore'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '@/firebase'


const notes = ref([])
const newText = ref('')
const unsubscribe = ref(null)

const noteCollection = collection(db, 'user_role')







const flag = ref(false)
const formData = ref({
    email: '',
    password: '',
    confirmPassword: ''
})

const errors = ref({
    email: null,
    password: null,
    confirmPassword: null
})


const submitRegister = async () => {
    validateEmail();
    validatePassword();
    validateConfirmPassword();

    flag.value = false;
    if (errors.value.email !== null || errors.value.password !== null || errors.value.confirmPassword !== null) {
        return;
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.value.email, formData.value.password);
        console.log("register success");
        console.log(userCredential);
        try {
            await sendEmailVerification(userCredential.user);
            console.log("verification email sent")
        } catch (e) {
            errors.value.email = "failed to send verification email. " + e.message;
        }
        await setDoc(doc(db, 'user_role', userCredential.user.uid), {
            email: userCredential.user.email,
            role: 'viewer',
            createAt: serverTimestamp()
        })        
        formData.value.email = '';
        formData.value.password = '';
        formData.value.confirmPassword = '';
        flag.value = true;
    } catch (e) {
        console.log("register failed")
        console.log(e.message)
        errors.value.email = e.message;
        formData.value.email = '';
        formData.value.password = '';
    } finally {
        console.log("Register process finished")
        // router.push({ name: 'Login' })
    }
    if (flag.value) {
        router.push({ name: 'Login' })
    }
}

const validateEmail = (blur) => {
    const email = formData.value.email;

    if (email.length < 3) {
        if (blur) {
            errors.value.email = "Email have at least 3 characters"
        }
    } else {
        errors.value.email = null
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
    console.log("validate confirm password")
    if (formData.value.password !== formData.value.confirmPassword) {
        console.log("type 1")
        errors.value.confirmPassword = "password not matched."
    } else if (errors.value.password !== null) {
        console.log("type 2")

        if (blur) {
            errors.value.confirmPassword = errors.value.password
        }
    } else {
        errors.value.confirmPassword = null
    }
}
</script>

<template>
    <!-- sm,md,lg,xxl -->
    <div class="container d-flex justify-content-center" style="padding-top: 10%;">
        <div class="col-xxl-8 col-lg-8 col-md-8 col-sm-10 col-10 background">
            <h1 class="mt-5 text-center">Register New User</h1>
            <div class="d-flex justify-content-center">
                <form class="col-xxl-6 col-lg-6 col-md-7 col-sm-8 col-10" @submit.prevent="submitRegister">
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="text" class="form-control" @blur="() => validateEmail(true)"
                            @input="() => validateEmail(false)" v-model="formData.email" id="username">
                        </input>
                        <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Password</label>
                        <input type="text" class="form-control mx-auto" @blur="() => validatePassword(true)"
                            @input="() => validatePassword(false)" v-model="formData.password" id="email">
                        </input>
                        <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Confirm Password</label>
                        <input type="text" class="form-control" @blur="() => validateConfirmPassword(true)"
                            @input="() => validateConfirmPassword(false)" v-model="formData.confirmPassword"
                            id="password">
                        </input>
                        <div v-if="errors.confirmPassword" class="text-danger">{{ errors.confirmPassword }}</div>
                        <!-- <div v-if="errors.confirmPassword" class="text-danger">{{ errors.confirmPassword }} </div> -->

                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary me-2 mb-3">Sign Up</button>
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