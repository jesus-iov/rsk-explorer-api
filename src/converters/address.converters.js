import { removeNullFields } from '../repositories/utils'
import { blockEntityToRaw } from './blocks.converters'

function rawAddressToEntity ({
  address,
  isNative,
  type
}) {
  return {
    address,
    isNative,
    type
  }
}

function rawContractToEntity ({
  address,
  name,
  code,
  codeStoredAtBlock,
  deployedCode,
  symbol,
  decimals
}) {
  const contractToReturn = {
    address,
    name,
    code,
    codeStoredAtBlock,
    deployedCode,
    symbol,
    decimals
  }

  return contractToReturn
}

function addressEntityToRaw ({
  address,
  balance_balance_addressToaddress: balance,
  isNative,
  miner_miner_addressToaddress: lastBlockMined,
  contract_contract_addressToaddress: contract,
  name,
  type
}) {
  const addressToReturn = {
    address,
    balance: balance[0] ? balance[0].balance : null,
    blockNumber: balance[0] ? balance[0].blockNumber : null,
    isNative,
    name,
    type
  }

  if (lastBlockMined[0]) {
    addressToReturn.lastBlockMined = blockEntityToRaw(lastBlockMined[0].block)
  }

  if (contract) {
    Object.assign(addressToReturn, contractEntityToRaw(contract))
  }

  if (addressToReturn.name === undefined) {
    addressToReturn.name = null
  }

  return removeNullFields(addressToReturn, ['name'])
}

function contractEntityToRaw ({
  address,
  name,
  contract_creation_tx: createdByTx,
  // code,
  codeStoredAtBlock,
  deployedCode,
  symbol,
  total_supply: totalSupply,
  decimals,
  contract_method: methods,
  contract_interface: interfaces
}) {
  const contractToReturn = {
    address,
    name,
    // code,
    codeStoredAtBlock,
    deployedCode,
    symbol,
    decimals
  }

  if (createdByTx) {
    contractToReturn.createdByTx = JSON.parse(createdByTx.tx)
    delete contractToReturn.createdByTx.input
  }

  if (methods && methods.length) {
    contractToReturn.contractMethods = methods.map(method => method.method)
  }

  if (interfaces && interfaces.length) {
    contractToReturn.contractInterfaces = interfaces.map(interface_ => interface_.interface)
  }

  if (totalSupply[0]) {
    contractToReturn.totalSupply = totalSupply[0].totalSupply
  }

  return removeNullFields(contractToReturn, ['name', 'code'])
}
export {
  rawAddressToEntity,
  rawContractToEntity,
  addressEntityToRaw,
  contractEntityToRaw
}
