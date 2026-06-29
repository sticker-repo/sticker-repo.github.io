
<script setup>
import { fetchJson } from '@/utils'
import * as unicodeEmoji from 'unicode-emoji';
</script>

<template>
  <h2 class="text-2xl font-bold my-4">select an emoji to search</h2>
  <div class="flex flex-wrap gap-2">
    <button
      class="btn btn-ghost text-2xl"
      v-for="emoji in emojis"
      :key="emoji"
      v-on:click="$router.push(`/search/${emoji}`)"
    >
      {{ emoji }}
    </button>
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
