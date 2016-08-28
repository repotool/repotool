'use strict'

const chalk = require('chalk')

// ASCII Art by the legendary Christopher Johnson
// http://www.chris.com/ascii/index.php?art=transportation/trucks

const truck = `
                   ______________________________________________________
                  |      ____  __________  ____  __________  ____  __    |
             /    |     / __ \\/ ____/ __ \\/ __ \\/_  __/ __ \\/ __ \\/ /    |
            /---, |    / /_/ / __/ / /_/ / / / / / / / / / / / / / /     |
       -----# ==| |   / _, _/ /___/ ____/ /_/ / / / / /_/ / /_/ / /___   |
       | :) # ==| |  /_/ |_/_____/_/    \\____/ /_/  \\____/\\____/_____/   |
  -----'----#   | |______________________________________________________|
  |)___()  '#   |______====____   \\___________________________________|
 [_/,-,\\"--"------ //,-,  ,-,\\\\\\   |/             //,-,  ,-,  ,-,\\\\ __#
   ( 0 )|===******||( 0 )( 0 )||-  o              '( 0 )( 0 )( 0 )||
----'-'--------------'-'--'-'-----------------------'-'--'-'--'-'--------------
`

exports.renderTruck = () => console.log(truck)

exports.logStepHeadline = (headline) => {
  console.info()
  console.info(chalk.bold(headline))
  // console.info()
}

exports.replaceLastLine = () => {
  const ansiCodes = '\x1b[1F\x1b[2K'
  process.stdout.write(ansiCodes)
}

exports.detectOutput = () => {
  const state = {
    tripped: false,
    reset
  }

  const oldStdoutWrite = process.stdout.write
  const oldStderrWrite = process.stderr.write

  function newStdoutWrite () {
    state.tripped = true
    oldStdoutWrite.apply(this, arguments)
    reset()
  }

  function newStderrWrite () {
    state.tripped = true
    oldStderrWrite.apply(this, arguments)
    reset()
  }

  function reset () {
    if (process.stdout.write === newStdoutWrite) {
      process.stdout.write = oldStdoutWrite
    }

    if (process.stderr.write === newStderrWrite) {
      process.stderr.write = oldStderrWrite
    }
  }

  process.stdout.write = newStdoutWrite
  process.stderr.write = newStderrWrite

  return state
}
