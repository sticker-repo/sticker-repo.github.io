<template>
  <div v-if="tgsCards.length > 0" class="header-2">animated stickers</div>
  <StickerGrid :cards="tgsCards" size="small" />
  <div v-if="webpCards.length > 0" class="header-2">static stickers</div>
  <StickerGrid :cards="webpCards" size="small" />
</template>

<script>
import { shuffle, fetchJson } from '@/utils'
import StickerGrid from '@/components/StickerGrid.vue'

export default {
  components: { StickerGrid },
  data() {
    return {
      tgsCards: [],
      webpCards: [],
    }
  },
  async created() {
    const data = await fetchJson('https://sticker-repo.github.io/s1/emoji_index.json')
    if (!data) return
    const stickerFiles = data[this.$route.params.emoji] || []
    const tgs = []
    const webp = []
    stickerFiles.forEach((stickerFile) => {
      const packName = stickerFile.split('/')[0]
      if (stickerFile.endsWith('.tgs')) {
        tgs.push({ packName, stickerFile })
      } else if (stickerFile.endsWith('.webp') || stickerFile.endsWith('.webm')) {
        webp.push({ packName, stickerFile })
      }
    })
    shuffle(tgs)
    shuffle(webp)
    this.tgsCards = tgs.map((it) => ({ key: it.stickerFile, src: `https://sticker-repo.github.io/s1/files/${it.stickerFile}`, extension: 'tgs', route: `/pack/${it.packName}` }))
    this.webpCards = webp.map((it) => {
      const ext = it.stickerFile.split('.').pop()
      return { key: it.stickerFile, src: `https://sticker-repo.github.io/s1/files/${it.stickerFile}`, extension: ext, route: `/pack/${it.packName}` }
    })
  },
}
</script>
