import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import TGSPlayer from "@lottiefiles/lottie-player/dist/tgs-player";
import "./main.css"

const app = createApp(App)

app.use(router)
app.use(TGSPlayer);

app.mount('#app')

// FFFDF6
// FAF6E9
// DDEB9D
// A0C878