import { DataCollectorItem } from '../lib/DataCollector'
import { isBlockHash } from '../../lib/utils'

export class Balances extends DataCollectorItem {
  constructor ({ Balances }, name) {
    let sortable = { timestamp: -1, blockNumber: -1 }
    const cursorField = 'blockNumber'
    super(Balances, name, { sortDir: -1, sortable, cursorField })
    this.publicActions = {
      /**
       * @swagger
       * /api?module=balances&action=getBalance:
       *    get:
       *      description: get address balance at blockNumber (if exists)
       *      tags:
       *        - balances
       *      parameters:
       *        - name: module
       *          in: query
       *          required: true
       *          enum: [balances]
       *        - name: action
       *          in: query
       *          required: true
       *          enum: [getBalance]
       *        - $ref: '#/parameters/address'
       *        - name: block
       *          in: query
       *          required: true
       *          schema:
       *            type: string
       *            description: block hash or block number
       *            example: 30000
       *      responses:
       *        200:
       *          $ref: '#/definitions/Response'
       *        400:
       *          $ref: '#/responses/BadRequest'
       *        404:
       *          $ref: '#/responses/NotFound'
      */
      getBalance: async params => {
        const { address, block } = params
        const query = { address }

        if (isBlockHash(block)) query.blockHash = block
        else query.blockNumber = parseInt(block)

        return this.getItem(query, params)
      },
      /**
       * @swagger
       * /api?module=balances&action=getBalances:
       *    get:
       *      description: get address balances
       *      tags:
       *        - balances
       *      parameters:
       *        - name: module
       *          in: query
       *          required: true
       *          enum: [balances]
       *        - name: action
       *          in: query
       *          required: true
       *          enum: [getBalances]
       *        - $ref: '#/parameters/address'
       *      responses:
       *        200:
       *          $ref: '#/definitions/Response'
       *        400:
       *          $ref: '#/responses/BadRequest'
       *        404:
       *          $ref: '#/responses/NotFound'
      */
      getBalances: async params => {
        const { address } = params
        return this.getPageData({ address }, params)
      },
      /**
       * @swagger
       * /api?module=balances&action=getStatus:
       *    get:
       *      description: get status of balances
       *      tags:
       *        - balances
       *      parameters:
       *        - name: module
       *          in: query
       *          required: true
       *          enum: [balances]
       *        - name: action
       *          in: query
       *          required: true
       *          enum: [getStatus]
       *      responses:
       *        200:
       *          $ref: '#/definitions/Response'
       *        400:
       *          $ref: '#/responses/BadRequest'
       *        404:
       *          $ref: '#/responses/NotFound'
      */
      getStatus: async params => {
        const projection = { blockHash: 1, blockNumber: 1, _id: 0 }
        const fromBlock = await this.getOne({}, projection, { blockNumber: 1 })
        const toBlock = await this.getOne({}, projection, { blockNumber: -1 })
        return { data: { fromBlock: fromBlock.data, toBlock: toBlock.data } }
      }
    }
  }
}

export default Balances
