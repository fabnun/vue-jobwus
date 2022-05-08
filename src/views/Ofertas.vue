<template>
  <div class="container">
    <div class="filtro">
      <div class="filtroIn">
        <dots-vertical-icon class="menu-button" @click="modal = !modal" />
        <h4>JOBWUS</h4>
        <input spellcheck="false" @keyup.enter="submit" ref="filtro" />
        <magnify-icon class="submit-button" @click="submit" />
      </div>
    </div>
    <div :class="{ noEvents: modal }">
      <div v-if="!loading && result !== null">
        <div style="margin: 0 auto; padding: 0 10px 10px">
          <select v-model="folder" style="outline: none; padding: 0; cursor: pointer; border-radius: var(--radio); text-align: center">
            <option v-for="item in folders" :value="item" :key="item" :selected="item === folder">{{ item }}</option>
          </select>
          <span v-if="resultView !== null && folder === 'Agrupados'"> {{ resultView.pages.length }} resultados - {{ resultView.clusters.reduce((p, c) => p + (c.length > 1 ? c.length - 1 : 0), 0) }} similares</span>
          <span v-if="result !== null" style="float: right; font-size: 0.8em; line-height: 1.5em">Actuazado el {{ new Date(result.updateTime).toLocaleDateString() }} {{ new Date(result.updateTime).toLocaleTimeString().substring(0, 5) }}</span>
          <div style="clear: both"></div>
        </div>
        <div v-for="item in resultView.pages" :key="item.id">
          <!-- oculto:{{ item.hidden }} match:{{ filter(item) }} filtros:{{ filtroFinal.length }} grupo:{{ item.grupo }} -->
          <oferta
            :archivados="archivados"
            :favoritos="favoritos"
            :speechSupport="speechSupport"
            :folder="folder"
            :isArchived="archivados.has(item.id)"
            :isFavorite="favoritos.has(item.id)"
            @voiceSpeak="voiceSpeak"
            @favorite="favorite"
            @archive="archive"
            v-if="(folder === 'Agrupados' && !item.hidden && !archivados.has(item.id)) || (folder === 'Favoritos' && favoritos.has(item.id)) || (folder === 'Archivados' && archivados.has(item.id)) || folder === 'Todos'"
            :data="resultView.data[item.id]"
            :id="item.id"
            :ignorarTildes="$store.state.ignorarTildes"
            :filtro="filtroFinal"
            :grupo="
              folder === 'Agrupados'
                ? item.grupo === null
                  ? []
                  : resultView.clusters[item.grupo]
                      .filter((id) => id !== item.id)
                      .map((id) => {
                        return { id, ...resultView.data[id] };
                      })
                : []
            "
          />
        </div>
      </div>
      <div v-if="loading || result === null" class="loading">
        <loading />
      </div>
    </div>
    <div class="modal-container" v-show="modal" @click="modal = false">
      <div @click.stop.prevent="">
        <button style="float: right; background: transparent; color: white; cursor: pointer; border: none" @click="modal = false"><close-icon /></button>
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
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical.vue';
import Oferta from '../components/Oferta.vue';
import Loading from '../components/Loading.vue';
import _smartPhone from 'detect-mobile-browser';
import Config from '../components/Config.vue';
import AccountTieVoiceOffOutlineIcon from 'vue-material-design-icons/AccountTieVoiceOffOutline.vue';
import Speech from 'speak-tts';

const speech = new Speech();
let SmartPhone = _smartPhone(false);

