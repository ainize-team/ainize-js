import { Request, Response, NextFunction } from "express";
import Ainize from "../ainize";
import NodeCache = require("node-cache");

export default class Middleware {
  cache: NodeCache;
  constructor(ainize: Ainize) {
    this.cache = ainize.cache;
  }

  triggerDuplicateFilter = (req: Request, res: Response, next: NextFunction) => {
    if(req.body.fid === undefined){
      next();
    }
    const txHash = req.body.transaction.hash;
    if (this.cache.get(txHash) && this.cache.get(txHash) !== 'error') {
      res.send('duplicated');
      return;
    }
      // if request is first request, set cache 
    this.cache.set(txHash, "in_progress", 500);
    next();
  }
}