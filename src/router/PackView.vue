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
      <div role="alert" class="alert alert-warning mt-4" v-if="thumbnailExtension !== 'webp'">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Your matrix client may not support animated sticker packs!</span>
      </div>
      <button class="btn btn-secondary w-full justify-start normal-case mt-4" :disabled="isSettingForAccount" @click="setPackForAccountDirectly">
        {{ isSettingForAccount ? 'Saving to your account…' : hasMatrixAccountSession ? 'set it for my account directly' : 'login, to set this pack in your account directly' }}
      </button>
      <p v-if="accountActionMessage" class="mt-2 text-sm" :class="accountActionError ? 'text-error' : 'text-success'">{{ accountActionMessage }}</p>
      <p class="mt-4 mb-4">Use one if these approaches:</p>
      <div class="flex flex-col gap-2">
        <button class="btn btn-primary w-full justify-start capitalize" v-on:click="isCinnyOpen = !isCinnyOpen">use Cinny (by uploading Zip)
          <svg class="w-5 h-5 ml-auto" :class="isCinnyOpen ? '-rotate-90' : 'rotate-90'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div v-if="isCinnyOpen" class="card card-border bg-base-300">
          <div class="card-body">
            <ol class="list-decimal list-inside space-y-2 ml-2">
              <li>Download and unzip pack files.</li>
              <li>Open your space/room in Cinny and go to <code class="bg-base-200 px-2 py-1 rounded text-sm">Space/room Settings</code>.</li>
              <li>Open <code class="bg-base-200 px-2 py-1 rounded text-sm">Emojis & Stickers</code>.</li>
              <li>Create a <code class="bg-base-200 px-2 py-1 rounded text-sm">New pack</code> and Upload all the unzip stickers in bulk.</li>
            </ol>
          </div>
        </div>

        <button class="btn btn-primary w-full justify-start capitalize" v-on:click="isCinnyOpen2 = !isCinnyOpen2">use Cinny (by sending a room state event)
          <svg class="w-5 h-5 ml-auto" :class="isCinnyOpen2 ? '-rotate-90' : 'rotate-90'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div v-if="isCinnyOpen2" class="card card-border bg-base-300">
          <div class="card-body">
            <ol class="list-decimal list-inside space-y-2 ml-2">
              <li>Open your room in Cinny and go to <code class="bg-base-200 px-2 py-1 rounded text-sm">Room Settings</code>.</li>
              <li>Enable Developer Tools.</li>
              <li>In <code class="bg-base-200 px-2 py-1 rounded text-sm">Room State</code> section, click on <code class="bg-base-200 px-2 py-1 rounded text-sm">Expand</code>.</li>
              <li>Click on <code class="bg-base-200 px-2 py-1 rounded text-sm">Add New</code>.</li>
              <li>Enter the following data:
<pre class="overflow-auto bg-base-200 rounded ml-4"><code>State Event Type: im.ponies.room_emotes
State Key: {{ name }}
JSON Content:
{{ matrixEvent }}
</code></pre>
              </li>
            </ol>
          </div>
        </div>

        <button class="btn btn-primary w-full justify-start capitalize" v-on:click="isCurlOpen = !isCurlOpen">use curl (HTTP client)
          <svg class="w-5 h-5 ml-auto" :class="isCurlOpen ? '-rotate-90' : 'rotate-90'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div v-if="isCurlOpen" class="card card-border bg-base-300">
          <div class="card-body">
            <ol class="list-decimal list-inside space-y-2 ml-2">
              <li>Get auth token:
<pre class="overflow-auto bg-base-200 rounded ml-4"><code>curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
      "type": "m.login.password",
      "user": "YOUR_USERNAME",
      "password": "YOUR_PASSWORD"
  }' "http://account.matrix.org/_matrix/client/v3/login"
</code></pre>
              </li>
              <li>Send the room state event:
<pre class="overflow-auto bg-base-200 rounded ml-4"><code>curl -X PUT \
  'https://matrix.org/_matrix/client/v3/rooms/YOUR_ROOM_ID/state/im.ponies.room_emotes/{{ name }}' \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{{ matrixEvent }}'