let oldFiltro = null;
export default {
  components: { Oferta, MagnifyIcon, DotsVerticalIcon, CloseIcon, Loading, Config, AccountTieVoiceOffOutlineIcon },
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
      result: null,
      resultView: null,
      archivados: new Set(),
      favoritos: new Set(),
    };
  },
  watch: {
    folder() {
      this.$forceUpdate();
      this.submit();
      window.localStorage.setItem('folder', this.folder);
    },
  },

  updated: function () {
    if (this.result !== null && oldFiltro !== this.filtroFinal.join(',')) {
      oldFiltro = this.filtroFinal.join(',');
      setTimeout(() => {
        this.loading = false;
        if (!SmartPhone.isAny()) {
          this.$refs.filtro.focus();
        } else {
          this.$refs.filtro.blur();
        }
      }, 500);
    }
  },
  methods: {
    setVoice(voice) {
      this.voice = voice;
      this.speechSupport = this.voice !== '' && speech.hasBrowserSupport();
    },
    setSpeed(speed) {
      this.voiceSpeed = parseFloat(speed);
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
      async function wait(delay) {
        return new Promise((resolve) => {
          let finalDelay = Math.trunc(delay);
          setTimeout(resolve, finalDelay);
        });
      }
      await wait(100);

      let fnFixText = (text) => text.replaceAll('(a)', '').replaceAll('(A)', '').replaceAll('/a ', ' ').replaceAll('/as ', ' ').replaceAll('/A ', ' ').replaceAll('/AS ', ' ').replaceAll('(as)', '').replaceAll('(AS)', '');
      try {
        this.stopVoice = true;
        this.prepareVoice = true;
        speech.setVoice(this.voice);
        speech.setRate(this.voiceSpeed);
        let sp = {
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
        };
        console.log(sp);
        speech.speak(sp);
      } catch (error) {}
    },
    favorite(id, recursive = true) {
      if (this.favoritos.has(id)) {
        this.favoritos.delete(id);
      } else {
        this.favoritos.add(id);
      }

      if (recursive && this.folder === 'Agrupados') {
        let este = this;
        this.result.clusters
          .filter((c) => c.includes(id))
          .forEach((c) => {
            c.forEach((id2) => {
              if (id2 !== id) {
                if (este.favoritos.has(id)) {
                  este.favoritos.add(id2);
                } else {
                  este.favoritos.delete(id2);
                }
              }
            });
          });
      }
      this.$forceUpdate();
      window.localStorage.setItem('favoritos', Array.from(this.favoritos).join(','));
    },
    archive(id, recursive = true) {
      if (this.archivados.has(id)) {
        this.archivados.delete(id);
      } else {
        this.archivados.add(id);
      }
      if (recursive && this.folder === 'Agrupados') {
        let este = this;
        this.result.clusters
          .filter((c) => c.includes(id))
          .forEach((c) => {
            c.forEach((id2) => {
              if (id2 !== id) {
                if (este.archivados.has(id)) {
                  este.archivados.add(id2);
                } else {
                  este.archivados.delete(id2);
                }
              }
            });
          });
      }
      this.$forceUpdate();
      window.localStorage.setItem('archivados', Array.from(this.archivados).join(','));
    },
    submit() {
      let text = this.$refs.filtro.value.trim();
      if (this.$store.state.ignorarTildes) {
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      window.localStorage.setItem('filtro', text);
      let final = this.normalizeText(text.toLowerCase())
        .replace(/\s+/, ' ')
        .split(',')
        .map((word) => word.trim())
        .filter((word) => word !== '');

      this.loading = true;
      if (text.length > 0) {
        this.filtroFinal = final;

        //////////////////////////////////////////////////////////////////
        let resultBuild = {
          pages: this.result.pages.filter((item) => this.filter(item.id)),
          data: this.result.data,
          clusters: this.result.clusters.map((cluster) => {
            return cluster.filter((id) => !this.archivados.has(id) && this.filter(id));
          }),
          config: this.result.config,
          updateTime: this.result.updateTime,
        };
        let firstGroup = new Set();
        for (let page of resultBuild.pages) {
          if (page.grupo !== null) {
            if (firstGroup.has(page.grupo)) {
              page.hidden = true;
            } else {
              page.hidden = false;
              firstGroup.add(page.grupo);
            }
          }
        }
        //////////////////////////////////////////////////////////////////
        this.resultView = resultBuild;
        window.scrollTo(0, 0);
        setTimeout(() => {
          this.loading = false;
          if (!SmartPhone.isAny()) {
            this.$refs.filtro.focus();
          } else {
            this.$refs.filtro.blur();
          }
        }, 250);
      } else {
        this.filtroFinal = [];
        this.resultView = this.result;
        //console.log(this.resultView);
        setTimeout(() => {
          this.loading = false;
          if (!SmartPhone.isAny()) {
            this.$refs.filtro.focus();
          } else {
            this.$refs.filtro.blur();
          }
        }, 500);
      }
    },

    filter(id) {
      let data = this.result.data[id];
      let words = this.filtroFinal;
      if (words.length === 0) return false;
      words = words.map((word) => this.normalizeText(word));
      let text = this.normalizeText(data.titulo + data.descripcion);

      for (let word of words) {
        if (text.indexOf(word) > -1) {
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
    let archivados = window.localStorage.getItem('archivados');
    if (archivados !== null) {
      this.archivados = new Set(archivados.split(','));
    }
    ///////////////////////////////////////////////////
    let folder = window.localStorage.getItem('folder');
    this.folder = this.folders.includes(folder) ? folder : 'Agrupados';
    ///////////////////////////////////////////////////
    let filtro = window.localStorage.getItem('filtro');
    filtro = filtro ? filtro : '';
    this.$refs.filtro.value = filtro;
    ///////////////////////////////////////////////////
    (async () => {
      let fetchCfg = { method: 'POST', body: localStorage.getItem('cfg') ? localStorage.getItem('cfg') : 'info' };
      let result = await (await fetch('https://us-central1-jobwus-5f24c.cloudfunctions.net/getData2', fetchCfg)).json();
      //let result = await (await fetch('http://localhost:5001/jobwus-5f24c/us-central1/getData2', fetchCfg)).json();
      //console.log(result);
      this.result = result;
      this.submit();
    })();
  },
};
</script>
<style>
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
  box-shadow: rgba(0, 0, 0, 0.56) 0px 22px 70px 4px;
  max-width: 360px;
  height: 360px;
  background: var(--menu-background);
  padding: 0.5em;
  border-radius: var(--radio);
  background: rgba(20, 40, 60, 0.88);
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
  padding: 0.5em 0 0.5em;
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
  width: calc(100% - 172px);
  padding: 1px 0.33em 0px;
  position: relative;
  top: -5px;
  outline: none;
  border: 1px solid var(--background-color);
  color: var(--background-color);
}
.filtro div span {
  border: none;
  color: var(--color);
  position: relative;
  top: 3px;
}
</style>
