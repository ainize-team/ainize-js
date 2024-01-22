import { Request, Response, NextFunction } from "express";
import NodeCache = require("node-cache");
import { extractTriggerDataFromRequest } from "../utils/extractor";
import AinModule from "../ain";
import _ from "lodash";

export default class Middleware {
  cache: NodeCache;
  private ain = AinModule.getInstance();
  constructor(cache: NodeCache) {
    this.cache = cache;
  }

  /**
   * Middleware for AI Network trigger call. It will filter duplicated request triggered by same transaction.
   * It will reject requests which is not from AI Network trigger.
   * @param {Request} request - Request data 
   * @param {Res} response - Response data
   * @param {NextFunction} next - Next function
   * @returns Null if if request is duplicated.
   */
  blockchainTriggerFilter = async (req: Request, res: Response, next: NextFunction) => {
    //check if request is from blockchain trigger
    const { triggerPath, triggerValue, txHash } = extractTriggerDataFromRequest(req);
    const result = await this.ain.getValue(triggerPath);
    // if request is first reque st, set cache 
    if (this.cache.get(txHash) && this.cache.get(txHash) !== "error") {
      res.send("duplicated");
      return;
    }
    this.cache.set(txHash, "in_progress", 500);
    _.isEqual(result, triggerValue) ? next(): res.send("not from blockChain");
  }
  /**
   *  DEPRECATED
   *  use blockchainTriggerFilter instead
   */
  triggerDuplicateFilter = this.blockchainTriggerFilter;
}