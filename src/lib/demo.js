'use strict'

const co = require('co')
const path = require('path')
const randomgraph = require('randomgraph')
const ServiceManager = require('five-bells-service-manager')

const connectorNames = [
  'cloud'
]

class Demo {
  constructor (opts) {
    const _this = this

    this.services = new ServiceManager(
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, '../../data'))
    this.adminUser = opts.adminUser
    this.adminPass = opts.adminPass

    this.numLedgers = opts.numLedgers
    this.numConnectors = opts.numConnectors

    if (process.env.npm_node_execpath && process.env.npm_execpath) {
      this.npmPrefix = process.env.npm_node_execpath + ' ' + process.env.npm_execpath
    } else {
      this.npmPrefix = 'npm'
    }

    // Connector graph hub and spoke
    this.graph = randomgraph.BalancedTree(
      (this.numLedgers-1),
      1)
    this.connectorEdges = new Array(this.numConnectors)
    this.connectorNames = new Array(this.numConnectors)
    for (let i = 0; i < this.numConnectors; i++) {
      this.connectorEdges[i] = []
      this.connectorNames[i] = connectorNames[i] || 'connector' + i
    }
    this.ledgerHosts = {}
    this.ledgerConnectors = {}
    this.graph.edges.forEach(function (edge, i) {
      const source = edge.source
      const target = edge.target
      edge.source_currency = 'USD'
      edge.target_currency = 'USD'
      edge.source = 'demo.ledger' + source + '.'
      edge.target = 'demo.ledger' + target + '.'
        console.log('LOGGING edge %s -> %s', edge.source, edge.target)
      this.ledgerHosts[edge.source] = 'http://localhost:' + (3000 + source)
      this.ledgerHosts[edge.target] = 'http://localhost:' + (3000 + target)
      _this.connectorEdges[i % _this.numConnectors].push(edge)
      if (!this.ledgerConnectors[edge.source]) {
        this.ledgerConnectors[edge.source] = []
      }
      this.ledgerConnectors[edge.source].push(this.connectorNames[i % _this.numConnectors])

      if (!this.ledgerConnectors[edge.target]) {
        this.ledgerConnectors[edge.target] = []
      }

        console.log('LOGGING edge keys:' + Object.keys(edge))

      this.ledgerConnectors[edge.target].push(this.connectorNames[i % _this.numConnectors])
    }, this)
  }

  start () {
    return co.wrap(this._start).call(this)
  }

  * _start () {
    for (let i = 0; i < this.numLedgers; i++) {
      yield this.startLedger('demo.ledger' + i + '.', 3000 + i)
    }

    for (let i = 0; i < this.numConnectors; i++) {
      yield this.setupConnectorAccounts(this.connectorNames[i], this.connectorEdges[i])
    }
    for (let i = 0; i < this.numConnectors; i++) {
      yield this.startConnector(this.connectorNames[i], this.connectorEdges[i])
    }

    yield this.services.startVisualization(5000)
  }

  * startLedger (ledger, port) {
    yield this.services.startLedger(ledger, 'localhost', port, {
      recommendedConnectors: this.ledgerConnectors[ledger]
    })
    yield this.services.updateAccount(ledger, 'alice', {balance: '1000000000'})
    yield this.services.updateAccount(ledger, 'bob', {balance: '1000000000'})
  }

  * startConnector (connector, edges) {
    yield this.services.startConnector(connector, {
      pairs: this.edgesToPairs(edges),
      credentials: this.edgesToCredentials(edges, connector),
      backend: 'fixerio'
    })
  }

  * setupConnectorAccounts (connector, edges) {
    for (const edge of edges) {
      yield this.services.updateAccount(edge.source, connector, {balance: '1000000000', connector: edge.source + connector})
      yield this.services.updateAccount(edge.target, connector, {balance: '1000000000', connector: edge.target + connector})
    }
  }

  edgesToPairs (edges) {
    const pairs = []
    for (const edge of edges) {
      pairs.push([
        edge.source_currency + '@' + edge.source,
        edge.target_currency + '@' + edge.target
      ])
      pairs.push([
        edge.target_currency + '@' + edge.target,
        edge.source_currency + '@' + edge.source
      ])
    }
    return pairs
  }

  edgesToCredentials (edges, connectorName) {
    const creds = {}
    for (const edge of edges) {
      creds[edge.source] = this.makeCredentials(edge.source, edge.source_currency, connectorName)
      creds[edge.target] = this.makeCredentials(edge.target, edge.target_currency, connectorName)
    }
    return creds
  }

  makeCredentials (ledger, currency, name) {
    return {
      currency: currency,
      plugin: 'ilp-plugin-bells',
      options: {
        account: this.ledgerHosts[ledger] + '/accounts/' + encodeURIComponent(name),
        username: name,
        password: name
      }
    }
  }
}

exports.Demo = Demo
