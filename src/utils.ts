import { FilteredLogEvent } from "aws-sdk/clients/cloudwatchlogs";
import colors from "colors/safe";
import { isValid, parse } from "date-fns";
import parseDuration from "parse-duration";
import { format } from "util";

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

export function formatEvent(event: FilteredLogEvent) {
  return format(
    "[%s] (%s) %s",
    colors.yellow(formatTimestamp(event.timestamp)),
    colors.cyan(event.logStreamName || ""),
    colors.reset(event.message || "")
  );
}
