<template>
  <!-- top-16 is from the navbar height -->
  <h2 class="text-2xl font-bold my-4 shadow-sm sticky top-16 z-20 bg-base-100"  >animated sticker packs</h2>
  <StickerGrid :cards="animatedCards" size="small" class="scroll-mt-28" id="animated-packs" />
  <h2 class="text-2xl font-bold my-4 shadow-sm sticky top-16 z-20 bg-base-100" >static sticker packs</h2>
  <StickerGrid :cards="staticCards" size="small" class="scroll-mt-28" id="static-packs" />
</template>

<script>
import { shuffle, fetchJson } from '@/utils'
import StickerGrid from '@/components/StickerGrid.vue'

export default {
  components: { StickerGrid },
  data() {
    return {
      packs: { tgs: [], webp: [], webm: [] },
      tgsCards: [],
      webpCards: [],
      webmCards: [],
    }
  },
  computed: {
    staticCards() {
      return [...this.webpCards]
    },
    animatedCards() {
      return [...this.tgsCards, ...this.webmCards]
    },
  },
  async created() {
    const data = await fetchJson('/s1/thumbnails.json')
    if (data) {
      const packs = data
      if (packs.tgs) shuffle(packs.tgs)
      if (packs.webp) shuffle(packs.webp)
      if (packs.webm) shuffle(packs.webm)
      this.packs = packs
      this.tgsCards = packs.tgs.map((item) => ({ key: item, src: `/s1/files/${item}/thumbnail.tgs`, extension: 'tgs', route: `/pack/${item}` }))
      this.webpCards = (packs.webp || []).map((item) => ({ key: item, src: `/s1/files/${item}/thumbnail.webp`, extension: 'webp', route: `/pack/${item}` }))
      this.webmCards = (packs.webm || []).map((item) => ({ key: item, src: `/s1/files/${item}/thumbnail.webm`, extension: 'webm', route: `/pack/${item}` }))
    }
  },
}
</script>
