'use strict'

const chalk = require('chalk')

// ASCII Art by the legendary Christopher Johnson
// http://www.chris.com/ascii/index.php?art=transportation/trucks

const truckColor = chalk.white
const driverColor = chalk.yellow.dim
const wheelColor = chalk.white
const wheelInnerColor = chalk.grey
const ventColor = chalk.grey
const doorHandleColor = chalk.grey
const roadColor = chalk.grey
const windowColor = chalk.cyan.dim
const frontLightColor = chalk.yellow.bold
const rearLightColor = chalk.red
const billboardInnerColor = chalk.white.bold
const billboardOuterColor = chalk.red
const ul = chalk.underline

const truck = [
  '                   ' + billboardOuterColor('______________________________________________________'),
  '                  ' + billboardOuterColor('|') + billboardInnerColor('      ____  __________  ____  __________  ____  __    ') + billboardOuterColor('|'),
  '             ' + truckColor('/') + '    ' + billboardOuterColor('|') + billboardInnerColor('     / __ \\/ ____/ __ \\/ __ \\/_  __/ __ \\/ __ \\/ /    ') + billboardOuterColor('|'),
  '            ' + truckColor('/---,') + ' ' + billboardOuterColor('|') + billboardInnerColor('    / /_/ / __/ / /_/ / / / / / / / / / / / / / /     ') + billboardOuterColor('|'),
  '       ' + truckColor('-----╢ ') + ventColor('==') + truckColor('|') + ' ' + billboardOuterColor('|') + billboardInnerColor('   / _  _/ /___/ ____/ /_/ / / / / /_/ / /_/ / /___   ') + billboardOuterColor('|'),
  '       ' + windowColor('|') + driverColor(' :) ') + truckColor('║ ') + ventColor('==') + truckColor('|') + ' ' + billboardOuterColor('|') + '  ' + billboardInnerColor(ul('/') + '_/ ╲_/_____/_/    \\____/ /_/  \\____/\\____/_____/   ') + billboardOuterColor('|'),
  ' ' + truckColor('╭-----┼----╢   |') + ' ' + billboardOuterColor('|______________________________________________________|'),
  ' ' + frontLightColor('┃') + truckColor(') ___╰╮  ') + doorHandleColor('°') + truckColor('║   |_____' + chalk.underline('.====.') + '___   \\___________________________________|'),
  ' ' + truckColor('[_/') + wheelColor(',-,') + truckColor('\\╰---╯----- //') + wheelColor(',-,  ,-,') + truckColor('\\\\\\   |/             //') + wheelColor(',-,  ,-,  ,-,') + truckColor('\\\\ __') + rearLightColor('#'),
  '   ' + wheelColor('( ') + wheelInnerColor('@') + wheelColor(' )') + truckColor('|' + chalk.underline('===******') + '||') + wheelColor('( ') + wheelInnerColor('@') + wheelColor(' )( ') + wheelInnerColor('@') + wheelColor(' )') + truckColor('||-  °              \'') + wheelColor('( ') + wheelInnerColor('@') + wheelColor(' )( ') + wheelInnerColor('@') + wheelColor(' )( ') + wheelInnerColor('@') + wheelColor(' )') + truckColor('||'),
  roadColor('----') + wheelColor('\'-\'') + roadColor('--------------') + wheelColor('\'-\'') + roadColor('--') + wheelColor('\'-\'') + roadColor('-----------------------') + wheelColor('\'-\'') + roadColor('--') + wheelColor('\'-\'') + roadColor('--') + wheelColor('\'-\'') + roadColor('--------------')
].join('\n').replace(/\/_/g, ul('╱') + '_').replace(/_/g, chalk.underline(' ')).replace(/\//g, '╱').replace(/\\/g, '╲').replace(/\|/g, '│').replace(/-/g, '─').replace(/=/g, '═')

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
