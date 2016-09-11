'use strict'

const co = require('co')
const fetch = require('node-fetch')
const tv4 = require('tv4')
const chalk = require('chalk')
const inquirer = require('inquirer')
const Promise = require('bluebird')
const semverRegex = require('semver-regex')
const mergeWith = require('lodash/mergeWith')
const mapValues = require('lodash/fp/mapValues')
const zipObject = require('lodash/zipObject')
const isFunction = require('lodash/isFunction')

const gfx = require('./gfx')

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
    gfx.renderTruck()
    gfx.logStepHeadline('Loading policy')
    const policy = yield this.loadTemplate(argv)
    let plugins = yield this.loadPlugins(policy)
    const hooks = this.getHooks(plugins)
    gfx.logStepHeadline('Validating state')
    plugins = yield this.validateState(plugins, hooks)
    if (plugins.length && !argv.validateOnly) {
      gfx.logStepHeadline('Predicting actions')
      yield this.predictActions(plugins, hooks)
      console.info()
      const answers = yield inquirer.prompt([{
        type: 'confirm',
        name: 'confirmed',
        message: 'Would you like to execute these actions?',
        default: false
      }])

      if (answers.confirmed) {
        gfx.logStepHeadline('Executing actions')
        yield this.executeActions(plugins, hooks)

        console.info()
        console.info(chalk.green.bold('All done'))
      } else {
        console.info()
        console.info(chalk.yellow.bold('Aborted by user'))
      }
    } else if (!plugins.length) {
      console.info()
      console.info(chalk.green.bold('Everything valid'))
    } else {
      console.warn()
      console.warn(chalk.yellow.bold('Repository is not compliant, exiting with status 1'))
      console.warn()
      process.exit(1)
    }
    console.info()
  }

  loadTemplate (argv) {
    return co(this._loadTemplate.bind(this, argv))
  }

  * _loadTemplate (argv) {
    const policyUri = argv._[0]

    const policyResult = yield fetch(policyUri)
    const policy = yield policyResult.json()

    // Validate repotool policy
    const validation = tv4.validateResult(policy, require('../../schemas/Policy.json'))
    if (!validation.valid) {
      console.error()
      console.error(chalk.red(' invalid') + ' ' +
        chalk.bold('Policy did not match the schema'))
      console.error()
      console.error('         at ' + validation.error.schemaPath + ': ' +
        validation.error.message)
      console.error()
      process.exit(1)
    }

    if (!semverRegex().test(policy.version)) {
      console.error()
      console.error(chalk.red(' invalid') + ' ' +
        chalk.bold('Policy contains invalid version: ' + chalk.red(policy.version)))
      console.error()
      process.exit(1)
    }

    console.info()
    console.info(chalk.green('       ✔') + ' Using policy ' +
      chalk.bold(policy.name + '@' + policy.version))

    this.policy = policy
  }

  loadPlugins () {
    return co(this._loadPlugins.bind(this))
  }

  * _loadPlugins () {
    const missingPlugins = []
    const plugins = this.policy.plugins.map((config) => {
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

      return Object.assign(
        {},
        PLUGIN_DEFAULTS,
        plugin(config),
        { module: config.module }
      )
    })

    if (missingPlugins.length) {
      console.error()
      console.error(chalk.red(' plugins') + ' Missing plugins, please run:')
      console.error()
      console.error('         npm install -g ' + missingPlugins.join(' '))
      console.error()
      process.exit(1)
    }

    return plugins
  }

  getHooks (plugins) {
    const hooksByPlugin = plugins.map((plugin) => {
      return mapValues((hook) => [hook], plugin.hooks)
    })

    function customizer (objValue, srcValue) {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue)
      }
    }

    const hooks = mergeWith({}, ...hooksByPlugin, customizer)

    function getHook (hookName) {
      const hook = hooks[hookName]

      if (hook) {
        return Promise.mapSeries(hook, (cb) => isFunction(cb) ? cb() : cb)
      } else {
        return Promise.resolve([])
      }
    }

    return (requestedHooks) => {
      if (Array.isArray(requestedHooks)) {
        return Promise.mapSeries(requestedHooks, (hookName) => {
          return getHook(hookName)
        })
          .then((resolvedHooks) => {
            return zipObject(requestedHooks, resolvedHooks)
          })
      } else {
        return getHook(requestedHooks)
      }
    }
  }

  validateState (plugins, hooks) {
    // Run validation on all plugins and return plugin objects that had negative
    // results during validation
    console.info()
    return Promise.filter(plugins, (plugin) => {
      console.info(chalk.grey('--------') + ' ' + chalk.grey(plugin.module))

      // We'll check if the plugin prints anything. If not, we can delete the
      // log line above and have pretty one-line output per plugin.
      const detector = gfx.detectOutput()
      return Promise.resolve(plugin.validate(hooks))
        .then(result => {
          if (result) {
            if (!detector.tripped) {
              gfx.replaceLastLine()
            } else {
              detector.reset()
            }
            console.info(chalk.green('       ✔') + ' ' +
              plugin.module + ' ' + chalk.green('passed'))
          } else {
            console.info(chalk.yellow('       ✘') + ' ' + plugin.module + ' ' +
              chalk.yellow('needs changes'))
          }
          return !result
        })
    }, { concurrency: 1 })
  }

  predictActions (plugins, hooks) {
    console.info()
    return Promise.each(plugins, (plugin) => {
      console.info(chalk.grey('--------') + ' ' + chalk.grey(plugin.module))
      return plugin.predict(hooks)
    })
  }

  executeActions (plugins, hooks) {
    console.info()
    return Promise.each(plugins, (plugin) => {
      console.info(chalk.grey('--------') + ' ' + chalk.grey(plugin.module))
      return plugin.execute(hooks)
    })
  }
}

module.exports = Cli
