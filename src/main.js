import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import TGSPlayer from "@lottiefiles/lottie-player/dist/tgs-player";
import "./main.scss"

const app = createApp(App)

app.use(router)
app.use(TGSPlayer);

// Sync DaisyUI `data-theme` with system light/dark preference
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
if (window.matchMedia) {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
	});
}

app.mount('#app')

// FFFDF6
// FAF6E9
// DDEB9D
// A0C878