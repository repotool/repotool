import { Yargs } from 'yargs'
import inquirer = require('inquirer')
import { loadPolicy } from '../lib/policy'
import Cli from '../lib/cli'
import { renderTruck, logStepHeadline, logSuccess, logWarning } from '../lib/gfx'

export const command = 'apply [policy]'

export const describe = 'apply a policy to the current module'

export const builder = (yargs: Yargs) => {
  yargs
    .boolean('save')
    .describe('save', 'Store policy and configuration in package.json')
    .alias('S', 'save')
}

const handlerAsync = async (argv: any) => {
  renderTruck()
  logStepHeadline('Loading policy')

  const policy = await loadPolicy(argv.policy)

  if (!policy) {
    throw new Error('No policy available!')
  }

  const cli = new Cli()
  const hooks = cli.getHooks(policy.hooks)

  logStepHeadline('Validating state')
  console.info()
  const valid = await policy.validate(hooks)

  if (!valid) {
    logStepHeadline('Predicting actions')
    console.info()

    await policy.predict(hooks)

    console.info()
    const answers = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmed',
      message: 'Would you like to execute these actions?',
      default: false
    }])

    if (answers['confirmed']) {
      logStepHeadline('Executing actions')
      console.info()

      await policy.execute(hooks)

      console.info()
      logSuccess('✔', '<b>All done!</b>')
      console.info()
    } else {
      console.info()
      logWarning('✘', '<b>Aborted by user</b>')
      console.info()
    }
  } else {
    logSuccess('✔', 'Everything is valid')
    console.info()
  }
}

export const handler = (argv: any) => {
  handlerAsync(argv).catch((err) => console.error(err))
}
