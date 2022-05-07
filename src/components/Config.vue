<template>
  <div class="cfg">
    <p><strong>JOBWUS</strong> es una herramienta para "hojear" ofertas laborales extraídas desde bolsas de trabajo online, las cuales son agrupadas por similitud, ordenadas por fecha, permitiendo tambien realizar búsquedas, lecturas, marcaje de favoritos y archivado <a target="_blank" style="color: white" @click.stop="" href="https://github.com/fabnun/vue-jobwus">(ver en github)</a></p>
    <hr />
    <h3>
      <strong>Palabras Clave : </strong>
      <select class="button" @change="setCfg">
        <option v-for="item in $store.state.wordsList" :key="item" :value="item" :selected="item === $store.state.words">{{ item }}</option>
      </select>
    </h3>
    <span>{{ words }}.</span>
    <hr />
    <input type="checkbox" @click.stop="" id="ignorarTildes" v-model="ignorarTildes" />
    <label class="menu-button" @click.stop="" for="ignorarTildes">Ignorar tildes en la busqueda.</label>
    <hr />
    <button @click.stop="exportConfig" class="button">Exportar Setup</button>&nbsp;
    <button class="button" @click.stop="importConfig">Importar Setup</button>

    <br />
    <br />
    <!-- <h2><strong>Recursos</strong></h2>
    <a target="_blank" href="https://www.npmjs.com/package/vue-material-design-icons">vue-material-design-icons</a><br />
    <a target="_blank" href="https://fonts.google.com/specimen/Roboto">Google Fonts Roboto</a> -->
  </div>
</template>
<script>
import { mapState } from 'vuex';
export default {
  props: ['words'],
  data() {
    return {
      oldCfg: this.$store.state.words,
    };
  },
  methods: {
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
      };
      let file = new Blob([JSON.stringify(config)], { type: 'application/json' });
      let fileURL = URL.createObjectURL(file);
      let a = document.createElement('a');
      a.href = fileURL;
      a.download = 'config.json';
      a.click();
    },
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
