import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    //No supe como usar el mixin para usar el metodo setItem
    ignorarTildes: localStorage.getItem('ignorarTildes') === 'true',
    voiceList: [],
  },
  mutations: {
    setVoiceList(state, voiceList) {
      state.voiceList = voiceList;
    },
    setIgnorarTildes(state, value) {
      state.ignorarTildes = !state.ignorarTildes;
      //No supe como usar el mixin para usar el metodo setItem
      localStorage.setItem('ignorarTildes', state.ignorarTildes);
    },
  },
  actions: {
    setVoiceList({ commit }, voiceList) {
      commit('setVoiceList', voiceList);
    },
    setIgnorarTildes({ commit }) {
      commit('setIgnorarTildes');
    },
  },
  modules: {},
});
