<template>
  <div v-if="animatedCards.length > 0" class="header-2">animated stickers</div>
  <StickerGrid :cards="animatedCards" size="small" />
  <div v-if="staticCards.length > 0" class="header-2">static stickers</div>
  <StickerGrid :cards="staticCards" size="small" />
</template>

<script>
import { shuffle, fetchJson } from '@/utils'
import StickerGrid from '@/components/StickerGrid.vue'

export default {
  components: { StickerGrid },
  data() {
    return {
      animatedCards: [],
      staticCards: [],
    }
  },
  async created() {
    const data = await fetchJson('https://sticker-repo.github.io/s1/emoji_index.json')
    if (!data) return
    const stickerFiles = data[this.$route.params.emoji] || []
    const _animated = []
    const _static = []
    stickerFiles.forEach((stickerFile) => {
      const packName = stickerFile.split('/')[0]
      if (stickerFile.endsWith('.tgs') || stickerFile.endsWith('.webm')) {
        _animated.push({ packName, stickerFile })
      } else if (stickerFile.endsWith('.webp')) {
        _static.push({ packName, stickerFile })
      }
    })
    shuffle(_animated)
    shuffle(_static)
    const prepare = function (it) {
      const ext = it.stickerFile.split('.').pop()
      return { key: it.stickerFile, src: `https://sticker-repo.github.io/s1/files/${it.stickerFile}`, extension: ext, route: `/pack/${it.packName}` }
    }
    this.animatedCards = _animated.map(prepare)
    this.staticCards = _static.map(prepare)
  },
}
</script>
