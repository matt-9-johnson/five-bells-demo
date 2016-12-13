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

// Demo: provide client ledger hostname and port as parameters!
//DEMO_CLIENT_HOSTNAME is a string
if (process.env.DEMO_CLIENT_HOSTNAME) {
  exports.graph.clientHostname = process.env.DEMO_CLIENT_HOSTNAME
}
else {
  exports.graph.clientHostname = 'localhost'
}

// DEMO_CLIENT_PORT is an integer
if (process.env.DEMO_CLIENT_PORT) {
  exports.graph.clientPort = parseInt(process.env.DEMO_CLIENT_PORT, 10)
}
else {
  exports.graph.clientPort = '3002'
}
