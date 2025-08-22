<script setup>
import AccountLogin from './components/AccountLogin.vue';
import Header from './components/Header.vue';
import { RouterView, RouterLink } from 'vue-router';

</script>

<template>
  <header class="col-12">
    <!-- <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" /> -->
    <Header class="col-md-12" />
  </header>

  <main>
    <RouterView></RouterView>
    <!-- <AccountLogin /> -->
    <!-- <TheWelcome /> -->
  </main>
</template>

<style scoped>
header {
  line-height: 6;
}

.logo {
  display: block;
}
</style>
