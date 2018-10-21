'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.TokenAddress = undefined;var _BcThing = require('./BcThing');
var _Contract = require('./Contract');var _Contract2 = _interopRequireDefault(_Contract);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class TokenAddress extends _BcThing.BcThing {
  constructor(address, contract) {
    super();
    if (!(contract instanceof _Contract2.default)) {
      throw new Error('contract is not instance of Contract');
    }
    if (!this.isAddress(address)) {
      throw new Error(`TokenAddress: invalid address: ${address}`);
    }
    this.Contract = contract;
    this.address = address;
    this.data = {
      address,
      contract: this.Contract.address,
      balance: null };

  }
  async fetch() {
    try {
      let balance = await this.getBalance();
      this.data.balance = balance;
      return this.getData();
    } catch (err) {
      return Promise.reject(err);
    }
  }
  getBalance() {
    return this.Contract.call('balanceOf', this.address);
  }}exports.TokenAddress = TokenAddress;exports.default =


TokenAddress;