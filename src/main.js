import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import Speech from 'speak-tts';
import themes from './themes';
import VuePaginateScroll from 'vue-paginate-scroll';

themes.init();

Vue.component('vue-paginate-scroll', VuePaginateScroll);

Vue.config.productionTip = false;
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
