<template>
  <div>
    <header v-if="!hiddenHeader">
      <Header />
    </header>

    <main :class="backgroundClass">
      <RouterView></RouterView>
      <!-- <AccountLogin /> -->
      <!-- <TheWelcome /> -->
    </main>
  </div>

</template>

<script setup>
import Header from './components/Header.vue';
import { RouterView, RouterLink, useRoute } from 'vue-router';
import { computed, onMounted, ref } from 'vue'

import { auth, db, functions } from '@/firebase'
console.log('AUTH emulator?', auth.config?.emulator)
console.log('FS emulator?', db._settings?.host)          
console.log('FN emulator?', functions.emulatorOrigin)  
const route = useRoute()

const hiddenHeader = computed(()=>{
  return route.meta.hidden
})

const backgroundClass = computed(() =>
  route.meta.hidden ? '' : 'background-pic'
)

</script>



<style scoped>
header {
  line-height: 6;
}

:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
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
