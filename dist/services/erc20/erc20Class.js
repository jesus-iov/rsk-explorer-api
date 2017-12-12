'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Exporter {
  constructor(config, db) {
    this.config = config;
    this.db = db;

    this.web3 = new _web2.default();
    this.web3.setProvider(config.provider);

    let fromBlock = config.exportStartBlock || 0;
    let toBlock = config.exportEndBlock || 'latest';

    this.contract = this.web3.eth.contract(config.erc20ABI).at(config.tokenAddress);
    this.allEvents = this.contract.allEvents({
      fromBlock: toBlock,
      toBlock: toBlock
    });
    this.newEvents = this.contract.allEvents();

    // Processes new events
    this.newEvents.watch((err, log) => {
      if (err) {
        console.log('Error receiving new log:', err);
        return;
      }
      console.log('New log received:', log);

      this.processLog(log, err => {
        console.log('New log processed');
      });

      if (log.event === 'Transfer') {
        this.exportBalance(log.args._from);
        this.exportBalance(log.args._to);
      }
      if (log.event === 'Approval') {
        this.exportBalance(log.args._owner);
        this.exportBalance(log.args._spender);
      }
    });

    // Retrieves historical events and processed them
    this.allEvents.get((err, logs) => {
      console.log('Historical events received');
      if (err) {
        console.log('Error receiving historical events:', err);
        return;
      }
      let accounts = {};

      logs.forEach(log => {
        if (log.event === 'Transfer') {
          accounts[log.args._from] = log.args._from;
          accounts[log.args._to] = log.args._to;
        }

        if (log.event === 'Approval') {
          accounts[log.args._owner] = log.args._owner;
          accounts[log.args._spender] = log.args._spender;
        }
      });
      this.batchLogs(logs).then(() => {
        console.log('All historical logs processed');
        this.exportBatchAccounts(accounts).then(() => {
          console.log('All historical balances updated');
        });
      });
    });

    this.batchLogs = async logs => {
      for (let log of logs) {
        try {
          await this.processLog(log);
        } catch (err) {
          console.log('Error, processing logs', err);
        }
      }
    };

    this.exportBatchAccounts = async accounts => {
      for (let a in accounts) {
        try {
          await this.exportBalance(accounts[a]);
        } catch (err) {
          console.log('Errror exporting balance', err);
        }
      }
    };

    this.processLog = (log, callback) => {
      log._id = log.blockNumber + '_' + log.transactionIndex + '_' + log.logIndex;
      console.log('Exporting log:', log._id);

      this.web3.eth.getBlock(log.blockNumber, false, (err, block) => {
        if (err) {
          console.log('Error retrieving block information for log:', err);
          if (callback) callback();
          return;
        }

        log.timestamp = block.timestamp;

        if (log.args && log.args._value) {
          log.args._value = parseFloat(log.args._value);
        }

        this.db.insert(log, (err, newLogs) => {
          if (err) {
            if (err.code === 11000) {
              console.log(log._id, 'already exported!', err.message);
            } else {
              console.log('Error inserting log:', err);
            }
          }
          if (callback) callback();
        });
      });
    };

    this.exportBalance = (address, callback) => {
      console.log('Exporting balance of', address);
      this.contract.balanceOf(address, (err, balance) => {
        balance = parseFloat(balance);
        let doc = { _id: address, balance: balance };
        this.db.update({ _id: doc._id }, doc, { upsert: true }, (err, numReplaced) => {
          if (err) {
            console.log('Error updating balance:', err);
          } else {
            console.log('Balance export completed');
          }

          if (callback) callback();
        });
      });
    };

    console.log('Exporter initialized, waiting for historical events...');
  }
}

exports.default = Exporter;