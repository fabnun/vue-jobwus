<template>
  <div class="container" @keydown.alt.up.prevent="up" @keydown.alt.down.prevent="down" tabindex="0">
    <div class="filtro">
      <div class="filtroIn">
        <div
          class="cell"
          @click="
            modalType = 'config';
            modal = !modal;
          "
        >
          <dots-vertical-icon class="menu-button" />
          <!-- <account-icon class="menu-button"/> -->
        </div>
        <div class="cell">
          <select v-model="folder" class="searchList2">
            <option v-for="item in folders" :value="item" :key="item" :selected="item === folder">{{ item }}</option>
          </select>
          <undo-icon class="button-icon" @click="doUndo" />
          <redo-icon class="button-icon" @click="doRedo" />
          <playlist-plus-icon class="button-icon" @click="addFiltro" />
          <playlist-edit-icon class="button-icon" @click="editFiltro" />
        </div>
        <div class="cell">
          <input
            autocapitalize="none"
            spellcheck="false"
            @blur="resize"
            @keyup.enter="
              loading = true;
              $forceUpdate();
              localSetItem('filtro', $refs.filtro.value.trim());
              setURL(true);
              query();
            "
            ref="filtro"
            placeholder="ej: java, node"
          />

          <select class="searchList" ref="searchList" @change="setSearch">
            <option value="">- Tus Filtros -</option>
            <option v-for="item in searchList" :key="item" :selected="searchListSelect === item">
              {{ item }}
            </option>
          </select>
        </div>
        <div
          class="cell"
          @click="
            loading = true;
            $forceUpdate();
            localSetItem('filtro', $refs.filtro.value.trim());
            setURL(true);
            query();
          "
        >
          <magnify-icon class="menu-button" />
        </div>
      </div>
    </div>
    <div :class="{ noEvents: modal }">
      <div @scroll="scroll" id="ofertas" ref="ofertasDiv">
        <div v-if="!loading" class="container">
          <div v-if="resultView !== null">
            <div style="margin: 0 auto; padding: 0 10px 10px; font-size: 0.8em">
              <span v-if="result !== null"> {{ result.pages.length }}&nbsp;resultados, {{ result.clusters.reduce((p, c) => p + (c.length > 1 ? c.length - 1 : 0), 0) }}&nbsp;similares, {{ result.pages.filter((p) => favoritos.has(p.id)).length }}&nbsp;Favoritos, {{ result.pages.filter((p) => archivados.has(p.id)).length }}&nbsp;Archivados</span>
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
                @focus="focus"
                :data="resultView.data[item.id]"
                :id="item.id"
                :voice2="voice"
                :ignorarTildes="$store.state.ignorarTildes"
                :filtro="filtroFinal"
                :filtroOpcional="filtroOpcional"
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
          </div>
          <div id="footer"></div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading">
      <loading />
    </div>
    <div class="modal-container" v-show="modal">
      <div @click.stop.prevent="" style="margin-right: -32px">
        <button class="close-modal" @click="modal = false" title="Cerrar"><close-icon /></button>
        <div class="modal" :style="`width: ${width}px; height: ${height - (50 * (height - 180)) / 200}px`">
          <config @setVoice="setVoice" @setSpeed="setSpeed" :voiceList="voiceList" v-if="modalType === 'config' && result !== null" :words="result.config.okWords.join(', ')"></config>

          <div v-show="modalType === 'editSearch' || modalType === 'editSearch2'" class="edit-search">
            Nombre del filtro de búsqueda<br />
            <input type="text" @blur="resize" ref="filter" autocapitalize="none" spellcheck="false" />
            <br />
            Palabras claves buscadas<br />
            <textarea ref="words" @blur="resize" rows="3" autocapitalize="none" spellcheck="false"></textarea>
            <br />
            Palabras claves Opcionales<br />
            <textarea ref="wordsHave" @blur="resize" rows="4" autocapitalize="none" spellcheck="false"></textarea>
            <!-- <br />
            Palabras claves Kill<br />
            <textarea ref="wordsRemove" rows="2" autocapitalize="none" spellcheck="false"></textarea>
            <br />
            Palabras claves Positivas<br />
            <textarea ref="wordsPositive" rows="2" autocapitalize="none" spellcheck="false"></textarea>
            <br />
            Palabras claves Negativas<br />
            <textarea ref="wordsNegative" rows="2" autocapitalize="none" spellcheck="false"></textarea>
            <br /> -->
            <BUTTON @click="guardarFiltro">Guardar {{ modalType === 'editSearch2' ? 'Nuevo' : '' }}</BUTTON>
            <BUTTON v-if="modalType === 'editSearch'" @click="eliminarFiltro">Eliminar</BUTTON>
          </div>
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
import AccountIcon from 'vue-material-design-icons/Account.vue';
import PlaylistEditIcon from 'vue-material-design-icons/PlaylistEdit.vue';
import PlaylistPlusIcon from 'vue-material-design-icons/PlaylistPlus.vue';

