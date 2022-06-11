<template>
  <div class="container">
    <div class="filtro">
      <div class="filtroIn">
        <div class="cell" @click="modal = !modal">
          <dots-vertical-icon class="menu-button" />
          <!-- <account-icon class="menu-button"/> -->
        </div>
        <div class="cell">
          <select v-model="folder" class="searchList2">
            <option v-for="item in folders" :value="item" :key="item" :selected="item === folder">{{ item }}</option>
          </select>
          <undo-icon class="button-icon" @click="doUndo" />
          <redo-icon class="button-icon" @click="doRedo" />
          <archive-plus-outline-icon class="button-icon" @click="addSearch" />
          <archive-remove-outline-icon class="button-icon" @click="removeSearch" />
        </div>
        <div class="cell">
          <input autocapitalize="none" spellcheck="false" @keyup.enter="query" ref="filtro" placeholder="" />
          <select class="searchList" ref="searchList" @change="setSearch()">
            <option></option>
            <option v-for="item in searchList" :key="item" :selected="searchListSelect === item">
              {{ item }}
            </option>
          </select>
        </div>
        <div class="cell" @click="query">
          <magnify-icon class="menu-button" />
        </div>
      </div>
    </div>
    <div :class="{ noEvents: modal }">
      <div @scroll="scroll" id="ofertas" ref="ofertasDiv">
        <div v-if="!loading" class="container">
          <div style="margin: 0 auto; padding: 0 10px 10px; font-size: 0.8em">
            <span v-if="resultView !== null"> {{ result.pages.length }}&nbsp;resultados, {{ result.clusters.reduce((p, c) => p + (c.length > 1 ? c.length - 1 : 0), 0) }}&nbsp;similares, {{ resultView.pages.filter((p) => favoritos.has(p.id)).length }}&nbsp;Favoritos, {{ resultView.pages.filter((p) => archivados.has(p.id)).length }}&nbsp;Archivados</span>
            <span v-if="result !== null" style="float: right; line-height: 1.5em">Actualizado&nbsp;el&nbsp;{{ new Date(result.updateTime).toLocaleDateString() }}&nbsp;{{ new Date(result.updateTime).toLocaleTimeString().substring(0, 5) }}</span>
            <div style="clear: both"></div>
          </div>
          <div v-for="item in resultView.pages" :key="item.id">
            <!-- grupo:{{ item.grupo }} ------ hidden:{{ item.hidden }} ---- hiddenPage:{{ item.hiddenPage }} ---- archivado:{{ archivados.has(item.id) }} ---- favorito:{{ favoritos.has(item.id) }} -->

            <oferta
              v-if="item.hiddenPage > 0 && item.hiddenPage < paginaSize && ((!item.hidden && folder === 'Agrupados' && !archivados.has(item.id)) || (folder === 'Favoritos' && favoritos.has(item.id)) || (folder === 'Archivados' && archivados.has(item.id)) || folder === 'Todos')"
              :archivados="archivados"
              :favoritos="favoritos"
              :speechSupport="speechSupport"
              :folder="folder"
              :itemFocus="itemFocus"
              @voiceSpeak="voiceSpeak"
              @favorite="favorite"
              @archive="archive"
              @goto="goto"
              @focus="focus"
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
          <div id="footer"></div>
        </div>
        <div v-else class="loading">
          <loading />
        </div>
      </div>
    </div>
    <div class="modal-container" v-show="modal" @click="modal = false">
      <div @click.stop.prevent="" style="margin-right: -32px">
        <button class="close-modal" @click="modal = false" title="Cerrar"><close-icon /></button>
        <div class="modal" :style="`height: ${height - (50 * (height - 180)) / 200}px`">
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
import AccountIcon from 'vue-material-design-icons/Account.vue';

import Oferta from '../components/Oferta.vue';
import Loading from '../components/Loading.vue';
import _smartPhone from 'detect-mobile-browser';
import Config from '../components/Config.vue';
import Speech from 'speak-tts';

const speech = new Speech();

let SmartPhone = _smartPhone(false);

