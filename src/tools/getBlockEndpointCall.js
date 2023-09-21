import Block from '../services/classes/Block'
import BlocksBase from '../lib/BlocksBase'
import { log } from '@rsksmart/rsk-js-cli'
import nod3 from '../lib/nod3Connect.js'
import UpdateBlockBalances from '../services/classes/UpdateBlockBalances.js'

export async function getBlock (hashOrNumber, { db, initConfig }) {
  const bb = new UpdateBlockBalances(db, { log, initConfig, nod3 })
  try {
    let time = getTime()
    let saved = null
    let block = new Block(hashOrNumber, new BlocksBase(db, { initConfig }))
    await block.fetch()
    let blockData = block.getData(true)
    time = getTime(time)
    saved = getTime()
    console.log('Saving Block')
    await block.save()
    saved = getTime(saved)
    console.log('Block Saved')

    if (blockData.block.number !== 0) await bb.updateBalance(blockData.block.hash)

    return { time, saved, block: blockData }
  } catch (err) {
    console.log(err)
    process.exit(9)
  }
}

function getTime (t) {
  return Date.now() - (t || 0)
}
