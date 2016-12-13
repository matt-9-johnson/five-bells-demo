'use strict'

exports.graph = {
  numLedgers: 2,
  numConnectors: 1,
  adminUser: process.env.ADMIN_USER || 'admin',
  adminPass: process.env.ADMIN_PASS || 'admin'
}

console.log(JSON.stringify(exports.graph))

if (process.env.DEMO_NUM_LEDGERS) {
  exports.graph.numLedgers = parseInt(process.env.DEMO_NUM_LEDGERS, 10)
}

if (process.env.DEMO_NUM_CONNECTORS) {
  exports.graph.numConnectors = parseInt(process.env.DEMO_NUM_CONNECTORS, 10)
}

// Demo external ledgers needs to be of the format 'demo.ledger.name.':'ledger_host:port'
if (process.env.DEMO_EXTERNAL_LEDGERS) {
  exports.graph.externalLedgers = JSON.parse(process.env.DEMO_EXTERNAL_LEDGERS)
}
else
{
  exports.graph.externalLedgers = {}
}

