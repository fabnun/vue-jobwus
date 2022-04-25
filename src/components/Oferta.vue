<template>
  <div>
    <div class="oferta" :class="{ collapsed }">
      <div v-if="filtro.length > 0">
        <a :href="data.url" target="_blank" class="titulo" v-html="format(data.src.toUpperCase() + ' : ' + data.titulo)"></a>
        <span class="descripcion" @click="collapsed = !collapsed" v-html="format(data.descripcion)"></span>
      </div>
      <div v-if="filtro.length === 0">
        <a :href="data.url" target="_blank" class="titulo" v-text="(data.src.toUpperCase() + ' : ' + data.titulo).trim()"></a>
        <span class="descripcion" @click="collapsed = !collapsed" v-text="data.descripcion"></span>
      </div>
    </div>
    <div class="oferta-buttons">
      12 <content-copy-icon :size="18" /> 3 <thumb-up-outline-icon :size="18" /> 1 <thumb-down-outline-icon :size="18" /> 5 <chat-outline-icon :size="18" />
      <star-outline-icon :size="18" />
      <dots-vertical-icon :size="18" />
    </div>
    <div class="clear"></div>
  </div>
</template>
<script>
import ContentCopyIcon from 'vue-material-design-icons/ContentCopy.vue';
import ThumbUpOutlineIcon from 'vue-material-design-icons/ThumbUpOutline.vue';
import ThumbDownOutlineIcon from 'vue-material-design-icons/ThumbDownOutline.vue';
import ChatOutlineIcon from 'vue-material-design-icons/ChatOutline.vue';
import StarOutlineIcon from 'vue-material-design-icons/StarOutline.vue';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical.vue';

export default {
  data: function () {
    return {
      collapsed: true,
    };
  },
  methods: {
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
  props: ['data', 'filtro', 'ignorarTildes'],
};
</script>
<style scoped>
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
