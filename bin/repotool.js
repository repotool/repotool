#!/usr/bin/env node
'use strict'

const argv = require('yargs')
  .usage('Usage: $0 <template-uri>')
  .boolean('validate-only')
  .describe('validate-only', 'Verify compliance, don\'t modify anything')
  .demand(1)
  .help('h')
  .alias('h', 'help')
  .argv

const Cli = require('../src/lib/cli')

const cli = new Cli()
cli.run(argv)
  .catch(console.error)
