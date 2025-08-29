<script setup>
import Header from './components/Header.vue';
import { RouterView, RouterLink } from 'vue-router';
import userJson from '@/data/user.json'
import { onMounted, ref } from 'vue'

const users = ref(userJson)


onMounted(() => {
  localStorage.setItem('users', JSON.stringify(users.value));
})
</script>

<template>
  <div>
    <header >
      <Header />
    </header>

    <main class="background-pic">
      <RouterView></RouterView>
      <!-- <AccountLogin /> -->
      <!-- <TheWelcome /> -->
    </main>
  </div>

</template>

<style scoped>
header {
  line-height: 6;
}

.background-pic {
    background-image: url('@/assets/pictures/background.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
}

.logo {
  display: block;
}
</style>