export default {
  components: { ArchiveArrowUpOutlineIcon, ArchiveRemoveOutlineIcon, ArchivePlusOutlineIcon, UndoIcon, RedoIcon, Oferta, MagnifyIcon, DotsVerticalIcon, CloseIcon, Loading, Config, AccountTieVoiceOffOutlineIcon, AccountIcon },
  name: 'Ofertas',
  data() {
    return {
      prepareVoice: false,
      stopVoice: false,
      voiceList: [],
      voice: '',
      voiceSpeed: 1,
      y: 0,
      itemFocus: '123',
      idAjustado: null,
      speechSupport: this.voice !== '' && speech.hasBrowserSupport(),
      folders: ['Agrupados', 'Favoritos', 'Archivados', 'Todos'],
      folder: 'Favoritos',
      loading: true,
      modal: false,
      filtroFinal: [],
      filtroFinalPlus: [],
      result: null,
      resultView: null,
      paginaSize: 20,
      archivados: new Set(),
      favoritos: new Set(),
      searchList: [],
      searchListSelect: null,
      undo: [],
      redo: [],
      height: 0,
      searchClick: true,
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
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },

  methods: {
    resize() {
      const orientation = window.screen.orientation.type;
      if (orientation === 'portrait-primary') {
        this.height = window.innerHeight;
      } else if (orientation === 'landscape-primary') {
        this.height = window.innerHeight;
      }
      console.log('Height', this.height);
    },
    focus(id) {
      this.itemFocus = id;
      this.$forceUpdate();
    },
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    scroll(ev) {
      //this.handleDebouncedScroll = debounce(this.handleScroll, 500);
      let target = ev.target;
      //console.log(target.scrollTop, target.clientHeight, target.scrollHeight);
      if (target.scrollTop + target.clientHeight + 240 >= target.scrollHeight) {
        this.paginaSize = this.paginaSize + 20;
      }
    },
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
          window.localStorage.setItem('favoritos', Array.from(this.favoritos).join(','));
        } else if (lastRedo.type === 'unfavorite') {
          this.favoritos.add(lastRedo.id);
          window.localStorage.setItem('favoritos', Array.from(this.favoritos).join(','));
        } else if (lastRedo.type === 'archive') {
          this.archivados.delete(lastRedo.id);
          window.localStorage.setItem('archivados', Array.from(this.archivados).join(','));
        } else if (lastRedo.type === 'unarchive') {
          this.archivados.add(lastRedo.id);
          window.localStorage.setItem('archivados', Array.from(this.archivados).join(','));
        }
        if (this.folder === 'Agrupados') this.updateHidden(this.resultView);

        this.$forceUpdate();
      }
    },
    doUndo() {
      let lastUndo = this.undo.pop();
      if (lastUndo !== undefined) {
        this.redo.push(lastUndo);
        if (lastUndo.type === 'favorite') {
          this.favoritos.add(lastUndo.id);
          window.localStorage.setItem('favoritos', Array.from(this.favoritos).join(','));
        } else if (lastUndo.type === 'unfavorite') {
          this.favoritos.delete(lastUndo.id);
          window.localStorage.setItem('favoritos', Array.from(this.favoritos).join(','));
        } else if (lastUndo.type === 'archive') {
          this.archivados.add(lastUndo.id);
          window.localStorage.setItem('archivados', Array.from(this.archivados).join(','));
        } else if (lastUndo.type === 'unarchive') {
          this.archivados.delete(lastUndo.id);
          window.localStorage.setItem('archivados', Array.from(this.archivados).join(','));
        }
        if (this.folder === 'Agrupados') this.updateHidden(this.resultView);
        this.$forceUpdate();
      }
    },
    setSearch(query = false) {
      this.searchListSelect = this.$refs.searchList.value;
      this.$refs.filtro.value = this.searchListSelect;
      window.localStorage.setItem('searchListSelect', this.searchListSelect);
      if (query) this.query();
    },
    trimPlus() {
      let newValue = this.$refs.filtro.value
        .toLowerCase()
        .replace(/[^\d\wáéíóúüñ,\+\s]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ', ')
        .trim();
      this.$refs.filtro.value = newValue;
    },

    addSearch() {
      this.trimPlus();
      let search = this.$refs.filtro.value;
      if (this.searchList.indexOf(search) === -1) {
        if (search.length > 0) {
          this.searchList.push(search);
          this.searchList.sort();
        }
        this.searchListSelect = search;
        this.$forceUpdate();
        window.localStorage.setItem('searchList', JSON.stringify(this.searchList));
      }
    },
    removeSearch() {
      let search = this.searchListSelect;
      if (search.length > 0 && confirm(`¿Elimino: ${search}?`)) {
        let index = this.searchList.indexOf(search);
        this.searchList.splice(index, 1);
        this.$forceUpdate();
        window.localStorage.setItem('searchList', JSON.stringify(this.searchList));
      }
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
    goto(id, collapsed) {
      const element = document.getElementById(id);
      if (collapsed) {
        let countInterval = 0;
        this.idAjustado = id;
      }
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
      let resultBuild;
      if (this.filtroFinal.length === 0) {
        resultBuild = this.result;
      } else {
        resultBuild = {
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
      }
      this.updateHidden(resultBuild);
      this.resultView = resultBuild;
      //////////////////////////////////////////////////////////////////

      try {
        this.$refs.ofertasDiv.scrollTop = 0;
      } catch (error) {
        console.log(error);
      }

      this.loading = false;
      this.paginaSize = 20;

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
      let paginationHideCount = 0;
      if (this.folder === 'Agrupados') {
        for (let page of data.pages) {
          //Si es una pagina agrupada
          if (page.grupo !== null) {
            //Si ya se registro el grupo
            if (firstGroup.has(page.grupo)) {
              page.hidden = true;
              page.hiddenPage = 0;
            } //Si no se registro el grupo
            else {
              if (this.archivados.has(page.id)) {
                page.hidden = true;
              } else {
                firstGroup.add(page.grupo);
                page.hidden = false;
                paginationHideCount++;
                page.hiddenPage = paginationHideCount;
              }
            }
          } else {
            page.hidden = false;
            if (!this.archivados.has(page.id)) {
              paginationHideCount++;
              page.hiddenPage = paginationHideCount;
            }
          }
        }
      } else if (this.folder === 'Favoritos') {
        for (let page of data.pages) {
          if (!this.favoritos.has(page.id)) {
            page.hidden = true;
          } else {
            page.hidden = false;
            paginationHideCount++;
            page.hiddenPage = paginationHideCount;
          }
        }
      } else if (this.folder === 'Archivados') {
        for (let page of data.pages) {
          if (!this.archivados.has(page.id)) {
            page.hidden = true;
          } else {
            page.hidden = false;
            paginationHideCount++;
            page.hiddenPage = paginationHideCount;
          }
        }
      } else {
        for (let page of data.pages) {
          page.hidden = false;
          paginationHideCount++;
          page.hiddenPage = paginationHideCount;
        }
      }
    },

    filtrar(id) {
      let data = this.result.data[id];
      if (this.filtroFinal.length === 0) return true;
      let words = this.filtroFinal.map((word) => this.normalizeText(word));
      let words2 = this.filtroFinalPlus.map((word) => this.normalizeText(word));

      let text = this.normalizeText(data.titulo + ' ' + data.descripcion);
      text = ' ' + text + ' ';
      if (words2.length > 0) {
        let rgx = '[^a-zA-Z]+(' + words2.map((w) => w.replace(/\s+/g, '[^a-zA-Z]+')).join('[^a-zA-Z]+|') + '[^a-zA-Z]+)+';
        let found = text.match(new rgx(rgx, 'gi')) !== null;
        if (found) {
          return true;
        }
      } else {
        let rgx = '[^a-zA-Z]+(' + words.map((w) => w.replace(/\s+/g, '[^a-zA-Z]+')).join('[^a-zA-Z]+|') + '[^a-zA-Z]+)+';
        let found = text.match(new RegExp(rgx, 'gi')) !== null;
        if (found) {
          return true;
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
    window.addEventListener('resize', this.resize);
    this.resize();
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
      this.searchList = JSON.parse(searchList).filter((n) => n !== '');
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
      try {
        let result = await (await fetch('https://us-central1-jobwus-5f24c.cloudfunctions.net/getData2', fetchCfg)).text();
        //let result = await (await fetch('http://localhost:5001/jobwus-5f24c/us-central1/getData2', fetchCfg)).text();
        let uncompress = lzString.decompressFromBase64(result);
        this.result = JSON.parse(uncompress);
        this.query();
      } catch (error) {
        this.loading = false;
        this.$forceUpdate();
        console.error(error);
        this.notification(error, 'error');
      }
    })();
  },
};
</script>
<style>
#ofertas {
  position: fixed;
  margin: 0 auto;
  top: var(--body-margin-top);
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: scroll;
  padding-top: 0.6em;
}
#footer {
  min-height: 480px;
}
.cell {
  margin: 0.3em 0.2em 0.1em 0.3em;
}

