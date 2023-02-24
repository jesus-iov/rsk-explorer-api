import { prismaClient } from '../lib/Setup'

export const txPendingRepository = {
  findOne (query = {}, project = {}, collection) {
    return collection.findOne(query, project)
  },
  find (query = {}, project = {}, collection, sort = {}, limit = 0, isArray = true) {
    if (isArray) {
      return collection
        .find(query, project)
        .sort(sort)
        .limit(limit)
        .toArray()
    } else {
      return collection
        .find(query, project)
        .sort(sort)
        .limit(limit)
    }
  },
  countDocuments (query = {}, collection) {
    return collection.countDocuments(query)
  },
  aggregate (aggregate, collection) {
    return collection.aggregate(aggregate).toArray()
  },
  async deleteOne (query, collection) {
    await prismaClient.transaction_pending.deleteMany({where: query})

    const mongoRes = collection.deleteOne(query)
    return mongoRes
  },
  updateOne (filter, update, options = {}, collection) {
    return collection.updateOne(filter, update, options)
  },
  insertOne (data, collection) {
    return collection.insertOne(data)
  }
}
