
<script setup>
import { fetchJson } from '@/utils'
import * as unicodeEmoji from 'unicode-emoji';
</script>

<template>
  <div class="header-2">select an emoji to search</div>
  <div class="emoji-container">
    <div
      class="emoji"
      v-for="emoji in emojis"
      :key="emoji"
      v-on:click="$router.push(`/search/${emoji}`)"
    >
      {{ emoji }}
    </div>
  </div>
</template>

<style scoped>
.emoji-container {
  display: flex;
  flex-flow: row wrap;
  gap: 0.25em;
}
.emoji {
  /* min-width: 1em; */
  cursor: pointer;
}
</style>

<script>
export default {
  data() {
    return {
      emojis: [],
      stickers: {
        tgs: [],
        webp: [],
      },
    }
  },
  computed: {},
  created() {
    const indexMap = new Map(unicodeEmoji.getEmojis().map(e => e.emoji).map((v, i) => [v, i]));    
    fetchJson('https://sticker-repo.github.io/s1/emoji_index.json').then((data) => {
      if (!data) return
      let emojis = Object.keys(data).sort()
      emojis.sort((a, b) => {
        const ia = indexMap.has(a) ? indexMap.get(a) : Number.MAX_SAFE_INTEGER;
        const ib = indexMap.has(b) ? indexMap.get(b) : Number.MAX_SAFE_INTEGER;
        return ia - ib;
      });
      this.emojis = emojis;
    })
  },
  methods: {},
}
</script>
