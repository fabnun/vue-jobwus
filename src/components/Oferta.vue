<template>
  <div>
    <div class="oferta" :class="{ collapsed }" @click.capture="collapsed = !collapsed">
      <div v-if="filtro.length > 0">
        <a @click.stop="load(data.url)" href="#" class="titulo">
          <span class="highlight">{{ dateFormat(data.fecha) + ' ' + data.src }}</span>
          <span v-html="format(data.titulo)"></span>
        </a>
        <span class="descripcion" v-html="format(data.descripcion)"></span>
      </div>
      <div v-else>
        <a @click.stop="load(data.url)" href="#" class="titulo">
          <span class="highlight">{{ dateFormat(data.fecha) + ' ' + data.src }}</span>
          {{ data.titulo.trim() }}
        </a>
        <span class="descripcion" v-text="data.descripcion"></span>
      </div>
      <div v-if="grupo.length > 0">
        <hr />
        OFERTAS SIMILARES
        <br /><br />
        <span v-for="(item, idx) in grupo" :key="idx">
          <a @click.stop="load(item.url)" href="#" class="copy-job">
            <span class="highlight">{{ dateFormat(item.fecha) + ' ' + item.src }}</span> {{ item.titulo }}</a
          ><br />
        </span>
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
      ? <thumb-up-outline-icon :size="18" /> ? <thumb-down-outline-icon :size="18" /> ? <chat-outline-icon :size="18" />
      <star-outline-icon :size="18" />
      <dots-vertical-icon :size="18" />
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
import StarOutlineIcon from 'vue-material-design-icons/StarOutline.vue';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical.vue';

console.log();

export default {
  props: ['data', 'grupo', 'filtro', 'ignorarTildes', 'id'],
  data: function () {
    return {
      collapsed: true,
      dragStart: 0,
      dragTime: 0,
    };
  },
  methods: {
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
  components: {
    ContentCopyIcon,
    ThumbUpOutlineIcon,
    ThumbDownOutlineIcon,
    ChatOutlineIcon,
    StarOutlineIcon,
    DotsVerticalIcon,
  },
};
</script>
<style scoped>
.copy-job {
  margin-right: 2em;
}
.oferta {
  padding: 0.2em 0.5em 0.5em;
  margin: 0 0.5em;
  border-radius: 0.5em;
  border: 1px solid var(--color);
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
  font-weight: bolder;
  margin-right: 0.5em;
}
.oferta-buttons {
  float: right;
  border-radius: 0 0 0.5em 0.5em;
  border: 1px solid var(--color);
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
</style>
