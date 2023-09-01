export default class Util {
  constructor() {}

  toReponsePath(requester:string, appName: string, serviceName: string, timestamp?: number){
    const timestampStr = timestamp ? timestamp.toString() : '$timestamp';
    return `/apps/${appName}/service/${serviceName}/${requester}/${timestampStr}/response`;
  }
}