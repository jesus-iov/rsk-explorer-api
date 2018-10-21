'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.RequestBlocks = undefined;exports.




















































































































getBlock = getBlock;var _events = require('events');var _BlocksBase = require('../../lib/BlocksBase');var _types = require('../../lib/types');var _Block = require('./Block');var _utils = require('../../lib/utils');class Emitter extends _events.EventEmitter {}class RequestBlocks extends _BlocksBase.BlocksBase {constructor(db, options) {super(db, options);this.queueSize = options.blocksQueueSize || 50;this.pending = new Set();this.requested = new Set();this.events = options.noEvents ? null : new Emitter();}emit(event, data) {let events = this.events;if (events) {events.emit(event, data);}}request(key, prioritize) {let add = this.addToPending(key, prioritize);if (add) this.processPending();}bulkRequest(keys) {for (let key of keys) {this.addToPending(key);}this.processPending();}addToPending(key, prioritize) {if (this.isRequested(key)) return;if (prioritize) {let pending = [...this.pending];pending.unshift(key);this.pending = new Set(pending);} else {this.pending.add(key);}return true;}processPending() {let i = this.pending.values();let free = this.queueSize - this.requested.size;let total = this.requested.size + this.pending.size;if (total === 0) this.emit(_types.events.QUEUE_DONE);while (free > -1) {let key = i.next().value;if (!key) return;this.pending.delete(key);this.requestBlock(key);free--;}}requestBlock(key) {this.requested.add(key);this.emit(_types.events.BLOCK_REQUESTED, { key });return this.getBlock(key).then(res => {if (res.error) {this.emit(_types.events.BLOCK_ERROR, res);}this.endRequest(key, res);});}async getBlock(hashOrNumber) {try {let hash = (0, _utils.isBlockHash)(hashOrNumber) ? hashOrNumber : null;if (!hash) {this.log.debug(`Searching for best block for: ${hashOrNumber}`);let blocks = await this.nod3.rsk.getBlocksByNumber(hashOrNumber);hash = blocks.find(b => b.inMainChain === true);hash = hash.hash || null;this.log.debug(`${hashOrNumber}: ${hash}`);}hash = hash || hashOrNumber;let block = await getBlock(this.nod3, this.collections, hash, this.log);return block;} catch (err) {return Promise.reject(err);}}endRequest(key, res) {this.requested.delete(key);this.pending.delete(key);if (res && res.block) {let block = res.block;this.emit(_types.events.NEW_BLOCK, { key, block });process.send({ action: _types.actions.UPDATE_TIP_BLOCK, args: [block] });return res.block;}this.processPending();}isRequested(key) {return this.requested.has(key) || this.pending.has(key);}getRequested() {return this.requested.size;}getPending() {return this.pending.size;}}exports.RequestBlocks = RequestBlocks;async function getBlock(nod3, collections, hashOrNumber, Logger) {
  if ((0, _utils.isBlockHash)(hashOrNumber)) {
    let block = await (0, _Block.getBlockFromDb)(hashOrNumber, collections.Blocks);
    if (block) return { block, key: hashOrNumber };
  }
  try {
    let newBlock = new _Block.Block(hashOrNumber, { nod3, collections, Logger });
    let block = await newBlock.save().then(res => {
      if (!res || !res.data) return;
      return res.data.block;
    });
    return { block, key: hashOrNumber };
  } catch (error) {
    return { error, key: hashOrNumber };
  }
}exports.default =

RequestBlocks;