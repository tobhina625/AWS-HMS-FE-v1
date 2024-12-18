import './assets/css/satoshi.css'
import './assets/css/style.css'
import 'flatpickr/dist/flatpickr.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'

import App from './App.vue'
import router from './router'

// Enable one of the following.
import '../node_modules/jsvectormap/dist/jsvectormap.min.css';
// import 'jsvectormap/dist/css/jsvectormap.min.css' 

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueApexCharts)

app.mount('#app')
