<template>
  <div>
    <div class="filtro">
      <div class="filtroIn">
        <dots-vertical-icon class="menu-button" @click="modal = !modal" />
        <h4>JOBWUS</h4>
        <input spellcheck="false" v-model="filtro" @keyup.enter="submit" ref="filtro" />
        <magnify-icon class="submit-button" @click="submit" />
        <div class="status">{{ filtroFinal }}</div>
      </div>
    </div>
    <div :class="{ noEvents: modal }">
      <div v-if="!loading">
        <div v-for="item in resultView.pages" :key="item.id">
          <!-- oculto:{{ item.hidden }} match:{{ filter(item) }} filtros:{{ filtroFinal.length }} grupo:{{ item.grupo }} -->
          <oferta
            :folder="folder"
            :isArchived="archivados.has(item.id)"
            :isFavorite="favoritos.has(item.id)"
            @favorite="favorite"
            @archive="archive"
            v-if="(!item.hidden && folder === 'Principal' && !archivados.has(item.id)) || folder !== 'Principal'"
            :data="resultView.data[item.id]"
            :id="item.id"
            :ignorarTildes="ignorarTildes"
            :filtro="filtroFinal"
            :grupo="
              item.grupo === null
                ? []
                : resultView.clusters[item.grupo]
                    .filter((id) => id !== item.id)
                    .map((id) => {
                      return { id, ...resultView.data[id] };
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
        <input type="checkbox" id="ignorarTildes" v-model="ignorarTildes" />
        <label for="ignorarTildes">Ignorar tildes en la busqueda</label><br /><br />

        &nbsp;&nbsp;&nbsp;&nbsp;<label for="ignorarTildes">Carpeta</label>&nbsp;
        <select v-model="folder">
          <option v-for="item in folders" :value="item" :key="item" :selected="item === folder">{{ item }}</option>
        </select>
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
import _smartPhone from 'detect-mobile-browser';
let SmartPhone = _smartPhone(false);

let oldFiltro = null;
export default {
  components: { Oferta, MagnifyIcon, DotsVerticalIcon, CloseIcon, Loading },
  name: 'Ofertas',
  data() {
    return {
      folders: ['Principal', 'Favoritos', 'Archivados'],
      folder: 'Favoritos',
      loading: true,
      modal: false,
      ignorarTildes: true,
      filtro: '',
      filtroFinal: [],
      result: null,
      resultView: null,
      archivados: new Set(),
      favoritos: new Set(),
    };
  },
  watch: {
    ignorarTildes() {
      window.localStorage.setItem('ignorarTildes', this.ignorarTildes);
    },
    folder() {
      window.localStorage.setItem('folder', this.folder);
    },
  },

  updated: function () {
    if (this.result !== null && oldFiltro !== this.filtroFinal.join(',')) {
      oldFiltro = this.filtroFinal.join(',');
      setTimeout(() => {
        this.loading = false;
        if (!SmartPhone.isAny()) this.$refs.filtro.focus();
      }, 661);
    }
  },
  methods: {
    favorite(id) {
      if (this.favoritos.has(id)) {
        this.favoritos.delete(id);
      } else {
        this.favoritos.add(id);
      }
      window.localStorage.setItem('favoritos', Array.from(this.favoritos).join(','));
    },
    archive(id) {
      if (this.archivados.has(id)) {
        this.archivados.delete(id);
      } else {
        this.archivados.add(id);
      }
      window.localStorage.setItem('archivados', Array.from(this.archivados).join(','));
    },
    submit() {
      this.filtro = this.filtro.trim();
      let text = this.filtro;
      if (this.ignorarTildes) {
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      window.localStorage.setItem('filtro', this.filtro);
      let final = this.normalizeText(this.filtro.toLowerCase())
        .replace(/\s+/, ' ')
        .split(',')
        .map((word) => word.trim())
        .filter((word) => word !== '');

      if (this.filtro.length > 0) {
        this.filtroFinal = final;
        this.loading = true;
        //////////////////////////////////////////////////////////////////
        let resultBuild = {
          pages: this.result.pages.filter((item) => this.filter(item.id)),
          data: this.result.data,
          clusters: this.result.clusters.map((cluster) => {
            return cluster.filter((id) => this.filter(id));
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
        console.log(resultBuild);
        //////////////////////////////////////////////////////////////////

        this.resultView = resultBuild;
        window.scrollTo(0, 0);
        this.$refs.filtro.blur();
      } else {
        this.loading = true;
        this.filtroFinal = [];
        this.resultView = this.result;
        console.log(this.resultView);
        setTimeout(() => {
          this.loading = false;
          if (!SmartPhone.isAny()) this.$refs.filtro.focus();
        }, 333);
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
      if (this.ignorarTildes) {
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }

      return text.trim();
    },
  },
  mounted() {
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
    this.folder = folder ? folder : 'Principal';
    ///////////////////////////////////////////////////
    let filtro = window.localStorage.getItem('filtro');
    this.filtro = filtro ? filtro : '';
    ///////////////////////////////////////////////////
    let ignorarTildes = window.localStorage.getItem('ignorarTildes');
    this.ignorarTildes = ignorarTildes ? ignorarTildes === 'true' : true;
    ///////////////////////////////////////////////////
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
  padding-left: 4px;
  cursor: pointer;
}
.status {
  /*fix*/
  display: none !important;
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
  background: var(--menu-background);
  padding: 4%;
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
  border-radius: 8px;
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
