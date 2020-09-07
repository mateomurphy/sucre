import AWS from "aws-sdk";

export function promisify(obj: any, func: string) {
  return function (...args: any[]) {
    return new Promise<any>((resolve, reject) => {
      obj[func](...args, (err: Error, data: Record<string, any>) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };
}

export function promiseProxy(obj: any) {
  return new Proxy(obj, {
    get(target, property) {
      return promisify(target, property as string);
    },
  });
}

export const cwl = promiseProxy(new AWS.CloudWatchLogs());
export const ecs = promiseProxy(new AWS.ECS());
export const ssm = promiseProxy(new AWS.SSM());
