import parseDuration from 'parse-duration'
import { isValid, parse } from 'date-fns'
import { FilteredLogEvent } from 'aws-sdk/clients/cloudwatchlogs'

export function handleTime(string: string | undefined) {
  const now = new Date().getTime()

  if (!string) {
    return now
  }

  let time = parse(string, "yyyy-MM-DD", new Date())

  if (isValid(time)) {
    return time.getTime()
  }

  return now - Math.abs(parseDuration(string))
}

export function formatEvent(event: FilteredLogEvent) {
  const date = event.timestamp ? new Date(event.timestamp).toISOString() : 'unknown'

  return `[${date}] (${event.logStreamName}) ${event.message}`
}
