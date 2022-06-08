<template>
  <div v-if="(folder === 'Agrupados' && !archivados.has(id)) || folder !== 'Agrupados'" :class="{ arch: archivados.has(id) }">
    <div class="oferta" :class="{ collapsed, fav: favoritos.has(id) }" @click="collapsed = !collapsed">
      <div class="top">
        <span class="fecha">{{ dateFormat(data.fecha) }}</span>
        <label v-if="grupo.length > 0" style="position: relative; top: -0.1em">
          <span style="position: relative; top: -0.1em">{{ grupo.length + 1 }}</span>
          <content-copy-icon @click.stop.prevent="collapsedSimilar = !collapsedSimilar" :size="18" />
        </label>
        <span v-if="folder === 'Agrupados' && grupo.length > 0" style="position: relative; top: -0.2em">{{ grupo.filter((item) => archivados.has(item.id)).length }}</span>
        <delete-outline-icon @click.stop.prevent="archive" :size="22" v-if="!archivados.has(id)" />
        <delete-off-outline-icon @click.stop.prevent="archive" :size="22" v-if="archivados.has(id)" />
        <span v-if="folder === 'Agrupados' && grupo.length > 0" style="position: relative; top: -0.2em">{{ grupo.filter((item) => favoritos.has(item.id)).length + (favoritos.has(id) ? 1 : 0) }}</span>
        <star-outline-icon @click.stop.prevent="favorite" :size="22" v-if="!favoritos.has(id)" />
        <star-icon @click.stop.prevent="favorite" :size="22" v-if="favoritos.has(id)" />
        <account-tie-voice-outline-icon @click.stop.prevent="voice(id)" :size="22" v-if="speechSupport" />
        <!-- <dots-vertical-icon :size="22" /> -->
      </div>
      <div class="contenido">
        <div v-if="filtro.length > 0">
          <a @click.stop="" target="_blank" :href="data.url" class="titulo"> <span v-html="format(data.titulo)"></span> </a>-
          <span class="descripcion" v-html="format(data.descripcion)"></span>
        </div>
        <div v-else>
          <a @click.stop="" target="_blank" :href="data.url" class="titulo">
            {{ data.titulo.trim() }}
          </a>
          <span class="descripcion" v-text="data.descripcion"></span>
        </div>
      </div>
    </div>

    <div v-if="!collapsedSimilar">
      <div class="copy-job" v-for="(item, idx) in grupo" :key="idx" :title="item.descripcion" :class="{ fav: favoritos.has(item.id), arch: archivados.has(item.id) }">
        <div class="copy-job-buttons">
          <delete-outline-icon @click.stop.prevent="archiveSimilar(item.id)" :size="22" v-if="!archivados.has(item.id)" />
          <delete-off-outline-icon @click.stop.prevent="archiveSimilar(item.id)" :size="22" v-if="archivados.has(item.id)" />
          <star-outline-icon @click.stop.prevent="favoriteSimilar(item.id)" :size="22" v-if="!favoritos.has(item.id)" />
          <star-icon @click.stop.prevent="favoriteSimilar(item.id)" :size="22" v-if="favoritos.has(item.id)" />
          <account-tie-voice-outline-icon @click.stop.prevent="voice(item.id)" :size="22" v-if="speechSupport" />
          <!-- <dots-vertical-icon :size="22" /> -->
        </div>
        {{ dateFormat(item.fecha) }}
        <div class="clear"></div>
        <a @click.stop="" target="_blank" :href="item.url" class="titulo">
          {{ item.titulo }}
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

export default {
  props: ['data', 'grupo', 'filtro', 'ignorarTildes', 'id', 'folder', 'archivados', 'favoritos', 'speechSupport'],
  data: function () {
    return {
      collapsed: true,
      collapsedSimilar: true,
      dragStart: 0,
      dragTime: 0,
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
  },

  methods: {
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
    format(text) {
      if (this.ignorarTildes) {
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      text = ' ' + text + ' ';

      let sorted = [...this.filtro];
      sorted.sort((a, b) => {
        if (a.startsWith(b)) {
          return -1;
        }
        if (b.startsWith(a)) {
          return 1;
        }
        return a > b ? 1 : -1;
      });
      let regexp = '[^a-zA-Z]+(' + sorted.map((w) => w.replace(/\s+/g, '[^a-zA-Z]+')).join('[^a-zA-Z]+|') + '[^a-zA-Z]+)+';
      text = text.replace(new RegExp(regexp, 'gi'), '<span class="highlight">$&</span>').replace(/\s+/g, ' ').trim();
      return text;
    },
  },
};
</script>
<style scoped>
.contenido {
  padding: 0.3em;
}
.top {
  background: rgba(0, 0, 0, 0.2);
  text-align: right;
  padding: 0.2em 0 0 0.4em;
  font-weight: bolder;
}
.top .fecha {
  float: left;

  top: 0.1em;
  position: relative;
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
  padding: 0.3em 0 0 0.5em;
  display: block;
  margin: 0 1em 0 2em;
  border: 1px solid var(--color);
  border-radius: var(--radio);
  position: relative;
  top: -1px;
  overflow: hidden;
  max-height: 3.2em;

  background: var(--oferta-background);
}

.copy-job span {
  padding: 0 1em 0 0;
  cursor: pointer;
}

.copy-job-buttons {
  float: right;
  right: 0em;
  top: -0.2em;
  position: relative;
}

.oferta {
  background: var(--oferta-background);
  line-height: var(--oferta-line-height);
  padding: 0;
  margin: 0 0.5em;
  border-radius: var(--radio);
  border: 1.5px solid var(--color);
  overflow: hidden;
  transition: var(--oferta-transition);
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
