<template>
  <div v-if="(folder === 'Agrupados' && !archivados.has(id)) || folder !== 'Agrupados'" :class="{ arch: archivados.has(id), focus: id === itemFocus }">
    <div :id="id" class="oferta" :class="{ collapsed: id !== itemFocus, fav: favoritos.has(id) }">
      <account-tie-voice-outline-icon style="background: rgba(0, 0, 0, 0.3); border-radius: 50%; padding: 0.3em 0.46em; float: right; cursor: pointer; margin: 4px 4px 0 4px" @click.stop.prevent="voice(id)" :size="22" v-if="speechSupport && voice2 !== ''" />
      <div @click="focus()" class="contenido">
        <a @click.stop="focus(id)" tabindex="-1" target="_blank" :href="data.url" class="titulo" v-html="id === itemFocus ? format(data.titulo ? data.titulo : 'N/A') : data.titulo ? data.titulo : 'N/A'"> </a> -
        <span class="descripcion" v-html="id === itemFocus ? format(data.descripcion ? data.descripcion : 'N/A') : data.descripcion ? data.descripcion : 'N/A'"></span>
      </div>
      <div class="top" @click="focus(id)">
        <label class="fecha">{{ dateFormat(data.fecha) }}</label>
        <div class="right-buttons">
          <label v-if="grupo.length > 0" style="position: relative; top: -0.1em">
            <span style="position: relative; top: -0.2em; cursor: text">
              {{ this.grupo.filter((item) => this.favoritos.has(item.id) || this.archivados.has(item.id)).length + (this.archivados.has(this.id) || this.favoritos.has(this.id) ? 1 : 0) }}
              / {{ grupo.length + 1 }}</span
            >
            <content-copy-icon
              @click.stop.prevent="
                collapsedSimilar = !collapsedSimilar;
                focus(id);
              "
              :size="18"
            />
          </label>
          <div v-if="folder === 'Agrupados'" style="display: inline-block; padding: 0; margin: 0; width: 0; height: 0; z-index: 1000; opacity: 0.2; color: white; height: 32px; vertical-align: text-bottom">
            <div @click.stop.prevent="archive" :style="`height: ${note}px; top: 6px`" class="progreso">&nbsp;</div>
          </div>
          <delete-outline-icon @click.stop.prevent="archive" style="z-index: 100" :size="22" v-if="!archivados.has(id)" />
          <delete-off-outline-icon @click.stop.prevent="archive" style="z-index: 100" :size="22" v-if="archivados.has(id)" />

          <!-- <span v-if="folder === 'Agrupados' && grupo.length > 0" style="position: relative; top: -0.2em">{{ grupo.filter((item) => favoritos.has(item.id)).length + (favoritos.has(id) ? 1 : 0) }}</span> -->

          <div v-if="folder === 'Agrupados'" style="display: inline-block; padding: 0; margin: 0; width: 0; height: 0; z-index: 1000; opacity: 0.2; color: white; height: 32px; vertical-align: text-bottom">
            <div @click.stop.prevent="favorite" :style="`height: ${note2}px; top: 6px; background:green`" class="progreso">&nbsp;</div>
          </div>
          <div v-else style="display: inline-block; padding: 0; margin: 0; width: 0; height: 0; z-index: 1000; opacity: 0.2; color: white; height: 32px; vertical-align: text-bottom"></div>

          <star-outline-icon @click.stop.prevent="favorite" :size="22" v-if="!favoritos.has(id)" />
          <star-icon @click.stop.prevent="favorite" :size="22" v-if="favoritos.has(id)" />

          <account-tie-voice-outline-icon style="" @click.stop.prevent="voice(id)" :size="22" v-if="speechSupport && voice2 !== ''" />

          <!-- <dots-vertical-icon :size="22" /> -->
        </div>
      </div>
    </div>

    <div v-if="!collapsedSimilar && id === itemFocus">
      <div class="copy-job" v-for="(item, idx) in reordenGrupo" :key="idx" :title="item.descripcion" :class="{ fav: favoritos.has(item.id), arch: archivados.has(item.id) }">
        <div class="copy-job-buttons">
          <delete-outline-icon @click.stop.prevent="archiveSimilar(item.id)" :size="22" v-if="!archivados.has(item.id)" />
          <delete-off-outline-icon @click.stop.prevent="archiveSimilar(item.id)" :size="22" v-if="archivados.has(item.id)" />

          <star-outline-icon @click.stop.prevent="favoriteSimilar(item.id)" :size="22" v-if="!favoritos.has(item.id)" />
          <star-icon @click.stop.prevent="favoriteSimilar(item.id)" :size="22" v-if="favoritos.has(item.id)" />

          <account-tie-voice-outline-icon @click.stop.prevent="voice(item.id)" :size="22" v-if="speechSupport && voice2 !== ''" />

          <!-- <dots-vertical-icon :size="22" /> -->
        </div>
        <label class="copydate">{{ dateFormat(item.fecha) }}</label>
        <div class="clear"></div>
        <a @click.stop="" tabindex="-1" target="_blank" :href="item.url" class="titulo">
          {{ item.titulo === undefined || item.titulo === null || item.titulo.trim().length === 0 ? 'sin titulo' : item.titulo }}
        </a>
      </div>
    </div>
    <br />
  </div>
