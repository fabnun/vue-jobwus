import Vue from 'vue';
import VueRouter from 'vue-router';
import Ofertas from '../views/Ofertas.vue';

Vue.use(VueRouter);

const routes = [
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
