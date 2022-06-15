<template>
  <div class="cfg">
    <h1>CONFIGURACIÓN</h1>
    <hr />
    <div>
      <strong>Voz: </strong>
      <select class="button" @change="setVoice">
        <option v-for="item in voiceList" :key="item" :value="item" :selected="item === voice">{{ item === '' ? 'ninguna' : item.substring(item.indexOf(' - ') > -1 ? item.indexOf(' - ') + 3 : 0) }}</option>
      </select>
    </div>
    <div v-if="voice !== ''">
      <strong>Rapidez de lectura: </strong>
      <select class="button" @change="setSpeed">
        <option :value="speed" v-for="speed in speeds" :key="speed" :selected="speed === voiceSpeed">{{ speed * 100 }}%</option>
      </select>
    </div>
    <hr />
    <div>
      <strong>Theme: </strong>
      <select class="button" @change="setTheme">
        <option :value="theme" v-for="theme in Object.keys(themes.styles)" :key="theme" :selected="themes.themeSelected === theme">{{ theme }}</option>
      </select>
    </div>
    <div>
      <strong> Zoom: </strong>
      <select class="button" @change="setZoom">
        <option :value="zoom" v-for="zoom in Object.keys(themes.zooms)" :key="zoom" :selected="themes.themeZoom === zoom">{{ zoom }}</option>
      </select>
    </div>
    <hr />
    <input type="checkbox" @click.stop="" id="ignorarTildes" v-model="ignorarTildes" />
    <label style="position: relative; top: -0px !important; margin-left: 10px" class="menu-button" @click.stop="" for="ignorarTildes">Ignorar tildes en la busqueda.</label>
    <br />
    <hr />
    <button class="button" @click.stop="importConfig"><download-icon class="buttonCfg" />Importar Localstorage</button>&nbsp;
    <button @click.stop="exportConfig" class="button"><upload-icon class="buttonCfg" />Exportar Localstorage</button>
    <!-- <button @click.stop="logout" class="button"><upload-icon class="buttonCfg" />LOGOUT</button> -->
    <!-- <button class="button">undo</button>
    <button class="button">redo</button> -->
    <br />
    <br />
    <hr />
    <p></p>

    <h1>¿QUE ES JOBWUS?</h1>
    <br />

    <p>
      Es un extractor de ofertas laborales obtenidas desde los siguientes portales de empleos en Chile:<br /><br />
      <a href="#" @click="go('https://www.bne.cl', true)">bne.cl</a><br />
      <a href="#" @click="go('ttps://www.chiletrabajos.cl', true)">chiletrabajos.cl</a><br />
      <a href="#" @click="go('https://www.computrabajo.cl', true)">computrabajo.cl</a><br />
      <a href="#" @click="go('https://www.empleospublicos.cl', true)">empleospublicos.cl</a><br />
      <a href="#" @click="go('https://www.trabajando.cl', true)">trabajando.cl</a><br />
    </p>
    <br />
    <p>
      Finalizada la extracción, las ofertas son filtradas por palabras clave y son agrupadas en las siguientes categorias:<br /><br />
      <a href="#" @click="go('/compliance')">https://jobwus.com/compliance</a><br />
      <a href="#" @click="go('/info')">https://jobwus.com/info</a><br />
      <a href="#" @click="go('/sts')">https://jobwus.com/sts</a><br />
      <a href="#" @click="go('/profes')"> https://jobwus.com/profes</a><br />
    </p>
    <br />
    <p>Dentro de cada categoria se calcula la similitud entre ofertas mediante <a href="#" @click="go('https://github.com/stephenjjbrown/string-similarity-js', true)" target="_blank">string-similarity-js</a> y se agrupan ofertas similares usando <a href="#" @click="go('https://github.com/deestan/set-clustering', true)" target="_blank">set-clustering</a></p>
    <br />
    <p>El agrupamiento que se realiza 2 veces al día retorna grupos de ofertas similares, pero más útil sería poder identificar con seguridad las ofertas duplicadas. En un futuro esto se podrá mejorar utilizando aprendizaje automático, que tambien ayudara a hacer un mejor match de las ofertas seleccionadas.</p>
    <br />
    <p>
      El repositorio github de la parte frontend del proyecto esta en<br />
      <a href="#" @click="go('https://github.com/fabnun/vue-jobwus', true)" target="_blank">fabnun/vue-jobwus</a>
    </p>

    <div style="display: grid; justify-content: center; align-content: center; height: 128px">
      <a href="#" @click="go('https://twitter.com/jobwus', true)" style="text-decoration: none" target="_blank">
        <twitter-icon class="button-icon" />
        <span style="position: relative; top: -6px">@jobwus</span>
      </a>
    </div>
  </div>
