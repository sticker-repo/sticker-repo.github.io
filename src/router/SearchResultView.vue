<template>
  <div v-if="animatedCards.length > 0">
    <h2 class="text-2xl font-bold my-4">animated stickers</h2>
    <StickerGrid :cards="animatedCards" size="small" />
  </div>
  <div v-if="staticCards.length > 0">
    <h2 class="text-2xl font-bold my-4">static stickers</h2>
    <StickerGrid :cards="staticCards" size="small" />
  </div>
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