.searchList2 {
  position: relative;
  padding: 0;
  outline: none;
  border-radius: var(--radio);
}
.searchList {
  position: relative;
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
.status {
  /*fix*/
  display: none !important;
}
.close-modal {
  z-index: 10000;
  width: 28px;
  padding: 2px 2px 0 0;
  top: 0px;
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
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  box-shadow: rgba(50, 50, 93, 0.6) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.6) 0px 18px 36px -18px inset;
}
.noEvents {
  pointer-events: none !important;
}

.modal {
  overflow-y: auto;
  box-shadow: var(--menu-background);
  max-width: 720px;
  margin: 0 60px 0 34px !important;
  padding: 1em;

  border-radius: var(--radio);
  background: var(--menu-background);
  border: 1px solid var(--color);
  z-index: 9999;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;
}

.modal-container div {
  top: 0px;
  left: -10px;
  padding: 8px;
  max-width: 640px;
}

.menu-button {
  cursor: pointer;
  position: relative;
  top: 0.9em !important;
  left: -0.15em;
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
  position: relative;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 32px 152px 1fr 32px;
  max-width: calc(var(--page-max-width) - 42px);
}
.filtro select,
.filtro input {
  margin-bottom: 0.2em;
  width: 100%;
  font-size: 1em;
  user-select: none;
}
.filtro h4 {
  padding: 0 4px 0 0;
  font-weight: bolder;
  margin: 0 0.3em;
  display: inline-block;
  position: relative;
  top: -3px;
}

.filtro input {
  border-radius: var(--radio);
  background: var(--background-input);
  outline: none;
  width: calc(100% - 6px);
  border: 1px solid var(--background-color);
  color: var(--background-color);
}
.filtro div span {
  border: none;
  color: var(--color);
  position: relative;
}
</style>