</template>
<script>
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../firebaseConfig';
initializeApp(firebaseConfig);
const auth = getAuth();

import DownloadIcon from 'vue-material-design-icons/Download.vue';
import UploadIcon from 'vue-material-design-icons/Upload.vue';
import twitterIcon from 'vue-material-design-icons/Twitter.vue';

export default {
  props: ['words', 'voiceList'],
  components: {
    DownloadIcon,
    UploadIcon,
    twitterIcon,
  },
  data() {
    return {
      themes: require('../themes.js').default,
      speeds: [1, 1.25, 1.5, 1.75, 2],
      oldCfg: this.$store.state.words,
      voiceSpeed: parseFloat(localStorage.getItem('voiceSpeed')) || 1,
      voice: localStorage.getItem('voice') || null,
    };
  },
  methods: {
    go(url, blank = false) {
      if (blank) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    },
    logout() {
      sendPasswordResetEmail(auth).then(
        () => {
          this.notification('Enviamos un email para reestablecer su clave, revise su correo ');
        },
        (error) => this.notification(error, 'error')
      );
    },
    setTheme(e) {
      this.themes.setTheme(e.target.value);
    },
    setZoom(e) {
      this.themes.setZoom(e.target.value);
    },
    setVoice(e) {
      this.voice = e.target.value;
      localStorage.setItem('voice', this.voice);
      this.$emit('setVoice', e.target.value);
    },
    setSpeed(e) {
      this.voiceSpeed = parseFloat(e.target.value);
      localStorage.setItem('voiceSpeed', this.voiceSpeed);
      this.$emit('setSpeed', e.target.value);
    },
    setCfg(e) {
      if (confirm('¿Estás seguro de que quieres cambiar las palabras clave?')) {
        localStorage.setItem('cfg', e.target.value);
        location.reload();
      } else {
        e.target.value = this.oldCfg;
      }
    },
    importConfig() {
      let fileInput = document.createElement('input');
      fileInput.setAttribute('type', 'file');
      fileInput.addEventListener('change', (e) => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
          let config = JSON.parse(e.target.result);
          localStorage.setItem('ignorarTildes', config.ignorarTildes);
          localStorage.setItem('folder', config.folder);
          localStorage.setItem('zoom', config.zoom);
          localStorage.setItem('theme', config.theme);
          localStorage.setItem('voice', config.voice);
          localStorage.setItem('voiceSpeed', config.voiceSpeed);
          localStorage.setItem('filtro', config.filtro);
          localStorage.setItem('favoritos', config.favoritos);
          localStorage.setItem('archivados', config.archivados);
          location.reload();
        };
        reader.readAsText(file);
      });
      fileInput.click();
      //this.$store.dispatch('importConfig');
    },
    exportConfig() {
      let config = {
        ignorarTildes: localStorage.getItem('ignorarTildes'),
        folder: localStorage.getItem('folder'),
        filtro: localStorage.getItem('filtro'),
        favoritos: localStorage.getItem('favoritos'),
        archivados: localStorage.getItem('archivados'),
        zoom: localStorage.getItem('zoom'),
        theme: localStorage.getItem('theme'),
        voice: localStorage.getItem('voice'),
        voiceSpeed: localStorage.getItem('voiceSpeed'),
      };
      let file = new Blob([JSON.stringify(config)], { type: 'application/json' });
      let fileURL = URL.createObjectURL(file);
      let a = document.createElement('a');
      a.href = fileURL;
      a.download = 'config.json';
      a.click();
    },
  },
  mounted() {
    this.voice = localStorage.getItem('voice') || '';
    this.voiceSpeed = parseFloat(localStorage.getItem('voiceSpeed') || 1);
    this.$emit('setVoice', this.voice);
    this.$emit('setSpeed', this.voiceSpeed);
  },
  computed: {
    ignorarTildes: {
      get() {
        return this.$store.state.ignorarTildes;
      },
      set() {
        this.$store.commit('setIgnorarTildes');
      },
    },
  },
};
</script>
<style scoped>
.buttonCfg {
  position: relative;
  top: 4px;
}
.cfg {
  font-size: 0.9em;
}
.button {
  margin: 2px;
  outline: none;
  border: 1.5px solid var(--color);
  border-radius: var(--radio);
  cursor: pointer;
  padding: 0em 0.3em;
}
</style>
