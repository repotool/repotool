export type Hook = () => Promise<any> | any
export type HookMap = { [hookName: string]: Hook[] }
export type HookGetter = (requestedHooks: string[] | string) => any
