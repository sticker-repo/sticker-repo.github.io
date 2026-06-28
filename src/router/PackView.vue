<script setup></script>

<template>
  <div class="header-2">
    {{ title }}
    <a class="add-btn telegram" :href="link" style="margin-right: 0.5em">add to telegram</a>
    <a class="add-btn matrix" v-on:click="isMatrixPopupOpen = true">add to matrix</a>
  </div>
  <StickerGrid :cards="stickers" size="large" />
  <template v-if="premium_stickers.length > 0">
    <div class="header-2 smaller">premium animation</div>
    <StickerGrid :cards="premium_stickers" size="large" />
  </template>
  <template v-if="isMatrixPopupOpen">
    <div class="popup-container">
      <div class="popup">
        {{ matrixEvent }}
      </div>
    </div>
  </template>
</template>

<script>
import { fetchJson } from '@/utils'
import StickerGrid from '@/components/StickerGrid.vue'

function extToMimetype(ext) {
  switch (ext.toLowerCase()) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'webm':
      return 'video/webm'
    case 'gif':
      return 'image/gif'
    case 'tgs':
      return 'video/tgs'
    default:
      return undefined
  }
}

export default {
  components: { StickerGrid },
  data() {
    return {
      title: '',
      link: '',
      typeName: '',
      matrixEvent: '',
      isMatrixPopupOpen: false,
      stickers: [],
      premium_stickers: [],
    }
  },
  async created() {
    const data = await fetchJson(
      `https://sticker-repo.github.io/s1/info/${this.$route.params.packName}.json`,
    )
    if (!data) return
    this.title = data.title
    if (data.sticker_type === 'regular') {
      this.link = `https://t.me/addstickers/${data.name}`
      this.typeName = 'stickers'
    } else if (String(data.sticker_type).includes('emoji')) {
      this.link = `https://t.me/addemoji/${data.name}`
      this.typeName = 'emojis'
    }
    const matrixEvent = {
      images: {},
      pack: {
        display_name: data.name,
        attribution: `[sticker-repo.github.io] Original pack at ${this.link}`,
        usage: ['sticker', 'emoticon'],
      },
    }
    for (let i = 0; i < data.stickers.length; i++) {
      const sticker = data.stickers[i]
      let s = {
        id: sticker.file_unique_id,
        src: `https://sticker-repo.github.io/s1/files/${this.$route.params.packName}/${sticker.file_unique_id}.${sticker.extension}`,
        extension: sticker.extension,
        premium_animation: sticker.premium_animation !== undefined,
      }
      if (s.premium_animation) {
        this.premium_stickers.push(s)
      } else {
        this.stickers.push(s)
        matrixEvent.images[String(i)] = {
          url: `mxc://mtx.sticker-repo.workers.dev/s1-${data.name}-${sticker.file_unique_id}-${sticker.extension}`,
          body: sticker.emoji,
        }
        const mimetype = extToMimetype(sticker.extension)
        if (mimetype) {
          matrixEvent.images[String(i)]['info'] = {
            mimetype: mimetype,
          }
        }
      }
    }
    this.matrixEvent = JSON.stringify(matrixEvent);
  },
}
</script>
