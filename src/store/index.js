import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ignorarTildes: localStorage.getItem('ignorarTildes') === 'true',
    voiceList: [],
  },
  mutations: {
    setVoiceList(state, voiceList) {
      state.voiceList = voiceList;
    },
    setIgnorarTildes(state, value) {
      state.ignorarTildes = !state.ignorarTildes;
      this.localSetItem('ignorarTildes', state.ignorarTildes);
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
