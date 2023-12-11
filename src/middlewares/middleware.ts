import { Request, Response, NextFunction } from "express";
import NodeCache = require("node-cache");

export default class Middleware {
  cache: NodeCache;
  constructor(cache: NodeCache,) {
    this.cache = cache;
  }

  /**
   * Middleware for AI Network trigger call. It will filter duplicated request triggered by same transaction.
   * It will pass request which is not from AI Network trigger.
   * @param {Request} request - Request data 
   * @param {Res} response - Response data
   * @param {NextFunction} next - Next function
   * @returns Null if if request is duplicated.
   */
  triggerDuplicateFilter = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.transaction.hash === undefined){
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
    /**
   * Middleware for AI Network trigger call. It will filter duplicated request triggered by same transaction.
   * It will pass request which is not from AI Network trigger.
   * You can set filter inside specific api.
   * @param {Request} request - Request data 
   * @param {Res} response - Response data
   * @returns Null if if request is duplicated.
   */
  triggerFilter = (req: Request, res: Response) => {
    if (req.body.fid || req.body.transaction){
      res.send("not from trigger");
      return;
    }
    const txHash = req.body.transaction.hash;
    if (this.cache.get(txHash)) {
      res.send("duplicated");
      return;
    }
    this.cache.set(txHash, "in_progress", 500);
  }
}