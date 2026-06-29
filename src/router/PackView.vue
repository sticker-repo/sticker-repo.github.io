<script setup>
import { ref } from 'vue'

const matrixModalRef = ref(null)

const openMatrixModal = () => {
  matrixModalRef.value?.showModal()
}
</script>

<template>
  <div class="flex flex-col gap-4 my-4 sm:flex-row sm:items-center sm:justify-between">
    <h2 class="text-2xl font-bold break-words">{{ title }}</h2>
    <div class="flex flex-wrap gap-2 sm:justify-center"> 
      <button class="btn btn-soft btn-neutral capitalize" @click="openMatrixModal">
        <svg fill="currentColor" width="16" height="16" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>Matrix icon</title><path d="M.632.55v22.9H2.28V24H0V0h2.28v.55zm7.043 7.26v1.157h.033c.309-.443.683-.784 1.117-1.024.433-.245.936-.365 1.5-.365.54 0 1.033.107 1.481.314.448.208.785.582 1.02 1.108.254-.374.6-.706 1.034-.992.434-.287.95-.43 1.546-.43.453 0 .872.056 1.26.167.388.11.716.286.993.53.276.245.489.559.646.951.152.392.23.863.23 1.417v5.728h-2.349V11.52c0-.286-.01-.559-.032-.812a1.755 1.755 0 0 0-.18-.66 1.106 1.106 0 0 0-.438-.448c-.194-.11-.457-.166-.785-.166-.332 0-.6.064-.803.189a1.38 1.38 0 0 0-.48.499 1.946 1.946 0 0 0-.231.696 5.56 5.56 0 0 0-.06.785v4.768h-2.35v-4.8c0-.254-.004-.503-.018-.752a2.074 2.074 0 0 0-.143-.688 1.052 1.052 0 0 0-.415-.503c-.194-.125-.476-.19-.854-.19-.111 0-.259.024-.439.074-.18.051-.36.143-.53.282-.171.138-.319.337-.439.595-.12.259-.18.6-.18 1.02v4.966H5.46V7.81zm15.693 15.64V.55H21.72V0H24v24h-2.28v-.55z"/></svg>
        add to matrix</button>
      <a class="btn btn-soft btn-primary capitalize" :href="link" target="_blank" rel="noopener noreferrer">
        <svg fill="currentColor" width="16" height="16" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>Telegram icon</title><path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z"/></svg>
        add to telegram</a>
    </div>
  </div>
  <StickerGrid :cards="stickers" size="large" />
  <template v-if="premium_stickers.length > 0">
    <h3 class="text-xl font-semibold mt-6">premium animation</h3>
    <StickerGrid :cards="premium_stickers" size="large" />
  </template>
  <dialog ref="matrixModalRef" class="modal">
    <div class="modal-box w-full max-w-none sm:w-2/3">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="text-lg font-bold">Add this pack to a Matrix room</h3>
      <div role="alert" class="alert alert-warning mt-4" v-if="isThumbnailAnimated">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Your matrix client may not support animated sticker packs!</span>
      </div>
      <!-- 1. using a public room that has stickers -->
      <!-- curl -->
      <!-- using element -->
      <!-- find this pack in room -->
      <p class="mt-4 mb-4">Use one if these approaches to send the <code class="bg-base-200 px-1 py-0.5 rounded text-xs">room state</code> event:</p>
      <div class="flex flex-col gap-2">
        <button class="btn btn-soft btn-primary w-full justify-start capitalize">use curl (HTTP client)
          <svg class="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button class="btn btn-soft btn-primary w-full justify-start capitalize">use element 
          <svg class="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button v-if="!isThumbnailAnimated" class="btn btn-soft btn-secondary w-full justify-start normal-case mt-2">Or, find the <code class="px-1 py-0.5 rounded text-xs">{{ name }}</code> pack in our public room 
          <svg class="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div class="divider"></div>
      <p class="mt-4 mb-2">Then, to use the sticker pack globally:</p>
      <ol class="list-decimal list-inside space-y-2 ml-2">
        <li>Open <code class="bg-base-200 px-2 py-1 rounded text-sm">FluffyChat</code> and go to the room with sticker packs you want to add.</li>
        <li>Tap on the three dot menu top right and tap on <code class="bg-base-200 px-2 py-1 rounded text-sm">Emote Settings</code>.</li>
        <li>Select the sticker pack.</li>
        <li>Toggle <code class="bg-base-200 px-2 py-1 rounded text-sm">Enable emote pack globally</code>.</li>
      </ol>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script>
import { fetchJson } from '@/utils'
import StickerGrid from '@/components/StickerGrid.vue'

function extToMimetype(ext) {
  switch (ext.toLowerCase()) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'webm':
      return 'video/webm'
    case 'gif':
      return 'image/gif'
    case 'tgs':
      return 'video/tgs'
    default:
      return undefined
  }
}

export default {
  components: { StickerGrid },
  data() {
    return {
      name: '',
      title: '',
      link: '',
      typeName: '',
      matrixEvent: '',
      isThumbnailAnimated: false,
      stickers: [],
      premium_stickers: [],
    }
  },
  async created() {
    const data = await fetchJson(
      `https://sticker-repo.github.io/s1/info/${this.$route.params.packName}.json`,
    )
    if (!data) return
    this.title = data.title
    this.name = data.name
    this.isThumbnailAnimated = String(extToMimetype(data.thumbnail_extension)).includes('video')
    if (data.sticker_type === 'regular') {
      this.link = `https://t.me/addstickers/${data.name}`
      this.typeName = 'stickers'
    } else if (String(data.sticker_type).includes('emoji')) {
      this.link = `https://t.me/addemoji/${data.name}`
      this.typeName = 'emojis'
    }
    const matrixEvent = {
      images: {},
      pack: {
        display_name: data.name,
        attribution: `[sticker-repo.github.io] Original pack at ${this.link}`,
        usage: ['sticker', 'emoticon'],
      },
    }
    for (let i = 0; i < data.stickers.length; i++) {
      const sticker = data.stickers[i]
      let s = {
        id: sticker.file_unique_id,
        src: `https://sticker-repo.github.io/s1/files/${this.$route.params.packName}/${sticker.file_unique_id}.${sticker.extension}`,
        extension: sticker.extension,
        premium_animation: sticker.premium_animation !== undefined,
      }
      if (s.premium_animation) {
        this.premium_stickers.push(s)
      } else {
        this.stickers.push(s)
        matrixEvent.images[String(i)] = {
          url: `mxc://mtx.sticker-repo.workers.dev/s1-${data.name}-${sticker.file_unique_id}-${sticker.extension}`,
          body: sticker.emoji,
        }
        const mimetype = extToMimetype(sticker.extension)
        if (mimetype) {
          matrixEvent.images[String(i)]['info'] = {
            mimetype: mimetype,
          }
        }
      }
    }
    this.matrixEvent = JSON.stringify(matrixEvent);
  },
}
</script>
