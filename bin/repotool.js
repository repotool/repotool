#!/usr/bin/env node
'use strict'

require('ts-node/register')

require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command(require('../src/commands/apply'))
  .demand(1)
  .help('h')
  .alias('h', 'help')
  .argv
