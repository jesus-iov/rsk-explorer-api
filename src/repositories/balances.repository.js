import { prismaClient } from '../lib/Setup'
import { rawBalanceToEntity, entityToRawBalance } from '../converters/balance.converters'
import { generateFindQuery, mongoQueryToPrisma } from './utils'

export const balancesRepository = {
  async findOne (query = {}, project = {}, collection) {
    const balance = await prismaClient.balance.findFirst(generateFindQuery(query, project, {}, project))

    return balance ? entityToRawBalance(balance) : null
  },
  async find (query = {}, project = {}, collection, sort = {}, limit = 0, isArray = true) {
    const balances = await prismaClient.balance.findMany(generateFindQuery(query, project, {}, sort, limit))

    return balances.map(entityToRawBalance)
  },
  async countDocuments (query = {}, collection) {
    const count = await prismaClient.balance.count({where: mongoQueryToPrisma(query)})

    return count
  },
  async deleteMany (filter, collection) {
    const deleted = await prismaClient.balance.deleteMany({where: mongoQueryToPrisma(filter)})
    await collection.deleteMany(filter)

    return deleted
  },
  async insertMany (data, collection) {
    const balancesToSave = data.map(balance => rawBalanceToEntity(balance))
    const savedBalance = await prismaClient.balance.createMany({data: balancesToSave})

    await collection.insertMany(data)
    return savedBalance
  }
}
