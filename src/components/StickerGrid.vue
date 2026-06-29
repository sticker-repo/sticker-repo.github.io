<template>
  <div class="flex flex-wrap items-center justify-start gap-2">
    <template v-for="card in cards" :key="card.key || card.id || card.src">
        <div :class="['rounded-xl overflow-hidden shadow-lg', card.route ? 'cursor-pointer hover:shadow-lg' : '']" @click="onClick(card)">
          <tgs-player
            v-if="card.extension === 'tgs'"
            :class="thumbnailClass(card)"
            loop
            hover
            mode="normal"
            :src="card.src"
          ></tgs-player>

          <video
            v-else-if="card.extension === 'webm'"
            :class="thumbnailClass(card)"
            :src="card.src"
            muted
            loop
            playsinline
            @mouseenter="playCard($event)"
            @mouseleave="pauseCard($event)"
          ></video>

          <img
            v-else
            :class="thumbnailClass(card)"
            :src="card.src"
          />
      </div>
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
      const sizeCls = this.size === 'large' ? 'w-32 h-32' : 'w-16 h-16'
      const common = 'object-contain rounded-lg p-1'
      const clickable = card.route ? 'cursor-pointer' : ''
      return [sizeCls, common, clickable].join(' ')
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
