import { TxPool } from '../../services/classes/TxPool'
import { DataCollectorItem } from '../lib/DataCollector'
import defaultConfig from '../../lib/defaultConfig'
export class TxPending extends DataCollectorItem {
  constructor (collections, key) {
    const { PendingTxs } = collections
    const cursorField = 'hash'
    const sortable = { [cursorField]: -1 }
    super(PendingTxs, key, { cursorField, sortable })
    this.publicActions = {
      startTxPool: async params => {
        let message = 'txPool control via endpoints is disabled'

        if (defaultConfig.enableTxPoolFromApi) {
          if (this.txPool && this.txPool.started) {
            message = 'TxPool already running'
          } else {
            this.txPool = new TxPool(this.parent.db, { log: this.parent.log, initConfig: this.parent.initConfig })
            await this.txPool.start()
            message = 'TxPool started succesfully'
          }
          this.parent.log.info(message)
        }
        return { data: message }
      },
      stopTxPool: async params => {
        let message = 'txPool control via endpoints is disabled'

        if (defaultConfig.enableTxPoolFromApi) {
          if (!this.txPool) {
            message = 'txPool not started yet'
          } else {
            if (this.txPool.stopped) {
              message = 'TxPool already stopped'
            } else {
              this.txPool.stop()
              message = 'TxPool stopped succesfully'
            }
            this.parent.log.info(message)
          }
        }
        return { data: message }
      },
      getPendingTransaction: params => {
        const hash = params.hash
        return this.getOne({ hash })
      },

      getPendingTransactionsByAddress: params => {
        let address = params.address
        return this.getPageData(
          {
            $or: [{ from: address }, { to: address }]
          },
          params
        )
      }
    }
  }
}

export default TxPending
