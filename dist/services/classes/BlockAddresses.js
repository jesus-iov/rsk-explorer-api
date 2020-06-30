"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.BlockAddresses = void 0;var _Addresses = _interopRequireDefault(require("./Addresses"));
var _utils = require("../../lib/utils");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class BlockAddresses extends _Addresses.default {
  constructor(blockData, { nod3, initConfig, collections }) {
    if (!(0, _utils.isBlockObject)(blockData)) throw new Error('Invalid blockData');
    super({ nod3, initConfig, collections });
    this.block = blockData;
  }
  add(address, options) {
    options = options || {};
    options.block = this.block;
    return super.add(address, options);
  }}exports.BlockAddresses = BlockAddresses;var _default =


BlockAddresses;exports.default = _default;