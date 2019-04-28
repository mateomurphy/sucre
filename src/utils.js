const parseDuration = require('parse-duration')
const parse = require('date-fns/parse')

function handleTime(string) {
  const now = new Date().getTime()

  if (!string) {
    return now
  }

  let time = parse(string, 'YYYY-MM-DD')

  if (!isNaN(time)) {
    return time.getTime()
  }

  return now + parseDuration(string)
}

function formatEvent(event) {
  const date = new Date(event.timestamp)
  return `[${date.toISOString()}] (${event.logStreamName}) ${event.message}`
}

module.exports = {
  formatEvent: formatEvent,
  handleTime: handleTime,
}
