import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './HomeView.vue'
import PackView from './PackView.vue'
import SearchView from './SearchView.vue'
import SearchResultView from './SearchResultView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/search', component: SearchView },
    { path: '/search/:emoji', component: SearchResultView },
    { path: '/pack/:packName', component: PackView },
  ],
})

export default router
