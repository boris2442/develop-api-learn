<script setup lang="ts">
// import { RouterView } from "vue-router";
import Navbar from "@/components/Navbar.vue";
// import apiClient from '../api/index.js'
// import apiClient from './api/index.js'
</script>

<!-- <template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
  </main>
</template> -->

<template>
  <Navbar/>
  <RouterView />
</template>

