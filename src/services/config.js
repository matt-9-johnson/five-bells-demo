'use strict'

exports.graph = {
  numLedgers: 4,
  numConnectors: 3,
  adminUser: process.env.ADMIN_USER || 'admin',
  adminPass: process.env.ADMIN_PASS || 'admin'
}

if (process.env.DEMO_NUM_LEDGERS) {
  exports.graph.numLedgers = parseInt(process.env.DEMO_NUM_LEDGERS, 10)
}

if (process.env.DEMO_NUM_CONNECTORS) {
  exports.graph.numConnectors = parseInt(process.env.DEMO_NUM_CONNECTORS, 10)
}

