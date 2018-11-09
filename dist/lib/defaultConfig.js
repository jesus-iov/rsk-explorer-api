'use strict';Object.defineProperty(exports, "__esModule", { value: true });



var _types = require('./types');
var _delayedFields = require('./delayedFields');var _delayedFields2 = _interopRequireDefault(_delayedFields);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                            *  This file provides default values,
                                                                                                                                                                                                            *  use /config.json, to overwrite settings
                                                                                                                                                                                                            */exports.default = { server: {
    port: 3003 },

  source: {
    protocol: 'http',
    node: 'localhost',
    port: 4444 },

  log: {
    dir: '/var/log/rsk-explorer',
    level: 'error' },

  db: {
    server: 'localhost',
    port: 27017,
    database: 'blockDB' },

  api: {
    lastBlocks: 30,
    perPage: 50,
    allowUserEvents: true,
    delayedFields: _delayedFields2.default },

  publicSettings: {
    bridgeAddress: '0x0000000000000000000000000000000001000006',
    remascAddress: '0x0000000000000000000000000000000001000008',
    txTypes: _types.txTypes },

  blocks: {
    blocksQueueSize: 100,
    validateCollections: true,
    bcTipSize: 12,
    batchRequestSize: 20,
    collections: {
      Blocks: 'blocks',
      Txs: 'transactions',
      Addrs: 'addresses',
      Status: 'status',
      Events: 'events',
      TokensAddrs: 'tokensAddresses',
      OrphanBlocks: 'orphanBlocks',
      TxPool: 'txPool',
      PendingTxs: 'transactionsPending' } } };