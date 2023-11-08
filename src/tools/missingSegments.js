import dataSource from '../lib/dataSource.js'

dataSource().then(async ({ collections }) => {
  console.info(`Getting missing segments...`)
  console.log(await getMissingSegments(collections))
  process.exit(0)
})

async function getMissingSegments (collections, fromBlock = 0, toBlock = null) {
  let query = (fromBlock || toBlock) ? { number: {} } : {}
  if (fromBlock > 0) query.number.$gte = fromBlock
  if (toBlock && toBlock > fromBlock) query.number.$lte = toBlock
  return collections.Blocks.find(query)
    .sort({ number: -1 })
    .project({ _id: 0, number: 1 })
    .map(block => block.number)
    .toArray()
    .then(blocks => {
      if (blocks.length === 1) {
        blocks.push(-1)
        return Promise.resolve([blocks])
      }
      return getMissing(blocks)
    })
    .catch(err => {
      this.log.error(`Error getting missing blocks segments ${err}`)
      process.exit(9)
    })
}

function getMissing (a) {
  if (a[a.length - 1] > 0) a.push(0)
  return a.filter((v, i) => {
    return (a[i + 1] - v < -1)
  }).map(mv => [mv, a.find((v, i) => {
    return (v < mv && a[i - 1] - v > 1)
  })])
}
