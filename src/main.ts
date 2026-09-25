import { createApp, watch } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'
import { applyTheme, listenForSystemTheme, progress } from './progress'
import { router } from './router'
import './styles/theme.css'
import './styles/practice.css'

applyTheme()
listenForSystemTheme()
document.documentElement.lang = progress.language

watch(
  () => progress.language,
  (locale) => {
    document.documentElement.lang = locale
  },
)

createApp(App).use(router).use(i18n).mount('#app')
