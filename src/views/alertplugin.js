import { createApp, reactive } from "vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import AlertWarning from "@/components/AlertWarning.vue";
import AlertError from "@/components/AlertError.vue";


const alertState = reactive({
  show: false,
  type: null,
  message: "",
});

const showAlert = (type, message) => {
  alertState.show = true;
  alertState.type = type;
  alertState.message = message;

  // Hide the alert after 3 seconds (optional)
  setTimeout(() => {
    alertState.show = false;
    alertState.type = null;
    alertState.message = "";
  }, 3000);
};

export default {
  install: (app) => {
    app.config.globalProperties.$alert = showAlert;

    app.component("AlertSuccess", AlertSuccess);
    app.component("AlertWarning", AlertWarning);
    app.component("AlertError", AlertError);

    app.provide("alertState", alertState);
  },
};