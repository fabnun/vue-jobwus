<template>
  <div class="container">
    <div class="filtro">
      <div class="filtroIn">
        <dots-vertical-icon class="menu-button" @click="modal = !modal" />
        <select v-model="folder" class="searchList2">
          <option v-for="item in folders" :value="item" :key="item" :selected="item === folder">{{ item }}</option>
        </select>
        <input autocapitalize="none" spellcheck="false" @keyup.enter="query" ref="filtro" placeholder="" />
        <magnify-icon class="submit-button" @click="query" />
        <div style="text-align: left; width: 100%; padding-left: 27px">
          <undo-icon class="button-icon" @click="doUndo" />
          <redo-icon class="button-icon" @click="doRedo" />
          <archive-plus-outline-icon class="button-icon" @click="addSearch" />
          <archive-remove-outline-icon class="button-icon" @click="removeSearch" />
          <select class="searchList" ref="searchList" @change="setSearch(false)">
            <option v-for="item in searchList" :key="item" :selected="searchListSelect === item">
              {{ item }}
            </option>
          </select>

          <archive-arrow-up-outline-icon class="button-icon" @click="setSearch" />
        </div>
      </div>
    </div>
    <div :class="{ noEvents: modal }">
      <div v-if="!loading">
        <div style="margin: 0 auto; padding: 0 10px 10px; font-size: 0.8em">
          <span v-if="resultView !== null"> {{ resultView.pages.length }}&nbsp;resultados, {{ resultView.clusters.reduce((p, c) => p + (c.length > 1 ? c.length - 1 : 0), 0) }}&nbsp;similares, {{ resultView.pages.filter((p) => favoritos.has(p.id)).length }}&nbsp;Favoritos, {{ resultView.pages.filter((p) => archivados.has(p.id)).length }}&nbsp;Archivados</span>
          <span v-if="result !== null" style="float: right; line-height: 1.5em">Actualizado&nbsp;el&nbsp;{{ new Date(result.updateTime).toLocaleDateString() }}&nbsp;{{ new Date(result.updateTime).toLocaleTimeString().substring(0, 5) }}</span>
          <div style="clear: both"></div>
        </div>
        <vue-paginate-scroll v-if="resultView.pages.length" :src="resultView.pages" :per-scroll="20">
          <template slot-scope="{ data, currentScroll, lastScroll }">
            <div v-for="item in data" :key="item.id">
              <!-- grupo:{{ item.grupo }} ------ hidden:{{ item.hidden }} ---- archivado:{{ archivados.has(item.id) }} -->
              <oferta
                v-if="(!item.hidden && folder === 'Agrupados' && !archivados.has(item.id)) || (folder === 'Favoritos' && favoritos.has(item.id)) || (folder === 'Archivados' && archivados.has(item.id)) || folder === 'Todos'"
                :archivados="archivados"
                :favoritos="favoritos"
                :speechSupport="speechSupport"
                :folder="folder"
                :isArchived="archivados.has(item.id)"
                :isFavorite="favoritos.has(item.id)"
                @voiceSpeak="voiceSpeak"
                @favorite="favorite"
                @archive="archive"
                :data="resultView.data[item.id]"
                :id="item.id"
                :ignorarTildes="$store.state.ignorarTildes"
                :filtro="filtroFinal"
                :grupo="
                  folder === 'Agrupados'
                    ? item.grupo === null
                      ? []
                      : result.clusters[item.grupo]
                          .filter((id) => id !== item.id)
                          .map((id) => {
                            return { id, ...result.data[id] };
                          })
                    : []
                "
              />
            </div>
          </template>
        </vue-paginate-scroll>
      </div>
      <div v-else class="loading">
        <loading />
      </div>
    </div>
    <div class="modal-container" v-show="modal" @click="modal = false">
      <div @click.stop.prevent="" style="margin-right: -32px">
        <button class="close-modal" @click="modal = false" title="Cerrar"><close-icon /></button>
        <div class="modal" style="user-select: none; overflow-y: auto">
          <config @setVoice="setVoice" @setSpeed="setSpeed" :voiceList="voiceList" v-if="result !== null" :words="result.config.okWords.join(', ')"></config>
        </div>
      </div>
    </div>
    <div v-if="stopVoice" :class="{ 'voice-stop': true, 'voice-prepare': prepareVoice }" @click="voiceStop()">
      <account-tie-voice-off-outline-icon />
    </div>
  </div>
