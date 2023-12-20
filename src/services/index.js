import Logger from '../lib/Logger'
import { Setup } from '../lib/Setup'
import { checkDbTipBlocks } from './checkDbTipBlocks'

import { liveSyncer } from './liveSyncer'
import { staticSyncer } from './staticSyncer'
import { txPoolService } from './txPool'

const confirmationsThreshold = 120

async function main () {
  await (Setup({ log: Logger('[services-setup]') })).start()

  const syncStatus = {
    updatingTip: false,
    lastReceived: -1,
    staticSyncerStarted: false
  }

  await checkDbTipBlocks(confirmationsThreshold)

  staticSyncer(syncStatus, confirmationsThreshold)
  liveSyncer(syncStatus, confirmationsThreshold)
  txPoolService()
}

main()
