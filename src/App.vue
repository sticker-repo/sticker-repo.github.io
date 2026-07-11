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
      <a v-if="$route.path === '/'" class="btn btn-secondary capitalize" @click="$router.push('/search')">search with emoji</a>
      <a v-else @click="$router.back()" class="btn btn-outline capitalize">back</a>
      <button type="button" class="btn btn-outline capitalize ml-2 mr-2" @click="handleAuthButtonClick">
        {{ isAuthenticated ? 'logout' : isHandlingSsoCallback ? 'finishing login…' : 'login' }}
      </button>
    </div>
  </div>

  <dialog ref="loginDialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Matrix login</h3>
      <p class="py-2 text-sm">Sign in with your Matrix account to add packs with one click.</p>
      <form class="space-y-4" @submit.prevent="submitLogin">
        <label class="form-control w-full">
          <span class="label-text">Matrix ID</span>
          <input v-model="loginForm.matrixId" class="input input-bordered w-full" placeholder="user:matrix.org" required />
        </label>
        <label class="form-control w-full">
          <span class="label-text">Password</span>
          <input
            v-model="loginForm.password"
            :disabled="usesSsoLogin"
            :class="{ 'input-disabled opacity-60': usesSsoLogin }"
            type="password"
            class="input input-bordered w-full"
            placeholder="••••••••"
            :required="!usesSsoLogin"
          />
        </label>
        <p v-if="usesSsoLogin" class="text-sm text-info">
          Mozilla SSO is enabled for this Matrix ID. The password field is disabled and the form will continue through Mozilla sign-in.
        </p>
        <p v-if="loginError" class="text-sm text-error">{{ loginError }}</p>
        <p class="py-2 text-sm">Privacy note: The login is client-side and your login credentials do not leave your browser. If you want, you can also <a href="https://github.com/sticker-repo/matrix-homeserver" class="link">self-host this website!</a></p>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="closeLoginDialog">Cancel</button>
          <button type="submit" class="btn btn-primary" :class="{ loading: isSubmitting }">
            {{ isSubmitting ? 'Signing in…' : usesSsoLogin ? 'Continue with Mozilla SSO' : 'Login' }}
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="submit">close</button>
    </form>
  </dialog>

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
      isAuthenticated: false,
      authToken: '',
      authServer: '',
      authUser: '',
      loginError: '',
      isSubmitting: false,
      isHandlingSsoCallback: false,
      pendingSsoServer: '',
      pendingSsoUser: '',
      loginForm: {
        matrixId: '',
        password: '',
      },
    }
  },
  computed: {
    usesSsoLogin() {
      const matrixId = (this.loginForm.matrixId || '').trim()
      if (!matrixId) {
        return false
      }

      const domain = matrixId.replace(/^@/, '').split(':').pop()?.toLowerCase()
      return ['mozilla.org', 'mozilla.modular.im', 'modular.im'].includes(domain)
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.handleSsoCallback()
      },
      immediate: true,
    },
  },
  created() {
    this.restoreSession()
  },
  mounted() {
    this.handleSsoCallback()
    window.addEventListener('open-matrix-login', this.openLoginDialog)
  },
  beforeUnmount() {
    window.removeEventListener('open-matrix-login', this.openLoginDialog)
  },
  methods: {
    restoreSession() {
      if (typeof window === 'undefined') {
        return
      }

      const token = window.localStorage.getItem('matrixAuthToken') || ''
      const server = window.localStorage.getItem('matrixAuthServer') || ''
      const user = window.localStorage.getItem('matrixAuthUser') || ''

      if (token && server && user) {
        this.isAuthenticated = true
        this.authToken = token
        this.authServer = server
        this.authUser = user
      }
    },
    openLoginDialog() {
      this.loginError = ''
      this.loginForm = {
        matrixId: '',
        password: '',
      }
      this.$nextTick(() => {
        this.$refs.loginDialog?.showModal()
      })
    },
    handleAuthButtonClick() {
      if (this.isAuthenticated) {
        this.logout()
        return
      }

      this.openLoginDialog()
    },
    closeLoginDialog() {
      this.$refs.loginDialog?.close()
    },
    async submitLogin() {
      this.loginError = ''
      this.isSubmitting = true

      const matrixId = this.loginForm.matrixId.trim()
      const username = matrixId.split(":")[0]
      const password = this.loginForm.password

      try {
        const server = this.resolveLoginServer(matrixId)
        if (!server) {
          throw new Error('Please enter a valid Matrix ID such as user:matrix.org')
        }

        if (this.usesSsoLogin) {
          await this.startSsoLogin(server, matrixId)
          return
        }

        const response = await fetch(`${server}/_matrix/client/v3/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'm.login.password',
            user: username,
            password,
          }),
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || !data.access_token) {
          throw new Error(data.error || data.message || 'Login failed. Please check your credentials and homeserver.')
        }

        this.persistSession(data.access_token, server, matrixId)
        this.closeLoginDialog()
      } catch (error) {
        this.loginError = error.message || 'Unable to sign in right now.'
      } finally {
        this.isSubmitting = false
      }
    },
    async startSsoLogin(server, matrixId) {
      const redirectUrl = `${window.location.origin}${window.location.pathname}`
      this.pendingSsoServer = server
      this.pendingSsoUser = matrixId
      window.sessionStorage.setItem('matrixPendingSsoServer', server)
      window.sessionStorage.setItem('matrixPendingSsoUser', matrixId)

      const loginUrl = `${server}/_matrix/client/v3/login/sso/redirect?redirectUrl=${encodeURIComponent(redirectUrl)}`
      window.location.assign(loginUrl)
    },
    async handleSsoCallback() {
      const params = new URLSearchParams(window.location.search)
      const loginToken = params.get('loginToken') || params.get('login_token')
      if (!loginToken) {
        this.isHandlingSsoCallback = false
        return
      }

      this.isHandlingSsoCallback = true

      const pendingSsoServer = this.pendingSsoServer || window.sessionStorage.getItem('matrixPendingSsoServer') || ''
      const pendingSsoUser = this.pendingSsoUser || window.sessionStorage.getItem('matrixPendingSsoUser') || ''
      if (!pendingSsoServer) {
        this.isHandlingSsoCallback = false
        return
      }

      try {
        const response = await fetch(`${pendingSsoServer}/_matrix/client/v3/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'm.login.token',
            token: loginToken,
          }),
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.access_token) {
          throw new Error(data.error || data.message || 'Mozilla SSO login could not be completed.')
        }

        this.persistSession(data.access_token, pendingSsoServer, pendingSsoUser)
        this.closeLoginDialog()
        const cleanUrl = window.location.origin + window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
      } catch (error) {
        this.loginError = error.message || 'Mozilla Sso login could not be completed.'
      } finally {
        this.pendingSsoServer = ''
        this.pendingSsoUser = ''
        this.isHandlingSsoCallback = false
        window.sessionStorage.removeItem('matrixPendingSsoServer')
        window.sessionStorage.removeItem('matrixPendingSsoUser')
      }
    }, 
    resolveLoginServer(matrixId) {
      const match = matrixId.match(/^@?[^:]+:(.+)$/)
      if (!match) {
        return null
      }

      const domain = match[1].toLowerCase()
      if (domain === 'matrix.org') {
        return 'https://account.matrix.org'
      }

      if (['mozilla.org', 'mozilla.modular.im', 'modular.im'].includes(domain)) {
        return 'https://mozilla.modular.im'
      }

      return `https://${domain}`
    },
    persistSession(token, server, user) {
      if (typeof window === 'undefined') {
        return
      }

      window.localStorage.setItem('matrixAuthToken', token)
      window.localStorage.setItem('matrixAuthServer', server)
      window.localStorage.setItem('matrixAuthUser', user)

      this.isAuthenticated = true
      this.authToken = token
      this.authServer = server
      this.authUser = user
    },
    clearSession() {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('matrixAuthToken')
        window.localStorage.removeItem('matrixAuthServer')
        window.localStorage.removeItem('matrixAuthUser')
      }

      this.isAuthenticated = false
      this.authToken = ''
      this.authServer = ''
      this.authUser = ''
      this.loginError = ''      
      this.pendingSsoServer = ''
      this.pendingSsoUser = ''    
    },
    async logout() {
      if (this.authToken && this.authServer) {
        try {
          await fetch(`${this.authServer}/_matrix/client/v3/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.authToken}`,
            },
          })
        } catch (error) {
          // Ignore logout errors and still clear the local session.
        }
      }

      this.clearSession()
    },
  },
}
</script>
