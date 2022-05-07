import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import Speech from 'speak-tts';

Vue.config.productionTip = false;
new Vue({
  speech: new Speech(),
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
