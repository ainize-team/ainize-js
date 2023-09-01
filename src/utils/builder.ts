import { SetOperation, SetOperationType } from "@ainblockchain/ain-js/lib/types"

export const buildSetOperation = (type: SetOperationType,ref: string, value: any): SetOperation => {
  return {
    type,
    ref,
    value,
  } 
}
