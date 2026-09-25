import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import { progress } from '../progress'
import es419 from './es-419.json'
import en from './en.json'

export const i18n = createI18n({
  legacy: false,
  locale: progress.language,
  fallbackLocale: 'en',
  messages: {
    en,
    'es-419': es419,
  },
})

watch(
  () => progress.language,
  (locale) => {
    i18n.global.locale.value = locale
  },
)
