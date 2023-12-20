// import { insertBlock, getDbBlock, sameHash, insertBlocks } from '../lib/servicesUtils'
// import nod3 from '../lib/nod3Connect'
// import Logger from '../lib/Logger'
// import { getInitConfig } from '../lib/Setup'
// import BlocksBase from '../lib/BlocksBase'
// import { blocksRepository } from '../repositories'
// import { getMissingSegments } from '../lib/getMissingSegments'
// import { checkDbTipBlocks } from './checkDbTipBlocks'

// const TIP_BLOCK_FETCH_INTERVAL = 3000
// const CONFIRMATIONS_THERESHOLD = 120
// const log = Logger('[live-syncer-service]')

// export async function liveSyncer (syncStatus) {
//   const initConfig = await getInitConfig()
//   const blocksBase = new BlocksBase({ initConfig, log })

//   setInterval(() => newBlocksHandler(syncStatus, blocksBase, { initConfig, log }), TIP_BLOCK_FETCH_INTERVAL)

//   log.info('Listening to new blocks...')
// }

// async function newBlocksHandler (syncStatus, blocksBase, { initConfig, log }) {
//   // Case 1: newBlocksHandler instance already running to update tip block/blocks
//   if (syncStatus.updatingTip) return

//   syncStatus.updatingTip = true

//   try {
//     const latestBlock = await nod3.eth.getBlock('latest')
//     const dbBlock = await blocksRepository.findOne({ number: latestBlock.number })

//     if (dbBlock) {
//       if (dbBlock.hash !== latestBlock.hash) {
//         await updateDbTipBlocks(latestBlock.number, syncStatus, blocksBase, { initConfig, log })
//       }

//       syncStatus.updatingTip = false
//       return
//     } else {
//       await updateDbTipBlocks(latestBlock.number, syncStatus, blocksBase, { initConfig, log })
//       syncStatus.updatingTip = false
//     }
//   } catch (error) {
//     log.info(`Error while handling new block: ${latestBlock.number}`)
//     log.info(error)
//   }
//   syncStatus.lastReceived = latestBlock.number
//   syncStatus.updatingTip = false
// }

// async function updateDbTipBlocks (number, syncStatus, blocksBase, { initConfig, log }) {
//   const nextBlock = await nod3.eth.getBlock(number)
//   const previousBlockInDb = await getDbBlock(number - 1)
//   // previous block is not in db OR previousBlock exists and blocks are congruent
//   if (!previousBlockInDb || sameHash(previousBlockInDb.hash, nextBlock.parentHash)) {
//     // normal insert
//     await insertBlock(nextBlock.number, blocksBase, { initConfig, log, tipBlock: true })
//   } else {
//     // previousInDb exists and is not parent of latestBlock (reorganization)
//     log.info(`Latest db block (${previousBlockInDb.number}) hash is incongruent with next block (${nextBlock.number}) parentHash`)
//     await reorganize(blocksBase, nextBlock, { initConfig, log })
//   }
// }

// async function reorganize (blocksBase, toBlock, { initConfig, log }) {
//   log.info('Checking blocks congruence...')

//   let chainsParentBlockFound = false
//   const missingBlocks = [toBlock.number] // include latest by default
//   const blocksToDelete = []

//   let current = toBlock.number - 1
//   let gap = CONFIRMATIONS_THERESHOLD - 1 // - 1 since we already know last db block is incongruent

//   try {
//     while (!chainsParentBlockFound && gap > 0) {
//       // approach: by comparing both previous blocks hashes until finding fork block OR reaching confirmations gap
//       const newChainPreviousBlock = await nod3.eth.getBlock(current)
//       const dbChainPreviousBlock = await getDbBlock(current)

//       if (dbChainPreviousBlock) {
//         chainsParentBlockFound = sameHash(newChainPreviousBlock.hash, dbChainPreviousBlock.hash)
//         if (chainsParentBlockFound) break
//       }

//       // db block is inexistent or incongruent
//       blocksToDelete.push(newChainPreviousBlock.number)
//       missingBlocks.unshift(newChainPreviousBlock.number)
//       current--
//       gap--
//     }

//     log.info(`Chains parent block found! (${current}). Reorg depth: ${CONFIRMATIONS_THERESHOLD - gap}`)
//     log.info(`Deleting old chain blocks... Total: (${blocksToDelete.length}. Blocks: ${blocksToDelete})`)
//     await blocksRepository.deleteMany({ number: { in: blocksToDelete } })
//     log.info(`Finished deleting old chain blocks.`)
//     log.info(`Adding new chain blocks... (Total: ${missingBlocks.length}. Blocks: ${JSON.stringify(missingBlocks)})`)
//     await insertBlocks(missingBlocks, blocksBase, { initConfig, log })
//     log.info(`Finished adding new chain blocks.`)
//     log.info(`Finished reorganization process!`)
//   } catch (error) {
//     throw error
//   }
// }
