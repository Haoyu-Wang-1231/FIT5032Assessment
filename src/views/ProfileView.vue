<template>
  <div>this is profile</div>
  <div></div>
</template>
<script setup>
import { useUserStore } from '@/store/user'
import { onMounted, ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '@/firebase'

const userStore = useUserStore();
const userInfo = ref(null);

function waitforAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off()
      resolve(u)
    })
  })
}

async function loadUserInfo() {
  try {
    const call = httpsCallable(functions, 'getUserInfo')
    const payload = userStore.id;
    const result = await call(payload);
    console.log("results:");
    // console.log(result)
    userInfo.value = result.data.profile;
    console.log(userInfo.value);
    // totalRows.value = events.value.length;
    // console.log('Events loaded:', events.value);
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const user = await waitforAuth()
  if (user) {
    console.log('User is signed in: ', user.email)
    await loadUserInfo();
  }
})
</script>
