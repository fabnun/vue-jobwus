import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ignorarTildes: localStorage.getItem('ignorarTildes') === 'true',
  },
  mutations: {
    setIgnorarTildes(state, value) {
      state.ignorarTildes = !state.ignorarTildes;
      localStorage.setItem('ignorarTildes', state.ignorarTildes);
    },
  },
  actions: {
    setIgnorarTildes({ commit }) {
      commit('setIgnorarTildes');
    },
  },
  modules: {},
});
