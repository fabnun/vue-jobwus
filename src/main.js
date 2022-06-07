import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import themes from './themes';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from './firebaseConfig';
initializeApp(firebaseConfig);
themes.init();

onAuthStateChanged(getAuth(), (user) => {
  Vue.config.productionTip = false;
  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app');
});
