import { FilteredLogEvent } from "aws-sdk/clients/cloudwatchlogs";
import { cli } from "cli-ux";
import colors from "chalk";
import { isValid, parse } from "date-fns";
import { format as dateFormat } from "date-fns-tz";
import parseDuration from "parse-duration";
import { format, inspect } from "util";
import { parse as parseArn } from "@sandfox/arn";
import { basename } from "path";

const green = [
  "PRIMARY",
  "ACTIVE",
  "RUNNING",
  "HEALTHY",
  "STEADY_STATE",
  "UPDATED",
  "STAGED",
];
const yellow = [
  "DRAINING",
  "PENDING",
  "REGISTERING",
  "DEREGISTERING",
  "PROVISIONING",
  "DEPROVISIONING",
  "UPDATING",
  "STABILIZING",
  "STAGING",
];
const red = [
  "UNHEALTHY",
  "REGISTRATION_FAILED",
  "FAILED",
  "INACTIVE",
  "STOPPED",
];

export function coloredStatus(string: string | undefined) {
  if (!string) {
    return "";
  }

  if (green.includes(string)) {
    return colors.green(string);
  }

  if (red.includes(string)) {
    return colors.red(string);
  }

  if (yellow.includes(string)) {
    return colors.yellow(string);
  }

  return string;
}

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

export function formatDate(date: Date | undefined) {
  if (!date) {
    return "-";
  }

  return dateFormat(date, "yyyy/MM/dd HH:mm:ss xx");
}

export function formatTimestamp(timestamp: number | undefined) {
  if (!timestamp) {
    return "-";
  }

  return formatDate(new Date(timestamp));
}

export function formatLogEvent(event: FilteredLogEvent) {
  return format(
    "[%s] (%s) %s",
    colors.yellow(formatTimestamp(event.timestamp)),
    colors.cyan(event.logStreamName || ""),
    colors.reset(event.message || "")
  );
}

const regexp = /\(([^\s]*)\s([^)]*)\)/gm;

export function formatServiceEventMessage(message: string | undefined) {
  return (message || "").replace(
    regexp,
    (_, p1, p2) => `${p1} ${colors.cyan(resourceName(p2))}`
  );
}

export function log(message = "", ...args: any[]) {
  // tslint:disable-next-line strict-type-predicates
  message = typeof message === "string" ? message : inspect(message);
  process.stdout.write(format(message, ...args) + "\n");
}

export async function* paginate(func: Function, params: any) {
  let requestParams = { ...params };

  do {
    const result = await func(requestParams);
    yield result;

    requestParams = { ...params, nextToken: result.nextToken };
  } while (requestParams.nextToken);
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

export async function poll(active: boolean, func: Function) {
  func();

  if (!active) {
    return;
  }

  setInterval(async () => {
    func();
  }, 3000);
}

export async function* pollingIterator(func: Function, params: any) {
  let requestParams = { ...params };

  do {
    const result = await func(requestParams);
    requestParams = yield result;

    await sleep(3000);
  } while (true);
}

export function resourceName(arnString: string | undefined) {
  if (!arnString) {
    return "";
  }

  if (!arnString.startsWith("arn:aws:")) {
    return arnString;
  }

  const arn = parseArn(arnString);
  return arn.resource.split("/")[1];
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