</template>
<script>
import VuePaginateScroll from 'vue-paginate-scroll';
import lzString from 'lz-string';
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue';
import UndoIcon from 'vue-material-design-icons/Undo.vue';
import RedoIcon from 'vue-material-design-icons/Redo.vue';
import AccountTieVoiceOffOutlineIcon from 'vue-material-design-icons/AccountTieVoiceOffOutline.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical.vue';
import ArchivePlusOutlineIcon from 'vue-material-design-icons/ArchivePlusOutline.vue';
import ArchiveRemoveOutlineIcon from 'vue-material-design-icons/ArchiveRemoveOutline.vue';
import ArchiveArrowUpOutlineIcon from 'vue-material-design-icons/ArchiveArrowUpOutline.vue';

import Oferta from '../components/Oferta.vue';
import Loading from '../components/Loading.vue';
import _smartPhone from 'detect-mobile-browser';
import Config from '../components/Config.vue';
import Speech from 'speak-tts';

const speech = new Speech();
let SmartPhone = _smartPhone(false);

export default {
  components: { ArchiveArrowUpOutlineIcon, ArchiveRemoveOutlineIcon, ArchivePlusOutlineIcon, UndoIcon, RedoIcon, Oferta, MagnifyIcon, DotsVerticalIcon, CloseIcon, Loading, Config, AccountTieVoiceOffOutlineIcon, VuePaginateScroll },
  name: 'Ofertas',
  data() {
    return {
      prepareVoice: false,
      stopVoice: false,
      voiceList: [],
      voice: '',
      voiceSpeed: 1,
      speechSupport: this.voice !== '' && speech.hasBrowserSupport(),
      folders: ['Agrupados', 'Favoritos', 'Archivados', 'Todos'],
      folder: 'Favoritos',
      loading: true,
      modal: false,
      filtroFinal: [],
      filtroFinalPlus: [],
      result: null,
      resultView: null,
      archivados: new Set(),
      favoritos: new Set(),
      searchList: [],
      searchListSelect: null,
      undo: [],
      redo: [],
    };
  },
  watch: {
    folder() {
      this.$forceUpdate();
      if (this.result !== null) {
        this.query();
      }
      window.localStorage.setItem('folder', this.folder);
    },
  },

  methods: {
    setVoice(voice) {
      this.voice = voice;
      this.speechSupport = this.voice !== '' && speech.hasBrowserSupport();
      speech.cancel();
      this.stopVoice = false;
    },
    setSpeed(speed) {
      this.voiceSpeed = parseFloat(speed);
      speech.cancel();
      this.stopVoice = false;
    },
    voiceStop() {
      if (speech.speaking()) {
        speech.cancel();
        this.stopVoice = false;
      }
    },
    async voiceSpeak(id) {
      let data = this.result.data[id];
      if (speech.speaking()) {
        speech.cancel();
        this.stopVoice = false;
        this.prepareVoice = false;
      }

      let fnFixText = (text) => text.replaceAll('(a)', '').replaceAll('(A)', '').replaceAll('/a ', ' ').replaceAll('/as ', ' ').replaceAll('/A ', ' ').replaceAll('/AS ', ' ').replaceAll('(as)', '').replaceAll('(AS)', '');
      try {
        this.stopVoice = true;
        this.prepareVoice = true;
        speech.setVoice(this.voice);
        speech.setRate(this.voiceSpeed);
        speech.speak({
          text: fnFixText(data.titulo) + '. ' + fnFixText(data.descripcion).toLowerCase(),
          listeners: {
            onstart: () => {
              this.stopVoice = true;
              this.prepareVoice = false;
            },
            onend: () => {
              this.stopVoice = false;
              this.prepareVoice = false;
            },
          },
        });
      } catch (error) {}
    },
    favorite(id) {
      let lastUndo = this.undo.length > 0 ? this.undo[this.undo.length - 1] : null;
      if (this.favoritos.has(id)) {
        this.favoritos.delete(id);
        if (lastUndo !== null && lastUndo.type === 'favorite' && lastUndo.id === id) {
          this.undo.pop();
        } else {
          this.undo.push({ type: 'favorite', id });
        }
      } else {
        this.favoritos.add(id);
        if (lastUndo !== null && lastUndo.type === 'unfavorite' && lastUndo.id === id) {
          this.undo.pop();
        } else {
          this.undo.push({ type: 'unfavorite', id });
        }
      }
      this.$forceUpdate();
      window.localStorage.setItem('favoritos', Array.from(this.favoritos).join(','));
    },
    archive(id) {
      let lastUndo = this.undo.length > 0 ? this.undo[this.undo.length - 1] : null;
      if (this.archivados.has(id)) {
        this.archivados.delete(id);
        if (lastUndo !== null && lastUndo.type === 'archive' && lastUndo.id === id) {
          this.undo.pop();
        } else {
          this.undo.push({ type: 'archive', id });
        }
      } else {
        this.archivados.add(id);
        if (lastUndo !== null && lastUndo.type === 'unarchive' && lastUndo.id === id) {
          this.undo.pop();
        } else {
          this.undo.push({ type: 'unarchive', id });
        }
      }
      this.updateHidden(this.resultView);
      this.$forceUpdate();
      window.localStorage.setItem('archivados', Array.from(this.archivados).join(','));
    },
    doRedo() {
      let lastRedo = this.redo.pop();
      if (lastRedo !== undefined) {
        this.undo.push(lastRedo);
        if (lastRedo.type === 'favorite') {
          this.favoritos.delete(lastRedo.id);
        } else if (lastRedo.type === 'unfavorite') {
          this.favoritos.add(lastRedo.id);
        } else if (lastRedo.type === 'archive') {
          this.archivados.delete(lastRedo.id);
        } else if (lastRedo.type === 'unarchive') {
          this.archivados.add(lastRedo.id);
        }
        this.updateHidden(this.resultView);
        this.$forceUpdate();
      }
    },
    doUndo() {
      let lastUndo = this.undo.pop();
      if (lastUndo !== undefined) {
        this.redo.push(lastUndo);
        if (lastUndo.type === 'favorite') {
          this.favoritos.add(lastUndo.id);
        } else if (lastUndo.type === 'unfavorite') {
          this.favoritos.delete(lastUndo.id);
        } else if (lastUndo.type === 'archive') {
          this.archivados.add(lastUndo.id);
        } else if (lastUndo.type === 'unarchive') {
          this.archivados.delete(lastUndo.id);
        }
        this.updateHidden(this.resultView);
        this.$forceUpdate();
      }
    },
    setSearch(query = false) {
      this.searchListSelect = this.$refs.searchList.value;
      if (this.searchListSelect !== null) {
        this.$refs.filtro.value = this.searchListSelect;
        window.localStorage.setItem('searchListSelect', this.searchListSelect);
        if (query) this.query();
      }
    },
    trimPlus() {
      this.$refs.filtro.value = this.$refs.filtro.value
        .toLowerCase()
        .replace(/[^\d\w,\s]+/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ', ')
        .trim();
    },

    addSearch() {
      this.trimPlus();
      let seach = this.$refs.filtro.value;

      if (this.searchList.indexOf(seach) === -1) {
        this.searchList.push(seach);
        this.searchList.sort();
        this.searchListSelect = seach;
        this.$forceUpdate();
        window.localStorage.setItem('searchList', JSON.stringify(this.searchList));
      }
    },
    removeSearch() {
      let seach = this.searchListSelect;
      let index = this.searchList.indexOf(seach);
      this.searchList.splice(index, 1);
      this.$forceUpdate();
      window.localStorage.setItem('searchList', JSON.stringify(this.searchList));
    },
    query() {
      this.trimPlus();
      this.loading = true;

      let search = this.$refs.filtro.value;
      search = search ? search.trim() : '';

      let cfg = this.$route.params.cfg;
      cfg = cfg ? cfg.trim() : 'info';

      let queryString = `/${cfg}${search ? '/' + search : ''}`;
      if (queryString !== document.location.pathname) {
        this.$router.push({ path: queryString }).catch(() => {});
      }
      setTimeout(this.submit, 200);
    },
    submit() {
      let search = this.$route.params.search;
      search = search ? search.trim() : '';

      let cfg = this.$route.params.cfg;
      cfg = cfg ? cfg.trim() : 'info';

      if (this.$store.state.ignorarTildes) {
        search = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      window.localStorage.setItem('filtro', search);
      let final = this.normalizeText(search.toLowerCase())
        .replace(/\s+/, ' ')
        .split(',')
        .map((word) => word.trim())
        .filter((word) => word !== '');

      this.filtroFinal = final;
      this.filtroFinalPlus = this.filtroFinal.filter((word) => word.startsWith('+') === true);

      this.filtroFinal = this.filtroFinal.map((word) => (word.startsWith('+') === true ? word.substring(1) : word));
      this.filtroFinalPlus = this.filtroFinalPlus.map((word) => (word.startsWith('+') === true ? word.substring(1) : word));

      //////////////////////////////////////////////////////////////////
      if (this.filtroFinal.length === 0) {
        this.resultView = this.result;
      } else {
        let resultBuild = {
          pages: this.result.pages.filter((item) => {
            return this.filtrar(item.id);
          }),
          data: this.result.data,
          clusters: this.result.clusters.map((cluster) => {
            return cluster.filter((id) => !this.archivados.has(id) && this.filtrar(id));
          }),
          config: this.result.config,
          updateTime: this.result.updateTime,
        };

        this.updateHidden(resultBuild);
        //console.log(firstGroup);
        this.resultView = resultBuild;
      }
      //////////////////////////////////////////////////////////////////

      window.scrollTo(0, 0);
      this.loading = false;

      try {
        if (!SmartPhone.isAny()) {
          this.$refs.filtro.focus();
        } else {
          this.$refs.filtro.blur();
        }
      } catch (error) {
        console.error(error);
      }
    },
    updateHidden(data) {
      let firstGroup = new Set();
      for (let page of data.pages) {
        //Si es una pagina agrupada
        if (page.grupo !== null) {
          //Si ya se registro el grupo
          if (firstGroup.has(page.grupo)) {
            page.hidden = true;
          } //Si no se registro el grupo
          else {
            if (this.archivados.has(page.id)) {
              page.hidden = true;
            } else {
              firstGroup.add(page.grupo);
              page.hidden = false;
            }
          }
        }
      }
    },

    filtrar(id) {
      let data = this.result.data[id];
      if (this.filtroFinal.length === 0) return true;
      let words = this.filtroFinal.map((word) => this.normalizeText(word));
      let words2 = this.filtroFinalPlus.map((word) => this.normalizeText(word));
      let text = this.normalizeText(data.titulo + data.descripcion);
      if (words2.length > 0) {
        for (let word of words2) {
          if (!text.includes(word)) {
            return false;
          }
        }
        return true;
      } else {
        for (let word of words) {
          if (text.includes(word)) {
            return true;
          }
        }
      }
      return false;
    },

    normalizeText(text) {
      text = text.toLowerCase();
      if (this.$store.state.ignorarTildes) {
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      return text.trim();
    },
  },
  mounted() {
    speech
      .init({
        rate: 1.5,
        splitSentences: false,
        listeners: {
          onvoiceschanged: (voices) => {
            voices = voices.map((v) => v.name);
            voices = voices.filter((v) => v.toLowerCase().indexOf('spanish') > -1 || v.toLowerCase().indexOf('español') > -1);
            voices.unshift('');
            this.voiceList = voices;
            this.$forceUpdate();
          },
        },
      })
      .then((data) => {})
      .catch((e) => {
        console.error('An error occured while initializing : ', e);
      });
    ///////////////////////////////////////////////////
    let favoritos = window.localStorage.getItem('favoritos');
    if (favoritos !== null) {
      this.favoritos = new Set(favoritos.split(','));
    }
    ///////////////////////////////////////////////////
    this.searchListSelect = window.localStorage.getItem('searchListSelect');
    let searchList = window.localStorage.getItem('searchList');
    if (searchList !== null) {
      this.searchList = JSON.parse(searchList);
      this.searchList.sort();
    }
    ///////////////////////////////////////////////////
    let archivados = window.localStorage.getItem('archivados');
    if (archivados !== null) {
      this.archivados = new Set(archivados.split(','));
    }
    ///////////////////////////////////////////////////
    let folder = window.localStorage.getItem('folder');
    this.folder = this.folders.includes(folder) ? folder : 'Agrupados';
    ///////////////////////////////////////////////////
    this.$refs.filtro.value = this.$route.params.search ? this.$route.params.search.trim() : '';

    ///////////////////////////////////////////////////

    (async () => {
      let fetchCfg = { method: 'POST', body: this.$route.params.cfg ? this.$route.params.cfg.trim() : 'info' };
      let result = await (await fetch('https://us-central1-jobwus-5f24c.cloudfunctions.net/getData2', fetchCfg)).text();
      //let result = await (await fetch('http://localhost:5001/jobwus-5f24c/us-central1/getData2', fetchCfg)).text();
      let uncompress = lzString.decompressFromBase64(result);
      this.result = JSON.parse(uncompress);
      this.query();
    })();
  },
};
</script>
<style>
.searchList2 {
  position: relative;
  top: -0.26em;
  padding: 0;
  outline: none;
  border-radius: var(--radio);
}
.searchList {
  margin: 0 4px 0 2px;
  position: relative;
  width: calc(100% - 188px);
  top: -5px;
  padding: 0;
  cursor: pointer;
  border-radius: var(--radio);
}
.button-icon {
  margin: 0.2em;
  cursor: pointer;
}
.oferta-num {
  padding: 0.2em;
  font-size: 0.8em;
  position: relative;
  background: black;
  color: white;
  border-radius: 50%;
}
.voice-stop {
  cursor: pointer;
  position: fixed;
  bottom: 1em;
  right: 1em;
  padding: 1em;
  border-radius: 50%;
  background-color: #f00;
  color: #fff;
}

.voice-prepare {
  -webkit-animation-name: color-transition;
  animation-name: color-transition;
  -webkit-animation-duration: 0.5s;
  animation-duration: 0.5s;
  -webkit-animation-direction: alternate;
  animation-direction: alternate;
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
}

@keyframes color-transition {
  0% {
    background-color: red;
  }
  50% {
    background-color: rgba(255, 0, 0, 0.2);
  }
  100% {
    background-color: red;
  }
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-button {
  position: relative;
  top: 3px;
  padding-left: 4px;
  cursor: pointer;
}
.status {
  /*fix*/
  display: none !important;
}
.close-modal {
  z-index: 10000;
  width: 28px;
  padding: 2px 2px 0 0;
  top: 6px;
  position: relative;
  left: -44px;
  float: right;
  background: transparent;
  color: white;
  cursor: pointer;
  border: none;
  background: red;
  border-radius: 50%;
}
.modal-container {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 107%;
  background: rgba(0, 0, 0, 0.75);
  z-index: 9999;
}
.noEvents {
  pointer-events: none !important;
}
.modal {
  box-shadow: var(--menu-background);
  max-width: 640px;
  max-height: 480px;
  margin: 0 20px;
  position: relative;
  left: -10px;
  padding: 0.5em;
  border-radius: var(--radio);
  background: var(--menu-background);
  border: 1px solid var(--color);
  z-index: 9999;
}

.menu-button {
  cursor: pointer;
}
.filtro {
  position: fixed;
  width: 100%;
  left: 0;
  right: 0;
  top: 0;
  text-align: center;
  background: var(--menu-background);
  z-index: 1;
}
.filtroIn {
  width: 100%;
  max-width: var(--page-max-width);
  padding: 0.5em 0 0.1em;
}
.filtro select {
  font-size: 1em;
}
.filtro h4 {
  padding: 0 4px 0 0;
  font-weight: bolder;
  margin: 0 0.3em;
  display: inline-block;
  position: relative;
  top: -3px;
}

.filtro div {
  margin-right: 4px;
  text-align: center;
  display: inline-block;
}
.filtro input {
  border-radius: var(--radio);
  background: var(--background-input);
  width: calc(100% - 198px);
  padding: 1px 0.33em 0px;
  position: relative;
  top: -4px;
  margin-left: 4px;
  outline: none;
  border: 1px solid var(--background-color);
  color: var(--background-color);
}
.filtro div span {
  border: none;
  color: var(--color);
  position: relative;
  top: 1px;
}
</style>
