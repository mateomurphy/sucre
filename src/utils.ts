import { FilteredLogEvent } from "aws-sdk/clients/cloudwatchlogs";
import colors from "colors/safe";
import { isValid, parse } from "date-fns";
import parseDuration from "parse-duration";

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

export function formatEvent(event: FilteredLogEvent) {
  const date = event.timestamp
    ? new Date(event.timestamp).toISOString()
    : "unknown";

  return `[${colors.yellow(date)}] (${colors.cyan(
    event.logStreamName || ""
  )}) ${colors.reset(event.message || "")}`;
}
