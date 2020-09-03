export function promisify(obj: any, func: string) {
  return function (...args: any[]) {
    return new Promise<any>((resolve, reject) => {
      obj[func](...args, (err: Object, data: Object) => {
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