</template>
<script>
import dayjs from 'dayjs';
import ContentCopyIcon from 'vue-material-design-icons/ContentCopy.vue';
import ThumbUpOutlineIcon from 'vue-material-design-icons/ThumbUpOutline.vue';
import ThumbDownOutlineIcon from 'vue-material-design-icons/ThumbDownOutline.vue';
import ChatOutlineIcon from 'vue-material-design-icons/ChatOutline.vue';
import StarIcon from 'vue-material-design-icons/Star.vue';
import StarOutlineIcon from 'vue-material-design-icons/StarOutline.vue';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical.vue';
import DeleteOffOutlineIcon from 'vue-material-design-icons/DeleteOffOutline.vue';
import DeleteOutlineIcon from 'vue-material-design-icons/DeleteOutline.vue';
import AccountTieVoiceOutlineIcon from 'vue-material-design-icons/AccountTieVoiceOutline.vue';
import ChevronUpIcon from 'vue-material-design-icons/ChevronUp.vue';
import ChevronDownIcon from 'vue-material-design-icons/ChevronDown.vue';

export default {
  props: ['data', 'voice2', 'filtroOpcional', 'grupo', 'itemFocus', 'filtro', 'ignorarTildes', 'id', 'folder', 'archivados', 'favoritos', 'speechSupport'],
  data: function () {
    return {
      collapsedSimilar: true,
      dragStart: 0,
      dragTime: 0,
      y: 0,
    };
  },
  components: {
    ContentCopyIcon,
    ThumbUpOutlineIcon,
    ThumbDownOutlineIcon,
    ChatOutlineIcon,
    StarOutlineIcon,
    DotsVerticalIcon,
    StarIcon,
    DeleteOutlineIcon,
    DeleteOffOutlineIcon,
    AccountTieVoiceOutlineIcon,
    ChevronUpIcon,
    ChevronDownIcon,
  },
  computed: {
    note() {
      if (!this.grupo || !this.grupo.length === 0) {
        return 20;
      }
      let total = parseFloat(this.grupo.length + 1);
      let archi = parseFloat(this.grupo.filter((item) => this.archivados.has(item.id)).length + (this.archivados.has(this.id) ? 1 : 0));
      let result = (22.0 * archi) / total;
      result = Math.min(22, Math.floor(result) * 1.1);
      return result;
    },
    note2() {
      if (!this.grupo || !this.grupo.length === 0) {
        return 20;
      }
      let total = parseFloat(this.grupo.length + 1);
      let archi = parseFloat(this.grupo.filter((item) => this.favoritos.has(item.id)).length + (this.favoritos.has(this.id) ? 1 : 0));
      let result = (22.0 * archi) / total;
      result = Math.min(22, Math.floor(result) * 1.1);
      return result;
    },
    reordenGrupo: function () {
      return this.grupo.sort((a, b) => {
        let result = 0;
        /*if ((this.favoritos.has(a.id) || this.archivados.has(a.id)) && !this.favoritos.has(b.id) && !this.archivados.has(b.id)) {
          result += 100;
        } else if (!(this.favoritos.has(a.id) || this.archivados.has(a.id)) && (this.favoritos.has(b.id) || this.archivados.has(b.id))) {
          result -= 100;
        }*/
        result += a.fecha > b.fecha ? -10 : 10;
        return result;
      });
    },
  },

  methods: {
    focus() {
      this.$emit('focus', this.id);
    },
    voice(id) {
      this.$emit('voiceSpeak', id);
    },
    favorite() {
      this.$emit('favorite', this.id);
    },
    archive() {
      this.$emit('archive', this.id);
    },
    favoriteSimilar(item) {
      this.$emit('favorite', item, false);
    },
    archiveSimilar(item) {
      this.$emit('archive', item, false);
    },
    dateFormat: function (date) {
      return dayjs(date).format('DD/MM/YY');
    },
  },
};
</script>
<style scoped>
.progreso {
  cursor: pointer;
  display: inline-block;
  background: red;
  padding: 0;
  margin: 0;
  position: relative;
  left: 2px;
  min-width: 18px !important;
  border-radius: 6px;
}
.focus > div:first-child {
  box-shadow: var(--shadow-parent);
}

