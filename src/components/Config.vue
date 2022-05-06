<template>
  <div>
    <p><strong>JOBWUS</strong> es una herramienta para hojear ofertas laborales extraídas desde bolsas de trabajo online, las cuales son agrupadas por similitud, ordenadas por fecha, permitiendo tambien búsquedas, marcaje de favoritos y archivado <a target="_blank" style="color: white" @click.stop="" href="https://github.com/fabnun/vue-jobwus">(ver en github)</a></p>
    <br />
    <h3><strong>Palabras Clave (extracción)</strong></h3>
    <span>{{ words }}.</span>
    <br /><br />
    <h3><strong> Configuración</strong></h3>
    <input type="checkbox" @click.stop="" id="ignorarTildes" v-model="ignorarTildes" />
    <label class="menu-button" @click.stop="" for="ignorarTildes">Ignorar tildes en la busqueda.</label>
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
