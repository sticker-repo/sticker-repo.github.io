<script setup></script>

<template>
  <div class="header-1">
    sticker repo
    <a v-if="$route.path === '/'" v-on:click="$router.push(`/search`)" class="search-btn"
      >search with emoji</a
    >
    <a v-else v-on:click="$router.back()" class="back-btn">back</a>
  </div>
  <main>
    <RouterView />
  </main>
  <div class="footnote">
    Open source at
    <a href="https://github.com/sticker-repo/sticker-repo.github.io"
      >https://github.com/sticker-repo/sticker-repo.github.io</a
    >
    <br />
    Licences: All stickers are the property of their respective artists. The repository creator
    disclaims any ownership and takes no responsibility for misuse.
  </div>
</template>

<style scoped></style>

<script>
export default {
  data() {
    return {
      // inLoading: true,
      // packs: {
      //   tgs: [],
      //   webp: [],
      // },
    }
  },
  computed: {},
  created() {
    // window.addEventListener('load', this.onLoad)
    // this.$nextTick(() => {
    //   window.addEventListener('resize', this.onResize)
    // })
    // fetch('https://sticker-repo.github.io/s1/thumbnails.json')
    //   .then((response) => {
    //     response
    //       .json()
    //       .then((data) => {
    //         let packs = {
    //           tgs: [],
    //           webp: [],
    //         }
    //         for (const packName in data) {
    //           const thumbnailFormat = data[packName]
    //           if (thumbnailFormat === 'tgs') {
    //             packs.tgs.push(packName)
    //           } else if (thumbnailFormat === 'webp') {
    //             packs.webp.push(packName)
    //           }
    //         }
    //         shuffle(packs.tgs)
    //         shuffle(packs.webp)
    //         this.packs = packs
    //       })
    //       .catch()
    //   })
    //   .catch()
  },
  methods: {
    // onLoad() {
    //   this.inLoading = false
    // },
  },
}
</script>
