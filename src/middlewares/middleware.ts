import { Request, Response, NextFunction } from "express";
import NodeCache = require("node-cache");

export default class Middleware {
  cache: NodeCache;
  constructor(cache: NodeCache,) {
    this.cache = cache;
  }

  /**
   * middleware for AI network trigger call. it will filter duplicated request triggered by same transaction.
   * it will pass request which is not from AI network trigger.
   * @param {Request} request - request data 
   * @param {Res} amount - response data
   * @param {NextFunction} next - next function
   * @returns null if if request is duplicated.
   */
  triggerDuplicateFilter = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.fid === undefined){
      next();
    }
    const txHash = req.body.transaction.hash;
    if (this.cache.get(txHash) && this.cache.get(txHash) !== "error") {
      res.send("duplicated");
      return;
    }
      // if request is first request, set cache 
    this.cache.set(txHash, "in_progress", 500);
    next();
  }
}