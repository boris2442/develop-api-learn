
import { createApp } from 'vue'
import { createPinia } from 'pinia'
//importation du script nprogree
// import "./nprogess/nprogress.js";

import App from './App.vue'
import router from './router/index.js'

import './assets/base.css'
import './assets/main.css'

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')
