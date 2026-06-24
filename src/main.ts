import 'flatpickr/dist/flatpickr.min.css';
import './assets/css/satoshi.css';
import './assets/css/style.css';
import { createPinia } from 'pinia';
import { createApp, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import VueBasicAlert from 'vue-basic-alert';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import App from './App.vue';
import router from './router';
import { showAlert, type AlertOptions, type AlertType } from './plugins/alert/alert';
import '../node_modules/jsvectormap/dist/jsvectormap.min.css';
// import 'jsvectormap/dist/css/jsvectormap.min.css'

const alertRef = ref(null);

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

// Initialize dark mode before mounting to prevent FOUC
import { useDarkModeStore } from './stores/darkMode';
useDarkModeStore();
// Store initialization already handles applying dark mode class

app.use(router);
app.use(VueApexCharts);
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  toastClassName: 'custom-toast',
  bodyClassName: 'custom-toast-body',
});

app.config.globalProperties.$alert = {
  showAlert: (type: AlertType, message: string, title: string, options: AlertOptions) => {
    showAlert(alertRef, type, message, title, options);
  },
};

app.use(VueBasicAlert, {
  duration: 300,
  closeIn: 300,
});

app.mount('#app');
