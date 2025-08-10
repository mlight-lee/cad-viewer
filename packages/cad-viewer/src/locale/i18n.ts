import { AcEdCommandStack } from '@mlightcad/cad-simple-viewer'
import { AcDbConversionStage, AcDbEntity } from '@mlightcad/data-model'
import { createI18n } from 'vue-i18n'

import enCommand from './en/command'
import enDialog from './en/dialog'
import enEntity from './en/entity'
import enMain from './en/main'
import zhCommand from './zh/command'
import zhDialog from './zh/dialog'
import zhEnity from './zh/entity'
import zhMain from './zh/main'

// Get language of browser - use same logic as useLocale
const getInitialLocale = (): string => {
  const stored = localStorage.getItem('preferred_lang')
  if (stored === 'en' || stored === 'zh') return stored
  
  const browserLang = navigator.language.toLowerCase()
  const browserLocale = browserLang.substring(0, 2)
  return browserLocale === 'zh' ? 'zh' : 'en'
}

const messages = {
  en: {
    main: enMain,
    command: enCommand,
    dialog: enDialog,
    entity: enEntity
  },
  zh: {
    main: zhMain,
    command: zhCommand,
    dialog: zhDialog,
    entity: zhEnity
  }
}

export const i18n = createI18n({
  legacy: false,
  messages,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  allowComposition: true,
  globalInjection: true
})

export const cmdDescription = (groupName: string, cmdName: string) => {
  const t = i18n.global.t
  const key = `command.${groupName}.${cmdName}`
  return t(key, '')
}

export const sysCmdDescription = (name: string) => {
  return cmdDescription(AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME, name)
}

export const userCmdDescription = (name: string) => {
  return cmdDescription(AcEdCommandStack.DEFAUT_COMMAND_GROUP_NAME, name)
}

export const entityName = (entity: AcDbEntity) => {
  const t = i18n.global.t
  const key = 'entity.entityName.' + entity.type
  return t(key, entity.type)
}

export const colorName = (colorKeyName: string) => {
  if (colorKeyName == 'ByLayer' || colorKeyName == 'ByBlock') {
    return colorKeyName
  } else {
    const t = i18n.global.t
    const key = 'entity.color.' + colorKeyName
    return t(key, colorKeyName)
  }
}

export const progressStageName = (stage: AcDbConversionStage) => {
  const t = i18n.global.t
  const key = 'main.progress.' + stage.replace(/_/g, '').toLowerCase()
  return t(key, stage)
}

export default i18n
