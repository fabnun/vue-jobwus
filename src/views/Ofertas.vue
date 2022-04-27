<template>
  <div>
    <div class="filtro">
      <dots-vertical-icon class="menu-button" @click="modal = !modal" />
      <h4>JOBWUS</h4>
      <input v-model="filtro" @keyup.enter="submit" ref="filtro" />
      <magnify-icon class="submit-button" @click="submit" />
      <div class="status" v-if="result !== null">{{ filtroFinal }}</div>
    </div>
    <div :class="{ noEvents: modal }">
      <div v-if="!loading">
        <div v-for="item in result.pages" :key="item.id">
          <!-- oculto:{{ item.hidden }} match:{{ filter(item) }} filtros:{{ filtroFinal.length }} grupo:{{ item.grupo }} -->
          <oferta
            v-if="(filtroFinal.length === 0 && !item.hidden) || filter(item)"
            :data="result.data[item.id]"
            :id="item.id"
            :ignorarTildes="ignorarTildes"
            :filtro="filtroFinal"
            :grupo="
              item.grupo === null
                ? []
                : result.clusters[item.grupo]
                    .filter((id) => id !== item.id)
                    .map((id) => {
                      return { id, ...result.data[id] };
                    })
            "
          />
        </div>
      </div>
      <div v-if="loading" class="loading">
        <loading />
      </div>
    </div>
    <div class="modal-container" v-if="modal">
      <div class="modal">
        <button style="float: right; cursor: pointer" @click="modal = false"><close-icon /></button>
        <h2>Configuración</h2>
        <input type="checkbox" id="ignorarTildes" v-model="ignorarTildes" />
        <label for="ignorarTildes">Ignorar tildes</label>
        <br />
        <br />
        <h2>Recursos usados</h2>
        <a target="_blank" href="https://www.npmjs.com/package/vue-material-design-icons">vue-material-design-icons</a><br />
        <a target="_blank" href="https://fonts.google.com/specimen/Roboto">Google Fonts Roboto</a>
      </div>
    </div>
  </div>
</template>
<script>
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical.vue';
import Oferta from '../components/Oferta.vue';
import Loading from '../components/Loading.vue';
let oldFiltro = null;
export default {
  components: { Oferta, MagnifyIcon, DotsVerticalIcon, CloseIcon, Loading },
  name: 'Ofertas',
  data() {
    return {
      loading: true,
      modal: false,
      ignorarTildes: true,
      filtro: '',
      filtroFinal: [],
      result: null,
    };
  },
  watch: {
    filtro() {
      this.filtro = this.filtro.toLowerCase();
      window.localStorage.setItem('filtro', this.filtro);
    },
    ignorarTildes() {
      window.localStorage.setItem('ignorarTildes', this.ignorarTildes);
    },
  },

  updated: function () {
    if (this.result !== null && oldFiltro !== this.filtroFinal.join(',')) {
      oldFiltro = this.filtroFinal.join(',');
      setTimeout(() => {
        this.loading = false;
      }, 661);
    }
  },
  methods: {
    submit() {
      let final = this.normalizeText(this.filtro)
        .replace(/\s+/, ' ')
        .split(',')
        .map((word) => word.trim())
        .filter((word) => word !== '');

      if (this.filtroFinal.join(',') !== final.join(',')) {
        this.loading = true;
        this.filtroFinal = final;
        window.scrollTo(0, 0);
        this.$refs.filtro.blur();
      } else {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
        }, 333);
      }
    },
    filter(item) {
      let data = this.result.data[item.id];
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
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return text.trim();
    },
  },
  mounted() {
    let filtro = window.localStorage.getItem('filtro');
    this.filtro = filtro ? filtro : '';
    let ignorarTildes = window.localStorage.getItem('ignorarTildes');
    this.ignorarTildes = ignorarTildes ? ignorarTildes === 'true' : true;
    (async () => {
      let result = await (await fetch('https://us-central1-jobwus-5f24c.cloudfunctions.net/exportsJSON')).json();
      console.log(result);
      this.result = result;
      this.submit();
    })();
  },
};
</script>
<style>
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
  padding-left: 8px;
  cursor: pointer;
}
.status {
  display: block;
  width: 100%;
  padding: 4px 0 0;
}
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}
.noEvents {
  pointer-events: none !important;
}
.modal {
  position: fixed;
  top: 26%;
  left: 26%;
  width: 40%;
  height: 40%;
  background: white;
  padding: 4%;
  z-index: 9999;
}

.menu-button {
  margin: 0 -9px 0 12px;
}
.filtro {
  z-index: 1;
  position: fixed;
  width: 100%;
  max-width: var(--page-max-width);
  top: 0;
  padding: 0.5em 0 0.5em;
  background: var(--background);
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
  border-radius: 8px;
  background: var(--background-input);
  width: calc(100% - 172px);
  padding: 1px 0.33em 0px;
  position: relative;
  top: -5px;
  outline: none;
  border: 1px solid var(--color);
  color: var(--color);
}
.filtro div span {
  border: none;
  color: var(--color);
  position: relative;
  top: 3px;
}
</style>