</code></pre>
              </li>
            </ol>
          </div>
        </div>

        <button class="btn btn-primary w-full justify-start capitalize" v-on:click="isElementOpen = !isElementOpen">use element web / desktop
          <svg class="w-5 h-5 ml-auto" :class="isElementOpen ? '-rotate-90' : 'rotate-90'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div v-if="isElementOpen" class="card card-border bg-base-300">
          <div class="card-body">
            <ol class="list-decimal list-inside space-y-2 ml-2">
              <li>In your room type <code class="bg-base-200 px-2 py-1 rounded text-sm">/devtools</code></li>
              <li>Click <code class="bg-base-200 px-2 py-1 rounded text-sm">Explore room state</code></li>
              <li>Click <code class="bg-base-200 px-2 py-1 rounded text-sm">Send custom state event</code></li>
              <li>Enter the following data:
<pre class="overflow-auto bg-base-200 rounded ml-4"><code>Event Type: im.ponies.room_emotes
State Key: {{ name }}
Event Content:
{{ matrixEvent }}
</code></pre>
              </li>
              <li>Click <code class="bg-base-200 px-2 py-1 rounded text-sm">Send</code></li>
            </ol>
            <p class="mt-4 mb-2">Here we used Element to add the sticker pack. However, Element doesn’t support using stickers, and we should use clients like <code class="bg-base-200 px-2 py-1 rounded text-sm">FluffyChat</code> or <code class="bg-base-200 px-2 py-1 rounded text-sm">Cinny</code> afterward.</p>
          </div>
        </div>

        <a v-if="thumbnailExtension === 'webp'"
        href="https://matrix.to/#/#sticker-repo-webp:matrix.org" target="_blank" rel="noopener noreferrer"
        class="btn btn-secondary w-full justify-start normal-case">Or, find the <code class="px-1 py-0.5 rounded text-xs">{{ name }}</code> pack in our public room
          <svg class="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
        <button class="btn btn-accent w-full justify-start normal-case" :disabled="isDownloadingPack" @click="downloadPackZip">{{ isDownloadingPack ? 'Preparing zip…' : 'Or, download as zip' }}</button>
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
import JSZip from 'jszip'
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
      thumbnailExtension: '',
      stickers: [],
      premium_stickers: [],
      isCinnyOpen: false,
      isCinnyOpen2: false,
      isCurlOpen: false,
      isElementOpen: false,
      isDownloadingPack: false,
      isSettingForAccount: false,
      accountActionMessage: '',
      accountActionError: false,
    }
  },
  computed: {
    hasMatrixAccountSession() {
      if (typeof window === 'undefined') {
        return false
      }

      const token = window.localStorage.getItem('matrixAuthToken') || ''
      const server = window.localStorage.getItem('matrixAuthServer') || ''
      const user = window.localStorage.getItem('matrixAuthUser') || ''
      return Boolean(token && server && user)
    },
  },
  methods: {
    openLoginDialog() {
      window.dispatchEvent(new CustomEvent('open-matrix-login'))
    },
    getMatrixAuthSession() {
      if (typeof window === 'undefined') {
        return null
      }

      const token = window.localStorage.getItem('matrixAuthToken') || ''
      const server = window.localStorage.getItem('matrixAuthServer') || ''
      const user = window.localStorage.getItem('matrixAuthUser') || ''

      if (!token || !server || !user) {
        return null
      }

      return {
        token,
        server,
        user: user.startsWith('@') ? user : `@${user}`,
      }
    },
    async setPackForAccountDirectly() {
      this.accountActionMessage = ''
      this.accountActionError = false

      const auth = this.getMatrixAuthSession()
      if (!auth) {
        this.openLoginDialog()
        this.accountActionMessage = 'Please log in to save this pack to your Matrix account.'
        this.accountActionError = true
        return
      }

      this.isSettingForAccount = true

      try {
        const accountDataUrl = `${auth.server}/_matrix/client/v3/user/${encodeURIComponent(auth.user)}/account_data/im.ponies.emote_rooms`
        const response = await fetch(accountDataUrl, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Unable to read your Matrix account data.')
        }

        const currentData = await response.json().catch(() => ({}))
        const rooms = currentData.rooms && typeof currentData.rooms === 'object' ? { ...currentData.rooms } : {}
        const targetRoomKey = '!jxPZTvymkSnkmMlfQx:matrix.org'
        const targetRoom = rooms[targetRoomKey] && typeof rooms[targetRoomKey] === 'object' ? { ...rooms[targetRoomKey] } : {}
        targetRoom[this.name || this.title] = {}
        rooms[targetRoomKey] = targetRoom

        const putResponse = await fetch(accountDataUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...currentData,
            rooms,
          }),
        })

        if (!putResponse.ok) {
          throw new Error('Unable to save the pack to your Matrix account.')
        }

        this.accountActionMessage = `Saved ${this.name || this.title} to your Matrix account.`
      } catch (error) {
        this.accountActionError = true
        this.accountActionMessage = error.message || 'Unable to save the pack to your Matrix account.'
      } finally {
        this.isSettingForAccount = false
      }
    },
    async downloadPackZip() {
      const cards = [...this.stickers, {
        id: 'thumbnail',
        src: `/s1/files/${this.$route.params.packName}/thumbnail.${this.thumbnailExtension}`,
        extension: this.thumbnailExtension,
        fileName: `thumbnail.${this.thumbnailExtension}`,
        premium_animation: false,
      }, {
        id: 'info',
        src: `/s1/info/${this.$route.params.packName}.json`,
        extension: 'json',
        fileName: `info.json`,
        premium_animation: false,
      }]
      if (cards.length === 0) return

      this.isDownloadingPack = true
      const zip = new JSZip()

      try {
        await Promise.all(
          cards.map(async (card) => {
            const response = await fetch(card.src)
            if (!response.ok) {
              throw new Error(`Unable to download ${card.src}`)
            }
            const blob = await response.blob()
            const fileName = `${this.name || this.title || 'pack'}/${card.fileName || `${card.id}.${card.extension}`}`
            zip.file(fileName, blob)
          }),
        )

        const archive = await zip.generateAsync({ type: 'blob' })
        const downloadLink = document.createElement('a')
        const downloadUrl = URL.createObjectURL(archive)

        downloadLink.href = downloadUrl
        downloadLink.download = `${this.name || this.title || 'pack'}.zip`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        downloadLink.remove()
        URL.revokeObjectURL(downloadUrl)
        this.$refs.matrixModalRef?.close()
      } catch (error) {
        console.error('Failed to download sticker pack zip', error)
      } finally {
        this.isDownloadingPack = false
      }
    },
  },
  async created() {
    const data = await fetchJson(
      `/s1/info/${this.$route.params.packName}.json`,
    )
    if (!data) return
    this.title = data.title
    this.name = data.name
    this.thumbnailExtension = data.thumbnail_extension
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
    let matrixHomeserverHostname = window.location.hostname // using local homeserver with https://github.com/sticker-repo/matrix-homeserver/
    if (window.location.hostname === 'sticker-repo.github.io') {
      matrixHomeserverHostname = 'mtx.sticker-repo.workers.dev'; // using our cloudflare worker
    }
    for (let i = 0; i < data.stickers.length; i++) {
      const sticker = data.stickers[i]
      let s = {
        id: sticker.file_unique_id,
        src: `/s1/files/${this.$route.params.packName}/${sticker.file_unique_id}.${sticker.extension}`,
        extension: sticker.extension,
        fileName: `${sticker.file_unique_id}.${sticker.extension}`,
        premium_animation: sticker.premium_animation !== undefined,
      }
      if (s.premium_animation) {
        this.premium_stickers.push(s)
      } else {
        this.stickers.push(s)
        matrixEvent.images[String(i)] = {
          url: `mxc://${matrixHomeserverHostname}/s1-${data.name}-${sticker.file_unique_id}-${sticker.extension}`,
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