import Oferta from '../components/Oferta.vue';
import Loading from '../components/Loading.vue';
import _smartPhone from 'detect-mobile-browser';
import Config from '../components/Config.vue';
import Speech from 'speak-tts';
//import chalk from 'chalk';

const speech = new Speech();

let SmartPhone = _smartPhone(false);

export default {
  components: { PlaylistEditIcon, PlaylistPlusIcon, UndoIcon, RedoIcon, Oferta, MagnifyIcon, DotsVerticalIcon, CloseIcon, Loading, Config, AccountTieVoiceOffOutlineIcon, AccountIcon },
  name: 'Ofertas',
  data() {
    return {
      /**Usado en boton para apagar la lectura*/
      prepareVoice: false,
      /**Usado en boton para apagar la lectura*/
      stopVoice: false,
      /**Lista de voces en español disponibles*/
      voiceList: [],
      /**Voz actual*/
      voice: '',
      /**Velocidad de lectura actual*/
      voiceSpeed: 1,
      /**oferta que tiene el foco*/
      itemFocus: null,
      /**Oferta anterior que tuvo el foco*/
      lastItemFocus: null,
      /**Expresion regular del filtro */
      rgx: '',
      speechSupport: this.voice !== '' && speech.hasBrowserSupport(),
      folders: ['Agrupados', 'Favoritos', 'Archivados', 'Todos'],
      folder: 'Favoritos',
      loading: true,
      modal: false,
      modalType: 'editSearch',
      filtroFinal: [],
      filtroOpcional: [],
      result: null,
      resultView: null,
      paginaSize: 20,
      archivados: new Set(),
      favoritos: new Set(),
      searchList: [],
      searchConfig: {},
      searchListSelect: null,
      undo: [],
      redo: [],
      width: 1200,
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
      this.localSetItem('folder', this.folder);
    },
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    up() {
      let lastArchivedIndex = this.itemFocus ? this.resultView.pages.findIndex((page, idx) => page.id === this.itemFocus) : 0;
      let nextFocus = undefined;
      for (let i = lastArchivedIndex - 1; i > 0; i--) {
        if (this.resultView.pages[i].hidden === false && !this.archivados.has(this.resultView.pages[i].id)) {
          nextFocus = this.resultView.pages[i];
          break;
        }
      }
      if (nextFocus !== undefined) {
        this.focus(nextFocus.id);
      }
    },
    down() {
      let lastArchivedIndex = this.itemFocus ? this.resultView.pages.findIndex((page, idx) => page.id === this.itemFocus) : 0;
      let nextFocus = undefined;
      for (let i = lastArchivedIndex + 1; i < this.resultView.pages.length; i++) {
        if (this.resultView.pages[i].hidden === false && !this.archivados.has(this.resultView.pages[i].id)) {
          nextFocus = this.resultView.pages[i];
          break;
        }
      }
      if (nextFocus !== undefined) {
        this.focus(nextFocus.id);
      }
    },
    resize() {
      setTimeout(() => {
        const orientation = window.screen.orientation.type;
        if (this.width !== window.innerWidth - 120) this.width = window.innerWidth - 120;
        if (this.height !== window.innerHeight) this.height = window.innerHeight;
      }, 1000);
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
    voiceSpeak(id) {
      if (!this.resultView.pages.find((page) => page.id === id).hidden) {
        this.focus(id);
      }

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
      } catch (error) {
        console.error(error);
      }
    },
    focus(id, undo = true) {
      if (this.itemFocus !== id) {
        this.lastItemFocus = this.itemFocus;
        if (undo) {
          this.undo.push({ type: 'focus', id });
          this.showUndoRedo('focus');
        }
        this.itemFocus = undefined;
        this.$forceUpdate();
        setTimeout(() => {
          this.goto(id);
          this.itemFocus = id;
          this.$forceUpdate();
        }, 1);
      }
    },
    showUndoRedo(msg) {
      // console.log(
      //   msg,
      //   this.undo.reduce((acc, cur) => acc + '\n' + cur.type + ' ' + cur.id, 'UNDO:')
      // );
      // console.log(
      //   msg,
      //   this.redo.reduce((acc, cur) => acc + '\n' + cur.type + ' ' + cur.id, 'REDO:')
      // );
      // console.log('---------------------------------------------');
    },
    favorite(id) {
      let data = this.result.pages.find((item) => item.id === id);
      if (id !== this.itemFocus && data !== undefined && data.hidden === false) {
        this.focus(id);
      }
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
      this.showUndoRedo('favorite');
      this.$forceUpdate();
      this.localSetItem('favoritos', Array.from(this.favoritos).join(','), true);
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
          this.undo.push({ type: 'focus', id });
          this.undo.push({ type: 'unarchive', id });
        }

        //Cuando archiva una oferta visible
        if (this.folder === 'Agrupados' && (this.itemFocus === null || (this.itemFocus === id && this.archivados.has(id)))) {
          let lastArchivedIndex = this.resultView.pages.findIndex((page, idx) => page.id === id);
          const este = this;
          let nextFocus = this.resultView.pages.find(function (page, idx) {
            return !este.archivados.has(page.id) && page.hidden === false && idx > lastArchivedIndex;
          });
          if (nextFocus === undefined) {
            for (let i = lastArchivedIndex; i > 0; i--) {
              if (this.resultView.pages[i].hidden === false && !this.archivados.has(this.resultView.pages[i].id)) {
                nextFocus = this.resultView.pages[i].id;
                break;
              }
            }
          }

          this.updateHidden(this.resultView);
          //console.log('now', this.resultView.data[nextFocus.id].titulo, Date.now());
          this.focus(nextFocus.id);
        }
      }
      this.showUndoRedo('archive');
      this.updateHidden(this.resultView);
      this.$forceUpdate();
      this.localSetItem('archivados', Array.from(this.archivados).join(','), true);
    },
    doRedo() {
      let lastRedo = this.redo.pop();
      if (lastRedo !== undefined) {
        this.undo.push(lastRedo);
        if (lastRedo.type === 'favorite') {
          this.favoritos.delete(lastRedo.id);
          this.localSetItem('favoritos', Array.from(this.favoritos).join(','), true);
        } else if (lastRedo.type === 'unfavorite') {
          this.favoritos.add(lastRedo.id);
          this.localSetItem('favoritos', Array.from(this.favoritos).join(','), true);
        } else if (lastRedo.type === 'archive') {
          this.archivados.delete(lastRedo.id);
          if (!this.redo.length > 0) {
            this.doRedo();
          }
          this.localSetItem('archivados', Array.from(this.archivados).join(','), true);
        } else if (lastRedo.type === 'unarchive') {
          this.archivados.add(lastRedo.id);
          if (!this.redo.length > 0) {
            this.doRedo();
          }
          this.localSetItem('archivados', Array.from(this.archivados).join(','), true);
        } else if (lastRedo.type === 'focus') {
          if (this.itemFocus !== lastRedo.id) {
            this.focus(lastRedo.id, false);
          } else this.doRedo();
        }
        if (this.folder === 'Agrupados') this.updateHidden(this.resultView);
        this.showUndoRedo('doRedo');
        this.$forceUpdate();
      }
    },
    doUndo() {
      let lastUndo = this.undo.pop();
      if (lastUndo !== undefined) {
        this.redo.push(lastUndo);
        if (lastUndo.type === 'favorite') {
          this.favoritos.add(lastUndo.id);
          this.localSetItem('favoritos', Array.from(this.favoritos).join(','), true);
        } else if (lastUndo.type === 'unfavorite') {
          this.favoritos.delete(lastUndo.id);
          this.localSetItem('favoritos', Array.from(this.favoritos).join(','), true);
        } else if (lastUndo.type === 'archive') {
          this.archivados.add(lastUndo.id);
          if (!this.undo.length > 0) {
            this.doUndo();
          }
          this.localSetItem('archivados', Array.from(this.archivados).join(','), true);
        } else if (lastUndo.type === 'unarchive') {
          this.archivados.delete(lastUndo.id);
          if (!this.undo.length > 0) {
            this.doUndo();
          }
          this.localSetItem('archivados', Array.from(this.archivados).join(','), true);
        } else if (lastUndo.type === 'focus') {
          if (this.itemFocus !== lastUndo.id) {
            this.focus(lastUndo.id, false);
          } else this.doUndo();
        }
        if (this.folder === 'Agrupados') this.updateHidden(this.resultView);
        this.showUndoRedo('doUndo');
        this.$forceUpdate();
      }
    },
    addFiltro() {
      this.modalType = 'editSearch2';
      this.modal = true;
      this.$refs.words.value = this.$refs.filtro.value;
      this.$refs.filter.value = 'filtro' + Date.now();
      setTimeout(() => {
        this.$refs.words.focus();
      }, 200);
    },
    editFiltro() {
      if (this.searchListSelect !== '') {
        this.$refs.words.value = this.searchConfig[this.searchListSelect].filtro ? this.searchConfig[this.searchListSelect].filtro : '';
        this.$refs.wordsHave.value = this.searchConfig[this.searchListSelect].obligatorio ? this.searchConfig[this.searchListSelect].obligatorio : '';
        this.$refs.filter.value = this.searchListSelect;
        this.modalType = 'editSearch';
        this.modal = true;
        setTimeout(() => {
          this.$refs.words.focus();
        }, 200);
      } else {
        this.notification('Seleccione un filtro para editar o cree un filtro nuevo.');
      }
    },

    eliminarFiltro() {
      let name = this.$refs.filter.value.trim();
      if (name !== '') {
        if (confirm('esta seguro de eliminar el filtro ' + name + '?')) {
          delete this.searchConfig[name];
          this.searchList = Object.keys(this.searchConfig);
          this.localSetItem('searchConfig', JSON.stringify(this.searchConfig));
          this.searchListSelect = '';
          this.modal = false;
          this.$forceUpdate();
        }
      }
    },
    guardarFiltro() {
      let name = this.$refs.filter.value.trim();
      let value = this.limpiarTexto(this.$refs.words.value.trim());
      if (name.length > 0) {
        let obligatorio = this.limpiarTexto(this.$refs.wordsHave.value.trim());
        //console.log('obligatorio', obligatorio);

        this.searchConfig[name] = {
          filtro: value,
          obligatorio,
        };
        this.searchList = Object.keys(this.searchConfig);
        this.searchListSelect = name;
        this.$refs.filtro.value = value;
        this.localSetItem('searchConfig', JSON.stringify(this.searchConfig));
        this.modal = false;
      } else {
        this.notification('ingrese el nombre del filtro');
      }
    },

    setSearch(event) {
      this.searchListSelect = this.$refs.searchList.value;
      if (this.searchListSelect === '') {
        this.$refs.filtro.value = '';
      } else {
        this.$refs.filtro.value = this.searchConfig[this.searchListSelect].filtro;
      }
      this.localSetItem('searchListSelect', this.searchListSelect);
    },

    limpiarTexto(val) {
      let newValue = val
        .toLowerCase()
        .replace(/[^\d\wáéíóúüñ,\(\)\?\|\s|\¿]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ', ')
        .trim();
      //console.log(val + ' -> ' + newValue);
      return newValue;
    },

    addSearch() {
      this.$refs.filtro.value = this.limpiarTexto(this.$refs.filtro.value);
      let search = this.$refs.filtro.value;
      if (this.searchList.indexOf(search) === -1) {
        if (search.length > 0) {
          this.searchList.push(search);
          this.searchList.sort();
        }
        this.searchListSelect = search;
        this.$forceUpdate();
      }
    },

    query() {
      this.$refs.filtro.value = this.limpiarTexto(this.$refs.filtro.value);
      this.searchListSelect = this.localGetItem('searchListSelect');
      this.searchListSelect = this.searchListSelect ? this.searchListSelect : '';

      this.submit();
    },

    submit() {
      this.itemFocus = null;
      this.lastItemFocus = null;

      this.undo = [];
      this.redo = [];
      let search = '';

      //Obtiene la búsqueda de la url
      search = this.$route.params.search;
      //invierte los signos de pregunta para poder usar ? en la url
      search = search ? search.replace(/¿/g, '?').trim() : '';

      //Obtiene la configuración de la url
      let cfg = this.$route.params.cfg;
      cfg = cfg ? cfg.trim() : 'info';

      if (this.$store.state.ignorarTildes) {
        search = this.quitarTildes(search);
      }
      this.localSetItem('filtro', search);
      let final = this.normalizeText(search.toLowerCase())
        .replace(/\s+/, ' ')
        .split(',')
        .map((word) => word.trim())
        .filter((word) => word !== '');

      this.filtroFinal = final;
      let words = this.filtroFinal.map((word) => this.normalizeText(word));

      // console.log('searchListSelect 2', this.searchListSelect);
      // console.log('searchConfig 2', JSON.stringify(this.searchConfig));

      if (this.searchListSelect !== '' && this.searchConfig[this.searchListSelect] !== undefined && this.searchConfig[this.searchListSelect].obligatorio) {
        let search2 = this.searchConfig[this.searchListSelect].obligatorio;
        if (this.$store.state.ignorarTildes) {
          search2 = this.quitarTildes(search2);
        }
        this.filtroOpcional = this.normalizeText(search2.toLowerCase())
          .replace(/\s+/, ' ')
          .split(',')
          .map((word) => word.trim())
          .filter((word) => word !== '');
      } else {
        this.filtroOpcional = [];
      }
      //console.log(this.filtroFinal);
      //console.log(this.filtroOpcional);

      this.rgx = '([^a-z0-9áéíóúüñ]+)(' + words.map((w) => w.replace(/\s+/g, '([^a-z0-9áéíóúüñ]+)')).join('([^a-z0-9áéíóúüñ]+)|') + '([^a-z0-9áéíóúüñ]+))+';
      //console.log(this.rgx);

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

      // if (this.resultView.pages.length > 0) {
      //   this.focus(this.resultView.pages[0].id);
      // }

      //////////////////////////////////////////////////////////////////

      try {
        this.$refs.ofertasDiv.scrollTop = 0;
      } catch (error) {
        console.log(error);
      }
      setTimeout(() => {
        this.loading = false;
        this.$forceUpdate();
      }, 666);
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
      let text = this.normalizeText(data.titulo + ' ' + data.descripcion);
      text = ' ' + text + ' ';
      let found = text.match(new RegExp(this.rgx, 'gi')) !== null;
      if (found) {
        return true;
      }
      return false;
    },

    normalizeText(text) {
      text = text.toLowerCase();
      if (this.$store.state.ignorarTildes) {
        text = this.quitarTildes(text);
      }
      return text.trim();
    },
    onvoiceschanged(voices) {
      voices = voices.map((v) => v.name);
      voices = voices.filter((v) => v.toLowerCase().indexOf('spanish') > -1 || v.toLowerCase().indexOf('español') > -1);
      voices.unshift('');
      this.voiceList = voices;
      this.voice = this.localGetItem('voice');
      this.voice = this.voice || '';
      this.voiceSpeed = this.localGetItem('voiceSpeed');
      this.voiceSpeed = parseFloat(this.voiceSpeed) || 1;
      this.$forceUpdate();
    },
    setURL(firstLocal = false) {
      let search = this.$refs.filtro.value;
      if (search === '') {
        if (!firstLocal) {
          search = this.$route.params.search;
          if (search === undefined) {
            search = this.localGetItem('filtro');
            search = search ? search : '';
          } else {
            search = search.replace(/\¿/g, '?').trim();
          }
        } else {
          search = this.localGetItem('filtro');
          if (search === undefined) {
            search = this.$route.params.search;
            search = search ? search : '';
          }
        }
      }

      const maxLength = 6500 - search.length;
      if (search.length > maxLength) {
        this.notification(`La búsqueda tiene ${search.length} caracteres y el maximo es 6500 caracteres, la búsqueda se ha truncado`);
        search = search.substring(0, 6500);
      }
      search = search ? search.trim() : '';

      let cfg = this.$route.params.cfg;
      let queryString = '';
      if (cfg === undefined) {
        cfg = this.localGetItem('cfg');
        cfg = cfg ? cfg : 'info';
      } else {
        let oldCfg = this.localGetItem('cfg');
        if (oldCfg !== cfg) {
          this.localSetItem('cfg', cfg);
          search = '';
        }
      }
      this.$refs.filtro.value = search;
      queryString = `/${cfg}${search ? '/' + search.replace(/\?/g, '¿') : ''}`;
      if (queryString !== document.location.pathname) {
        this.$router.push({ path: queryString }).catch(() => {});
      }
    },
  },
  mounted() {
    console.clear();
    this.setURL();
    navigator.virtualKeyboard.overlaysContent = true;

    window.visualViewport.addEventListener('resize', this.resize);
    window.addEventListener('resize', this.resize);
    this.resize();
    let este = this;
    let initVoicesCount = 0;
    let initVoices = () => {
      speech
        .init({
          rate: 1.5,
          splitSentences: false,
          listeners: {
            onvoiceschanged: this.onvoiceschanged,
          },
        })
        .then((data) => {})
        .catch((e) => {
          initVoicesCount++;
          if (initVoicesCount < 4) {
            initVoices();
          } else {
            alert('ERROR\n\n' + JSON.stringify(e));
            console.error('An error occured while initializing : ', e);
          }
        });
    };
    initVoices();

    ///////////////////////////////////////////////////
    let favoritos = this.localGetItem('favoritos', true);
    if (favoritos !== null) {
      this.favoritos = new Set(favoritos.split(','));
    }
    ///////////////////////////////////////////////////
    let archivados = this.localGetItem('archivados', true);
    if (archivados !== null) {
      this.archivados = new Set(archivados.split(','));
    }
    ///////////////////////////////////////////////////

    ///////////////////////////////////////////////////

    let searchConfig = this.localGetItem('searchConfig');
    if (searchConfig === null) {
      let searchList = this.localGetItem('searchList');
      searchConfig = {};
      if (searchList !== null) {
        searchList = JSON.parse(searchList);
        searchList.forEach((search, idx) => {
          searchConfig['filtro' + idx] = {
            filtro: search,
            tipo: 'busqueda',
          };
        });
      } else {
        searchList = [];
      }
      this.searchList = searchList;
      this.searchConfig = searchConfig;
      this.localSetItem('searchConfig', JSON.stringify(searchConfig));
    } else {
      this.searchConfig = JSON.parse(searchConfig);
      this.searchList = Object.keys(this.searchConfig);
    }

    this.searchList.sort();
    this.searchList.forEach((search, idx) => {
      this.searchConfig[search].obligatorio = this.searchConfig[search].obligatorio !== undefined ? this.searchConfig[search].obligatorio : '';
      //console.log(search, idx, this.searchConfig[search], this.searchConfig[search].obligatorio);
    });
    this.searchListSelect = this.localGetItem('searchListSelect');
    this.searchListSelect = this.searchListSelect ? (this.searchConfig[this.searchListSelect] !== undefined ? this.searchListSelect : '') : '';

    let folder = this.localGetItem('folder');
    this.folder = this.folders.includes(folder) ? folder : 'Agrupados';
    ///////////////////////////////////////////////////

    (async () => {
      this.localSetItem('lastFetch', undefined, true);
      let fetchCfg = { method: 'POST', body: this.$route.params.cfg ? this.$route.params.cfg.trim() : 'info' };
      try {
        let result;
        if (!navigator.onLine) {
          //result = this.localGetItem('lastFetch', true);
          este.notification('Sin Conexion... intente despues...', 'error');
        } else {
          result = await (await fetch('https://us-central1-jobwus-5f24c.cloudfunctions.net/getData2', fetchCfg)).text();
          //let result = await (await fetch('http://localhost:5001/jobwus-5f24c/us-central1/getData2', fetchCfg)).text();
          //this.localSetItem('lastFetch', result, true);
        }
        if (result !== undefined) {
          let uncompress = lzString.decompressFromBase64(result);

          let _result = JSON.parse(uncompress);
          const keys = Object.keys(_result.data);

          este.favoritos = new Set([...este.favoritos].filter((f) => keys.includes(f)));
          this.localSetItem('favoritos', [...este.favoritos].join(','), true);

          este.archivados = new Set([...este.archivados].filter((f) => keys.includes(f)));
          this.localSetItem('archivados', [...este.archivados].join(','), true);

          este.result = _result;

          //console.log(uncompress);
        }
      } catch (error) {
        //let result = this.localGetItem('lastFetch', true);
        if (result !== undefined) {
          let uncompress = lzString.decompressFromBase64(result);
          this.result = JSON.parse(uncompress);
          this.notification('Datos recuperados de localstorage', 'info');
        } else {
          this.result = { pages: [] };
        }
        console.error(error);
        this.notification(error, 'error');
      }
      this.$forceUpdate();
      this.loading = false;
      this.query();
    })();
  },
};
</script>
<style>
.edit-search {
  padding-bottom: 440px;
}
.edit-search select,
.edit-search textarea,
.edit-search input {
  padding: 4px;
  width: 100%;
  border-radius: 4px;
  border: none;
  margin: 4px 8px 18px 0px;
}
.edit-search button {
  width: calc(100% + 1px);
  height: 36px;
  background: red;
  border-radius: 4px;
  border: none;
  margin: 4px 8px 18px 0px;
  font-size: 18px;
  cursor: pointer;
}

.edit-search input,
.edit-search textarea {
  width: calc(100% - 8px) !important;
}
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
  margin: 0.1em;
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
  position: fixed;
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
  width: 26px;
  padding: 1px 1px 0 0;
  top: -2px;
  position: relative;
  left: -30px;
  float: right;
  background: transparent;
  color: white;
  cursor: pointer;
  border: none;
  background: rgba(255, 0, 0, 0.5);
  border-radius: 25%;
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
  z-index: 999;
  box-shadow: rgba(50, 50, 93, 0.6) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.6) 0px 18px 36px -18px inset;
}
.noEvents {
  pointer-events: none !important;
}

.modal {
  overflow-y: auto;
  box-shadow: var(--menu-background);
  margin: 0 60px 0 34px !important;
  padding: 1em;
  max-width: 1024px;
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
  grid-template-columns: 32px 122px 1fr 32px;
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
