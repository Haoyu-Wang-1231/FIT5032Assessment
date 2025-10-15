<template>
  <!-- sm,md,lg,xxl -->
  <div class="container d-flex justify-content-center" style="padding-top: 10%">
    <div class="col-xxl-8 col-lg-8 col-md-8 col-sm-10 col-10 background">
      <h1 class="mt-5 text-center">Register New User</h1>
      <div class="d-flex justify-content-center">
        <form class="col-xxl-6 col-lg-6 col-md-7 col-sm-8 col-10" @submit.prevent="submitRegister">
          <div class="mb-3">
            <label for="email" class="form-label">Username</label>
            <input
              type="text"
              class="form-control"
              @blur="() => validateUsername(true)"
              @input="() => validateUsername(false)"
              v-model="formData.username"
              id="username"
            />

            <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              @blur="() => validateEmail(true)"
              @input="() => validateEmail(false)"
              v-model="formData.email"
              id="email"
            />

            <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Password</label>
            <input
              type="text"
              class="form-control mx-auto"
              @blur="() => validatePassword(true)"
              @input="() => validatePassword(false)"
              v-model="formData.password"
              id="password"
            />
            <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Confirm Password</label>
            <input
              type="text"
              class="form-control"
              @blur="() => validateConfirmPassword(true)"
              @input="() => validateConfirmPassword(false)"
              v-model="formData.confirmPassword"
              id="confirm"
            />

            <div v-if="errors.confirmPassword" class="text-danger">
              {{ errors.confirmPassword }}
            </div>
            <!-- <div v-if="errors.confirmPassword" class="text-danger">{{ errors.confirmPassword }} </div> -->
          </div>
          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2 mb-3">Sign Up</button>
            <button type="button" @click="toSignIn" class="btn btn-secondary me-2 mb-3">
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth, db, functions } from '@/firebase'
import { httpsCallable } from 'firebase/functions'
import { RouterLink, routerViewLocationKey, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const flag = ref(false)
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = ref({
  username: null,
  email: null,
  password: null,
  confirmPassword: null,
})

const toSignIn = () => {
  router.push({ name: 'Login' })
}

// build it on functions.

const validateUsername = (blur) => {
  const email = formData.value.username

  if (email.length < 4) {
    if (blur) {
      errors.value.email = 'username should have at least 4 characters'
    }
  } else {
    errors.value.email = null
  }
}

const submitRegister = async () => {
  validateUsername()
  validateEmail()
  validatePassword()
  validateConfirmPassword()

  flag.value = false
  if (
    errors.value.email !== null ||
    errors.value.password !== null ||
    errors.value.confirmPassword !== null
  ) {
    return
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.value.email,
      formData.value.password,
    )
    await userStore.logout()
    console.log(userCredential)
    try {
      await sendEmailVerification(userCredential.user)
      console.log('verification email sent')
    } catch (e) {
      errors.value.email = 'failed to send verification email. ' + e.message
      return
    }

    const call = httpsCallable(functions, 'registerUser')
    const payload = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      username: formData.value.username,
    }
    const result = await call(payload)
    console.log(result.data)
    formData.value.username = ''
    formData.value.email = ''
    formData.value.password = ''
    formData.value.confirmPassword = ''
    flag.value = true
    console.log('register success')
  } catch (e) {
    console.log('register failed')
    console.log(e.message)
    errors.value.email = e.message
    formData.value.email = ''
    formData.value.password = ''
    formData.value.confirmPassword = ''
  } finally {
    console.log('Register process finished')
    // router.push({ name: 'Login' })
  }
  if (flag.value) {
    router.push({ name: 'Login' })
  }
}

const validateEmail = (blur) => {
  const email = formData.value.email

  if (email.length < 3) {
    if (blur) {
      errors.value.email = 'Email should have at least 3 characters'
    }
  } else {
    errors.value.email = null
  }
}

const validatePassword = (blur) => {
  const password = formData.value.password
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    if (blur) {
      errors.value.password = `password must have at least ${minLength} characters long.`
    }
  } else if (!hasUppercase) {
    if (blur) errors.value.password = 'password must have at least one uppercase letter.'
  } else if (!hasLowercase) {
    if (blur) errors.value.password = 'password must have at least one lowercase letter.'
  } else if (!hasNumber) {
    if (blur) errors.value.password = 'password must have at least one number.'
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = 'password must have at least one special character.'
  } else {
    errors.value.password = null
  }
}

const validateConfirmPassword = (blur) => {
  console.log('validate confirm password')
  if (formData.value.password !== formData.value.confirmPassword) {
    console.log('type 1')
    errors.value.confirmPassword = 'password not matched.'
  } else if (errors.value.password !== null) {
    console.log('type 2')

    if (blur) {
      errors.value.confirmPassword = errors.value.password
    }
  } else {
    errors.value.confirmPassword = null
  }
}
</script>

<style scoped>
.background {
  border-radius: 30px;

  background-color: antiquewhite;
}
</style>
