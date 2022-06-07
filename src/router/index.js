import Vue from 'vue';
import VueRouter from 'vue-router';
import Ofertas from '../views/Ofertas.vue';
import Login from '../views/Login.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/:cfg?/login',
    component: Login,
  },

  {
    path: '/:cfg?/:search?',
    component: Ofertas,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
