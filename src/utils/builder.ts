import { SetOperation, SetOperationType, TransactionBody } from "@ainblockchain/ain-js/lib/types"

export const buildSetOperation = (type: SetOperationType, ref: string, value: any): SetOperation => {
  return {
    type,
    ref,
    value,
  };
}

export const buildTxBody = (operation: SetOperation | SetOperation[], timestamp? : number): TransactionBody => {
  return {
    operation: Array.isArray(operation) ? {
      type: "SET",
      op_list: operation
    } : operation,
    gas_price: 500,
    timestamp: timestamp? timestamp : Date.now(),
    nonce: -1,
  };
}
