'use strict'

const co = require('co')
const fetch = require('node-fetch')
const tv4 = require('tv4')
const Promise = require('bluebird')
const merge = require('lodash/merge')
const mapValues = require('lodash/mapValues')
const zipObject = require('lodash/zipObject')
const omit = require('lodash/omit')
const isUndefined = require('lodash/isUndefined')
const isFunction = require('lodash/isFunction')

const PLUGIN_DEFAULTS = {
  hooks: {},
  validate: () => true,
  predict: () => {},
  execute: () => {}
}

class Cli {
  run (argv) {
    return co(this._run.bind(this, argv))
  }

  * _run (argv) {
    console.log('Loading template')
    const template = yield this.loadTemplate(argv)
    console.log('Loading plugins')
    let plugins = yield this.loadPlugins(template)
    console.log('Loading hooks')
    const hooks = yield this.getHooks(plugins)
    console.log('Validating state')
    plugins = yield this.validateState(plugins, hooks)
    if (!argv.validateOnly) {
      console.log('Predicting actions')
      yield this.predictActions(plugins, hooks)
      console.log('Executing actions')
      yield this.executeActions(plugins, hooks)
    }
  }

  loadTemplate (argv) {
    return co(this._loadTemplate.bind(this, argv))
  }

  * _loadTemplate (argv) {
    const templateUri = argv._[0]

    const templateResult = yield fetch(templateUri)
    const template = yield templateResult.json()

    // Validate repotool template
    tv4.validate(template, require('../../schemas/Template.json'))

    this.template = template
  }

  loadPlugins () {
    return co(this._loadPlugins.bind(this))
  }

  * _loadPlugins () {
    const missingPlugins = []
    const plugins = this.template.plugins.map((config) => {
      const moduleName = 'repotool-plugin-' + config.module
      try {
        // We only resolve the plugin, because if we required it here it might
        // itself include a missing module throwing a MODULE_NOT_FOUND error and
        // thereby creating a false positive.
        require.resolve(moduleName)
      } catch (err) {
        if (typeof err === 'object' && err.code === 'MODULE_NOT_FOUND') {
          missingPlugins.push(moduleName)
          return
        } else throw err
      }

      const plugin = require(moduleName)

      return Object.assign({ module: config.module }, PLUGIN_DEFAULTS, plugin(config))
    })

    if (missingPlugins.length) {
      console.log('Missing plugins, please run:')
      console.log('npm install -g ' + missingPlugins.join(' '))
      process.exit(1)
    }

    return plugins
  }

  getHooks (plugins) {
    const hooksByPlugin = plugins.map((plugin) => {
      return mapValues(plugin.hooks, (hook) => [hook])
    })

    function customizer (objValue, srcValue) {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue)
      }
    }

    const hooks = mergeWith({}, ...hooksByPlugin, customizer)

    function getHook (hookName) {
      const hook = hooks[hookName]

      if (hook) return Promise.mapSeries(hook, (cb) => isFunction(cb) ? cb() : cb)
    }

    return (requestedHooks) => {
      if (Array.isArray(requestedHooks)) {
        return Promise.mapSeries(requestedHooks, (hookName) => {
          return getHook(hookName)
        })
          .then((resolvedHooks) => {
            return zipObject(requestedHooks, resolvedHooks)
          })
          .then(omit(isUndefined))
      } else {
        return getHook(requestedHooks)
      }
    }
  }

  validateState (plugins, hooks) {
    // Run validation on all plugins and return plugin objects that had negative
    // results during validation
    return Promise.filter(plugins, (plugin) => {
      return Promise.resolve(plugin.validate(hooks)).then(val => !val)
    })
  }

  predictActions (plugins, hooks) {
    return Promise.all(plugins.map((plugin) => plugin.predict(hooks)))
  }

  executeActions (plugins, hooks) {
    return Promise.all(plugins.map((plugin) => plugin.execute(hooks)))
  }
}

module.exports = Cli
