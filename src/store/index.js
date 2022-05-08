import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ignorarTildes: localStorage.getItem('ignorarTildes') === 'true',
    words: localStorage.getItem('cfg') ? localStorage.getItem('cfg') : 'info',
    wordsList: ['info', 'sts'],
    voice: null,
    voiceList: [],
  },
  mutations: {
    setVoiceList(state, voiceList) {
      state.voiceList = voiceList;
    },
    setVoice(state, voice) {
      state.voice = voice;
    },
    setIgnorarTildes(state, value) {
      state.ignorarTildes = !state.ignorarTildes;
      localStorage.setItem('ignorarTildes', state.ignorarTildes);
    },
  },
  actions: {
    setVoiceList({ commit }, voiceList) {
      commit('setVoiceList', voiceList);
    },
    setVoice({ commit }, voice) {
      commit('setVoice', voice);
    },
    setIgnorarTildes({ commit }) {
      commit('setIgnorarTildes');
    },
  },
  modules: {},
});
