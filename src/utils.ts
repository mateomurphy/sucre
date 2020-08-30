import { FilteredLogEvent } from "aws-sdk/clients/cloudwatchlogs";
import { cli } from "cli-ux";
import colors from "colors/safe";
import { isValid, parse } from "date-fns";
import parseDuration from "parse-duration";
import { format } from "util";
import { parse as parseArn } from "@sandfox/arn";
import { basename } from "path";

export function handleTime(string: string | undefined) {
  const now = new Date().getTime();

  if (!string) {
    return undefined;
  }

  const time = parse(string, "yyyy-MM-DD", new Date());

  if (isValid(time)) {
    return time.getTime();
  }

  return now - Math.abs(parseDuration(string));
}

export function formatTimestamp(timestamp: number | undefined) {
  if (!timestamp) {
    return "-";
  }

  return new Date(timestamp).toISOString();
}

export function formatLogEvent(event: FilteredLogEvent) {
  return format(
    "[%s] (%s) %s",
    colors.yellow(formatTimestamp(event.timestamp)),
    colors.cyan(event.logStreamName || ""),
    colors.reset(event.message || "")
  );
}

export async function* paginate(func: Function, params: any) {
  let requestParams = { ...params };

  do {
    const result = await func(requestParams);
    yield result;

    requestParams = { ...params, nextToken: result.nextToken };
  } while (requestParams.nextToken);

  return;
}

export async function* paginateManually(func: Function, params: any) {
  const iterator = paginate(func, params);

  do {
    const { value } = await iterator.next();
    yield value;

    if (!value.nextToken) {
      break;
    }

    try {
      await cli.anykey();
    } catch (err) {
      if (err.message === "quit") {
        break;
      }

      throw err;
    }
  } while (true);
}

export function resourceName(arnSring: string | undefined) {
  const arn = parseArn(arnSring || "");
  return basename(arn.resource);
}

export function promisify(obj: any, func: string) {
  return function (params: any) {
    return new Promise<any>((resolve, reject) => {
      obj[func](params, (err: Object, data: Object) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };
}
