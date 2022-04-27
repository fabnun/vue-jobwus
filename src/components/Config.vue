<template>
  <div>
    <h2>Configuración</h2>
    <input type="checkbox" id="ignorarTildes" v-model="ignorarTildes" />
    <label for="ignorarTildes">Ignorar tildes</label>
    <br />
    <br />
    <h2>Recursos usados</h2>
    <a target="_blank" href="https://www.npmjs.com/package/vue-material-design-icons">vue-material-design-icons</a><br />
    <a target="_blank" href="https://fonts.google.com/specimen/Roboto">Google Fonts Roboto</a>
  </div>
</template>
<script>
import { EventBus } from '../event-bus.js';
export default {
  mounted() {
    EventBus.$on('config', (ignorarTildes) => {
      this.ignorarTildes = ignorarTildes;
    });
  },
};
</script>
