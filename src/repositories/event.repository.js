import { prismaClient } from '../lib/Setup'
import { createPrismaOrderBy, mongoQueryToPrisma } from './utils'
import saveAbiAndGetId from './tx.repository'
import {rawEventToEntity, eventEntityToRaw} from '../converters/event.converters'

const eventRelatedTables = {
  event_arg: {select: {arg: true}},
  event_topic: {select: {topic: true}},
  address_in_event: {select: {address: true}},
  abi: {include: {abi_input: {select: {input: {select: {name: true, type: true, indexed: true}}}}}}
}

export const eventRepository = {
  async findOne (query = {}, project = {}, collection) {
    const event = await prismaClient.event.findFirst({
      where: mongoQueryToPrisma(query),
      include: eventRelatedTables
    })

    return event ? eventEntityToRaw(event) : null
  },
  async find (query = {}, project = {}, collection, sort = {}, limit = 0, isArray = true) {
    const events = await prismaClient.event.findMany({
      where: mongoQueryToPrisma(query),
      include: eventRelatedTables,
      orderBy: createPrismaOrderBy(sort),
      take: limit
    })

    return events.map(eventEntityToRaw)
  },
  async countDocuments (query = {}, collection) {
    const count = await prismaClient.event.count({where: mongoQueryToPrisma(query)})
    return count
  },
  async updateOne (filter, update, options = {}, collection) {
    const {$set: data} = update
    const {_addresses, abi, args, topics} = data

    data.abiId = await saveAbiAndGetId(abi)

    const {eventId} = await prismaClient.event.upsert({
      where: {eventId: data.eventId},
      create: rawEventToEntity(data),
      update: rawEventToEntity(data)
    })

    for (const address of _addresses) {
      const addressInEventToSave = {address, event_id: eventId}
      await prismaClient.address_in_event.upsert({
        where: {event_id_address: addressInEventToSave},
        create: addressInEventToSave,
        update: addressInEventToSave
      })
    }

    for (const topic of topics) {
      const topicToSave = {topic, event_id: eventId}
      await prismaClient.event_topic.upsert({
        where: {event_id_topic: topicToSave},
        create: topicToSave,
        update: topicToSave
      })
    }

    if (args) {
      for (const arg of args) {
        const argToSave = {arg, event_id: eventId}
        await prismaClient.event_arg.upsert({
          where: {event_id_arg: argToSave},
          create: argToSave,
          update: argToSave
        })
      }
    }

    return eventId
  },
  async deleteMany (filter, collection) {
    const deleted = await prismaClient.event.deleteMany({where: mongoQueryToPrisma(filter)})

    return deleted
  }
}
