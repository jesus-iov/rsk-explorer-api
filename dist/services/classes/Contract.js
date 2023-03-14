"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _BcThing = require("./BcThing");
var _rskContractParser = _interopRequireDefault(require("@rsksmart/rsk-contract-parser"));
var _types = require("../../lib/types");
var _TokenAddress = _interopRequireDefault(require("./TokenAddress"));
var _utils = require("../../lib/utils");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class Contract extends _BcThing.BcThing {
  constructor(address, deployedCode, { dbData, abi, nod3, initConfig, collections, block }) {
    super({ nod3, initConfig, collections });
    if (!this.isAddress(address)) throw new Error(`Contract: invalid address ${address}`);
    this.address = address;
    this.deployedCode = deployedCode;
    this.data = {
      address };

    this.addresses = {};
    this.fetched = false;
    this.contract = undefined;
    this.abi = abi;
    this.parser = undefined;
    this.isToken = false;
    this.isNative = !!this.nativeContracts.getNativeContractName(address);
    this.block = block;
    if (dbData) this.setData(dbData);
  }

  async fetch() {
    try {
      let { deployedCode, fetched } = this;
      if (fetched) return this.getData();
      let contract = await this.setContract();
      if (!this.isNative) {
        // new contracts
        if (!this.data.contractInterfaces) {
          if (!deployedCode) throw new Error(`Missing deployed code for contract: ${this.address}`);
          let info = await this.parser.getContractInfo(deployedCode, contract);
          let { interfaces, methods } = info;

          if (!interfaces.length) {// if no interfaces... double check
            const proxyCheckResult = await this.parser.getContractInfoIfProxy(this.address);
            // if proxy detected, the implementation contract interfaces are used
            if (proxyCheckResult && proxyCheckResult.interfaces.length) {
              interfaces = proxyCheckResult.interfaces;
            }

            if (proxyCheckResult && proxyCheckResult.methods.length) {
              methods = proxyCheckResult.methods;
            }
          };

          if (interfaces.length) this.setData({ contractInterfaces: interfaces });
          if (methods) this.setData({ contractMethods: methods });
        }
        let { contractInterfaces, tokenData } = this.data;
        this.isToken = (0, _utils.hasValue)(contractInterfaces || [], _types.tokensInterfaces);
        // get token data
        if (!tokenData) {
          let tokenData = await this.getTokenData();
          if (tokenData) this.setData(tokenData);
        }
      }
      // update totalSupply
      let totalSupply = await this.getTokenData(['totalSupply']);
      if (undefined !== totalSupply) this.setData(totalSupply);
      let data = this.getData();
      this.fetched = true;
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getParser() {
    try {
      let { nod3, initConfig, log } = this;
      if (!this.parser) {
        let abi = await this.getAbi();
        this.parser = new _rskContractParser.default({ abi, nod3, initConfig, log });
      }
      return this.parser;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async setContract() {
    try {
      let { address, contract } = this;
      if (contract) return contract;
      // get abi
      let abi = await this.getAbi();
      let parser = await this.getParser();
      this.contract = parser.makeContract(address, abi);
      return this.contract;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getAbi() {
    try {
      if (!this.abi) {
        let abi = await this.getAbiFromVerification();
        this.abi = abi;
      }
      return this.abi;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getAbiFromVerification() {
    try {
      let { collections, address } = this;
      if (!collections) return;
      const data = await collections.VerificationsResults.findOne({ address, match: true });
      if (data && data.abi) return data.abi;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getTokenData(methods) {
    let { contractMethods } = this.data;
    let { parser, contract } = this;
    if (!contractMethods) return;
    methods = methods || ['name', 'symbol', 'decimals', 'totalSupply'];
    methods = methods.filter(m => contractMethods.includes(`${m}()`));
    if (!methods.length) return;
    return parser.getTokenData(contract, { methods });
  }

  addAddress(address) {
    if (!this.isAddress(address)) return;
    if (!this.addresses[address]) {
      let Address = this.newAddress(address);
      this.addresses[address] = Address;
      return Address;
    }
  }

  newAddress(address) {
    return new _TokenAddress.default(address, this);
  }

  call(method, params = []) {
    let { contract, parser } = this;
    if (!contract) throw new Error('Fetch first');
    return parser.call(method, contract, params);
  }

  async fetchAddresses() {
    if (!this.fetched) await this.fetch();
    let data = [];
    let { addresses } = this;
    if (!this.isToken) return data;
    for (let a in addresses) {
      let Address = addresses[a];
      await Address.fetch();
      let addressData = Address.getData(true);
      if (addressData) data.push(addressData);
    }
    return data;
  }}var _default =

Contract;exports.default = _default;