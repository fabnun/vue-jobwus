import Vue from 'vue';
import VueRouter from 'vue-router';
import Ofertas from '../views/Ofertas.vue';
import Login from '../views/Login.vue';
import Registro from '../views/Registro.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/:cfg?/auth/login',
    component: Login,
  },
  {
    path: '/:cfg?/auth/registro',
    component: Registro,
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
