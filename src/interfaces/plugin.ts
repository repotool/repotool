import { HookMap, HookGetter } from './hook'

export interface Plugin {
  module: string,
  hooks: HookMap,
  validate: (hooks: HookGetter) => Promise<boolean> | boolean,
  predict: (hooks: HookGetter) => Promise<undefined> | undefined,
  execute: (hooks: HookGetter) => Promise<undefined> | undefined
}

export interface PluginFactory {
  (config: Object, context: Object): Promise<Plugin> | Plugin
}
