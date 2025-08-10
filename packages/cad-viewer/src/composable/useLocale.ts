import en from 'element-plus/es/locale/lang/en'
import zh from 'element-plus/es/locale/lang/zh-cn'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { i18n, LocaleProp,LocaleValue } from '../locale'

const STORAGE_KEY = 'preferred_lang'

export function useLocale(propLocale?: LocaleProp) {
  const { locale: i18nLocale } = useI18n()
  
  // Get initial locale from localStorage or browser preference
  const getInitialLocale = (): LocaleValue => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'zh') return stored
    
    const browserLang = navigator.language.toLowerCase()
    const browserLocale = browserLang.substring(0, 2)
    return browserLocale === 'zh' ? 'zh' : 'en'
  }
  
  // Current effective locale
  const currentLocale = ref<LocaleValue>(getInitialLocale())
  
  // Effective locale - always return the current active locale
  const effectiveLocale = computed<LocaleProp>(() => {
    return currentLocale.value
  })
  

  
  // Set locale and update all related systems
  const setLocale = (newLocale: LocaleValue) => {
    // Update i18n locale
    i18n.global.locale.value = newLocale
    
    // Update local state
    currentLocale.value = newLocale
    
    // Update localStorage (only if not controlled by prop)
    if (!propLocale || propLocale === 'default') {
      localStorage.setItem(STORAGE_KEY, newLocale)
    }
  }
  
  // Clear localStorage preference (used when prop takes precedence)
  const clearStoragePreference = () => {
    localStorage.removeItem(STORAGE_KEY)
  }
  
  // Watch for prop changes
  if (propLocale) {
    watch(
      () => propLocale,
      (newPropLocale) => {
        if (newPropLocale && newPropLocale !== 'default') {
          // Initialize with prop value
          currentLocale.value = newPropLocale
          i18n.global.locale.value = newPropLocale
          clearStoragePreference()
        }
      },
      { immediate: true }
    )
  }
  
  // Watch for i18n locale changes (from other components)
  watch(
    () => i18nLocale.value,
    (newI18nLocale) => {
      // Only update if not controlled by prop
      if (!propLocale || propLocale === 'default') {
        const validLocale = newI18nLocale === 'zh' ? 'zh' : 'en'
        currentLocale.value = validLocale
      }
    }
  )
  
  // Element Plus locale computed
  const elementPlusLocale = computed(() => {
    return effectiveLocale.value === 'en' ? en : zh
  })

  return {
    currentLocale,
    effectiveLocale,
    elementPlusLocale,
    setLocale,
    clearStoragePreference,
    isControlled: computed(() => !!(propLocale && propLocale !== 'default'))
  }
}
