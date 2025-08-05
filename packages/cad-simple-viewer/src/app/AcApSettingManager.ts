import { AcCmEventManager } from '@mlightcad/data-model'
import { defaults } from 'lodash-es'

/**
 * Font mappings.
 * - The key is the original font name
 * - The value is the mapped font name
 */
export type AcApFontMapping = Record<string, string>

export interface AcApSettings {
  isDebug: boolean
  isShowCommandLine: boolean
  isShowCoordinate: boolean
  isShowToolbar: boolean
  isShowStats: boolean
  fontMapping: AcApFontMapping
}

const DEFAULT_VALUES: AcApSettings = {
  isDebug: false,
  isShowCommandLine: true,
  isShowCoordinate: true,
  isShowToolbar: true,
  isShowStats: false,
  fontMapping: {}
}

const SETTINGS_LS_KEY = 'settings'

export interface AcApSettingManagerEventArgs<
  T extends AcApSettings = AcApSettings
> {
  key: keyof T
  value: unknown
}

export class AcApSettingManager<T extends AcApSettings = AcApSettings> {
  private static _instance?: AcApSettingManager

  public readonly events = {
    modified: new AcCmEventManager<AcApSettingManagerEventArgs<T>>()
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new AcApSettingManager()
    }
    return this._instance
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    const toggles = this.settings
    toggles[key] = value
    localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(toggles))
    this.events.modified.dispatch({
      key: key,
      value
    })
  }

  get<K extends keyof T>(key: K) {
    return this.settings[key]
  }

  toggle<K extends keyof T>(key: K) {
    const value = this.get(key)
    // @ts-expect-error The caller should guarantee the correct feature name passed to this function
    this.set(key, !value)
  }

  get isDebug() {
    return this.get('isDebug')
  }

  set isDebug(value: boolean) {
    this.set('isDebug', value)
  }

  get isShowCommandLine() {
    return this.get('isShowCommandLine')
  }

  set isShowCommandLine(value: boolean) {
    this.set('isShowCommandLine', value)
  }

  get isShowCoordinate() {
    return this.get('isShowCoordinate')
  }

  set isShowCoordinate(value: boolean) {
    this.set('isShowCoordinate', value)
  }

  get isShowToolbar() {
    return this.get('isShowToolbar')
  }

  set isShowToolbar(value: boolean) {
    this.set('isShowToolbar', value)
  }

  get isShowStats() {
    return this.get('isShowStats')
  }

  set isShowStats(value: boolean) {
    this.set('isShowStats', value)
  }

  get fontMapping() {
    return this.get('fontMapping')
  }

  set fontMapping(value: AcApFontMapping) {
    this.set('fontMapping', value)
  }

  setFontMapping(originalFont: string, mappedFont: string) {
    const mapping = this.get('fontMapping') as AcApFontMapping
    mapping[originalFont] = mappedFont
    this.set('fontMapping', mapping)
  }

  get settings() {
    const values = localStorage.getItem(SETTINGS_LS_KEY)
    const results = (values == null ? {} : JSON.parse(values)) as T
    return defaults(results, DEFAULT_VALUES)
  }
}
