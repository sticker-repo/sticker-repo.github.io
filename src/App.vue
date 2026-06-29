<script setup></script>

<template>
  <div class="navbar bg-base-200 shadow-sm sticky top-0 z-50">
    <div class="flex-1">
      <template v-if="$route.path === '/'">
        <div class="dropdown sm:hidden">
          <div tabindex="0" role="button" class="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
          </div>
          <ul
            tabindex="-1"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-48 p-2 shadow">
            <li><a class="text-base" href="/#animated-packs" >animated packs</a></li>
            <li><a class="text-base" href="/#static-packs" >static packs</a></li>
          </ul>
        </div>
      </template>
      <a class="btn btn-ghost text-xl capitalize" href="/" >sticker repo</a>
      <template v-if="$route.path === '/'">
        <a class="btn btn-ghost capitalize hidden sm:flex" href="/#animated-packs" >animated packs</a>
        <a class="btn btn-ghost capitalize hidden sm:flex" href="/#static-packs" >static packs</a>
      </template>
    </div>
    <div class="flex-none">
      <a v-if="$route.path === '/'" v-on:click="$router.push(`/search`)" class="btn btn-secondary mr-2 capitalize">search with emoji</a>
      <a v-else v-on:click="$router.back()" class="btn btn-outline capitalize">back</a>
    </div>
  </div>
  <main>
    <RouterView />
  </main>
  <div class="footer footer-center p-4 bg-base-200 text-base-content">
    <div>
      <p>Open source at <a href="https://github.com/sticker-repo/sticker-repo.github.io" class="link">https://github.com/sticker-repo/sticker-repo.github.io</a></p>
      <p class="text-sm">Licences: All stickers are the property of their respective artists. The repository creator disclaims any ownership and takes no responsibility for misuse.</p>
    </div>
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
