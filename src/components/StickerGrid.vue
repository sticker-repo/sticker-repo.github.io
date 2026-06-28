<template>
  <div class="thumbnail-container">
    <template v-for="card in cards" :key="card.key || card.id || card.src">
      <tgs-player
        v-if="card.extension === 'tgs'"
        class="thumbnail"
        :class="thumbnailClass(card)"
        loop
        hover
        mode="normal"
        :src="card.src"
        @click="onClick(card)"
      ></tgs-player>

      <video
        v-else-if="card.extension === 'webm'"
        class="thumbnail"
        :class="thumbnailClass(card)"
        :src="card.src"
        muted
        loop
        playsinline
        @click="onClick(card)"
        @mouseenter="playCard($event)"
        @mouseleave="pauseCard($event)"
      ></video>

      <img
        v-else
        class="thumbnail"
        :class="thumbnailClass(card)"
        :src="card.src"
        @click="onClick(card)"
      />
    </template>
  </div>
</template>

<script>
export default {
  name: 'StickerGrid',
  props: {
    cards: { type: Array, default: () => [] },
    size: { type: String, default: 'small' },
  },
  methods: {
    thumbnailClass(card) {
      return [this.size === 'large' ? 'large' : 'small', { clickable: card.route }]
    },
    onClick(card) {
      if (card.route) {
        this.$router.push(card.route)
      }
    },
    playCard(evt) {
      const el = evt.currentTarget || evt.target
      if (!el) return
      try {
        el.muted = true
        el.loop = true
        el.play()
      } catch {
        // play may be blocked; ignore
      }
    },
    pauseCard(evt) {
      const el = evt.currentTarget || evt.target
      if (!el) return
      try {
        el.pause()
        el.currentTime = 0
      } catch {
        // ignore
      }
    },
  },
}
</script>
