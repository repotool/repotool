import fs = require('mz/fs')
import path = require('path')
import tv4 = require('tv4')
const semverRegex: () => RegExp = require('semver-regex')
import canRequire from '../util/canRequire'
import { Plugin } from '../interfaces/plugin'
import { logError, logSuccess } from './gfx'

// type MaybeLaterPolicy = Promise<Object> | Object
// type MaybeLayerPolicyFactory = () => MaybeLaterPolicy

export const resolvePolicy = async (policyPath?: string): Promise<Object> => {
  if (!policyPath) {
    policyPath = './repotool.js'

    const packageJsonFile = await fs.readFile('package.json', 'utf-8')
    if (packageJsonFile) {
      const packageJson = JSON.parse(packageJsonFile)
      return packageJson.repotool
    }
  }

  let policy: Object | (() => Promise<Object> | Object)
  if (canRequire(policyPath)) {
    policy = require(policyPath)
  } else {
    policy = require(path.resolve(policyPath))
  }

  if (typeof policy === 'function') {
    policy = await Promise.resolve(policy())
  }

  return policy
}

export const validatePolicy = (policy: any): policy is Plugin => {
  // Validate repotool policy
  const validation = tv4.validateResult(policy, require('../../schemas/Policy.json'))
  if (!validation.valid) {
    console.error()
    logError('invalid', '<b>Policy did not match the schema</b>')
    console.error()
    console.error('         at ' + validation.error.schemaPath + ': ' +
      validation.error.message)
    console.error()
    process.exit(1)
  }
  if (!semverRegex().test(policy.version)) {
    console.error()
    logError('invalid', `<b>Policy contains invalid version: <red>${policy.version}</red></b>`)
    console.error()
    return false
  }

  console.info()
  logSuccess('✔', `Using policy <b>${policy.name}@${policy.version}</b>`)

  return true
}

export const loadPolicy = (async (policyPath?: string): Promise<Plugin> => {
  const policy = await resolvePolicy(policyPath)

  if (!validatePolicy(policy)) {
    throw new Error('Invalid policy')
  }

  return policy
})