.focus > div:not(:first-child) > div {
  box-shadow: var(--shadow-child);
}

.contenido {
  padding: 0.3em 0.3em 1em;
}
.top {
  background: var(--toolbar-background);
  text-align: right;
  max-height: 1.6em;
  padding: 0.3em 0 0 0.4em;
  font-weight: bolder;
  position: -webkit-sticky;
  position: sticky;
  bottom: -1px;
  -webkit-box-shadow: -1px -1px 10px 5px rgba(0, 0, 0, 0.47);
  box-shadow: -1px -1px 10px 5px rgba(0, 0, 0, 0.47);
  display: grid;
  grid-template-columns: 128px 100fr 1fr;
}
.top .fecha {
  float: left;
  top: 0em;
  left: -3.6em;
  margin-left: 0;
  padding-left: 0;
  position: relative;
}

.right-buttons {
  white-space: nowrap;
  position: relative;
  top: -6px;
  right: -4px;
}

@-moz-document url-prefix() {
  .top .fecha {
    top: -0.1em !important;
    left: -0.8em !important;
  }
  .right-buttons {
    top: -9px !important;
    right: -2px !important;
  }
}

.top span {
  cursor: pointer;
  margin-right: 0.6em;
}
.fav {
  background: var(--favorite-background) !important;
}
.copy-job {
  font-size: 0.8em;
  font-weight: bolder;
  padding: 0.4em 0 0.1em 0.5em;
  display: block;
  margin: 0 1em 0 2em;
  border-bottom: none;
  border-right: 1px solid var(--color);
  border-top: 1px solid var(--color);
  border-left: 1px solid var(--color);
  border-radius: var(--radio);
  position: relative;
  top: -1px;
  overflow: hidden;
  max-height: 3.2em;
  background: var(--oferta-background);
}
.copy-job:last-child {
  border-bottom: 1px solid var(--color);
}

.copy-job .copydate {
  position: absolute;
  margin-top: 0.4em;
}

.copy-job span {
  top: 0.2em !important;
  padding: 0 0.7em 0 0;
  cursor: pointer;
  position: relative;
}

.copy-job-buttons {
  float: right;
  right: 0.2em;
  top: -0.1em;
  position: relative;
}

.oferta {
  background: var(--oferta-background);
  line-height: var(--oferta-line-height);
  padding: 0;
  margin: 0.2em 1em;
  border-radius: var(--radio);
  border: 1px solid var(--color);
  overflow: hidden;
  text-align: start;
  /* transition: var(--oferta-transition); */
  max-height: var(--oferta-full-max-height);
}
.collapsed {
  max-height: var(--oferta-max-height);
}

a {
  color: var(--color);
}
.titulo {
  cursor: pointer;
  text-decoration: underline;
  font-weight: bolder;
  margin-right: 0.5em;
  position: relative;
  top: -0.15em;
  line-height: 1.3em;
}
.oferta-buttons {
  float: right;
  top: -0.5em;
  right: -1em;
  position: relative;
}
.oferta-buttons span {
  padding: 0 0.8em 0 0;
  cursor: pointer;
}

.clear {
  clear: both;
}
.arch {
  opacity: 0.5;
}
</style>
