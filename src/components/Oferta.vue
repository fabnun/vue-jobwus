<template>
  <div v-if="(folder === 'Agrupados' && !arch) || folder !== 'Agrupados'" :class="{ arch }">
    <div class="oferta" :class="{ collapsed, fav }" @click="collapsed = !collapsed">
      <div v-if="filtro.length > 0">
        <span @click.prevent.stop="load(data.url)" href="#" class="titulo">
          <span class="highlight">{{ dateFormat(data.fecha) }}</span>
          <span v-html="format(data.titulo)"></span> </span
        >-
        <span class="descripcion" v-html="format(data.descripcion)"></span>
      </div>
      <div v-else>
        <a @click.prevent.stop="load(data.url)" href="#" class="titulo">
          <span class="highlight">{{ dateFormat(data.fecha) }}</span>
          {{ data.titulo.trim() }}
        </a>
        <span class="descripcion" v-text="data.descripcion"></span>
      </div>
      <div v-if="grupo.length > 0">
        <hr />
        <br />
        OFERTAS SIMILARES
        <br /><br />
        <div class="copy-job" v-for="(item, idx) in grupo" :key="idx" :title="item.descripcion" :class="{ fav: favoritos.has(item.id), arch: archivados.has(item.id) }">
          <div class="copy-job-buttons">
            <account-tie-voice-outline-icon @click.stop.prevent="voice(item.id)" v-if="speechSupport" />
            <star-outline-icon @click.stop.prevent="favoriteSimilar(item.id)" :size="22" v-if="!favoritos.has(item.id)" />
            <star-icon @click.stop.prevent="favoriteSimilar(item.id)" :size="22" v-if="favoritos.has(item.id)" />
            <delete-outline-icon @click.stop.prevent="archiveSimilar(item.id)" :size="22" v-if="!archivados.has(item.id)" />
            <delete-off-outline-icon @click.stop.prevent="archiveSimilar(item.id)" :size="22" v-if="archivados.has(item.id)" />
            <dots-vertical-icon :size="22" />
          </div>
          <span @click.prevent.stop="load(item.url)" class="titulo">
            <span class="highlight">{{ dateFormat(item.fecha) }}</span> <span>{{ item.titulo }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="oferta-buttons">
      <template v-if="grupo.length > 0"
        >{{ grupo.length }}
        <content-copy-icon
          @click="
            if (collapsed) {
              collapsed = false;
            }
          "
          :size="18"
      /></template>
      <!-- ? <thumb-up-outline-icon :size="18" /> ? <thumb-down-outline-icon :size="18" /> -->
      <account-tie-voice-outline-icon @click.stop.prevent="voice(id)" v-if="speechSupport" />
      <star-outline-icon @click="favorite" :size="22" v-if="!fav" />
      <star-icon @click="favorite" :size="22" v-if="fav" />
      <delete-outline-icon @click="archive" :size="22" v-if="!arch" />
      <delete-off-outline-icon @click="archive" :size="22" v-if="arch" />
      <dots-vertical-icon :size="22" />
    </div>
    <div class="clear"></div>
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
  props: ['data', 'grupo', 'filtro', 'ignorarTildes', 'id', 'isFavorite', 'isArchived', 'folder', 'archivados', 'favoritos', 'speechSupport'],
  data: function () {
    return {
      collapsed: true,
      dragStart: 0,
      dragTime: 0,
      fav: this.isFavorite,
      arch: this.isArchived,
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
      this.$emit('voice', id);
    },
    favorite() {
      this.fav = !this.fav;
      this.$emit('favorite', this.id);
    },
    archive() {
      this.arch = !this.arch;
      this.$emit('archive', this.id);
    },
    favoriteSimilar(item) {
      this.$emit('favorite', item, false);
    },
    archiveSimilar(item) {
      this.$emit('archive', item, false);
    },
    load(url) {
      window.open(url, '_blank').focus();
    },
    dateFormat: function (date) {
      return dayjs(date).format('DD/MM/YY');
    },
    format(text) {
      if (this.ignorarTildes) {
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      return text
        .replace(new RegExp(this.filtro.join('|'), 'gi'), '<span class="highlight">$&</span>')
        .replace(/\s+/g, ' ')
        .trim();
    },
  },
};
</script>
<style scoped>
.fav {
  background: var(--favorite-background) !important;
}
.copy-job {
  margin-bottom: 0.4em;
  display: block;
  border: 1.5px solid var(--color);
  border-radius: var(--radio);
}
.copy-job-buttons {
  float: right;
}
.copy-job-buttons span {
  cursor: pointer;
}

.oferta {
  background: rgba(35, 25, 0, 0.3);
  line-height: var(--oferta-line-height);
  padding: 0.6em 0.5em 0.5em;
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
}
.oferta-buttons {
  float: right;
  border-radius: 0 0 var(--radio) var(--radio);
  border: 1.5px solid var(--color);
  padding: 0.1em 0.5em;
  margin: 0 1em 1em 0;
  position: relative;
  top: -1px;
  padding-top: 0.3em;
}
.oferta-buttons span {
  padding: 0 1em 0 0;
  cursor: pointer;
}

.clear {
  clear: both;
}
.arch {
  opacity: 0.3;
}
</style>
