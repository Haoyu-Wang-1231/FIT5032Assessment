<script setup>
import Header from './components/Header.vue';
import { RouterView, RouterLink } from 'vue-router';
import { onMounted, ref } from 'vue'

import { auth, db, functions } from '@/firebase'
console.log('AUTH emulator?', auth.config?.emulator)
console.log('FS emulator?', db._settings?.host)          
console.log('FN emulator?', functions.emulatorOrigin)  


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
