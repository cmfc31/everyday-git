import type { Catalog } from '../content/types'
import es419 from './es-419.json'
import en from './en.json'

export const catalogs: Record<'en' | 'es-419', Catalog> = {
  en: en as Catalog,
  'es-419': es419 as Catalog,
}
