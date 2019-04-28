const {Command, flags} = require('@oclif/command')
const AWS = require('aws-sdk')
const {handleTime} = require('../utils')

AWS.config.update({region: 'us-east-1'})

class LogsCommand extends Command {
  async run() {
    const log = this.log.bind(this)

    const {args} = this.parse(LogsCommand)
    const {flags} = this.parse(LogsCommand)

    const cloudwatchlogs = new AWS.CloudWatchLogs()

    const logGroupName = args.logGroupName
    // const logStreamName = args.logStreamName

    let startTime = handleTime(flags.start)
    let endTime = handleTime(flags.stop)

    var params = {
      interleaved: true,
      logGroupName: logGroupName,
      startTime: startTime,
      endTime: endTime,
      limit: flags.num || 1000,
    }

    cloudwatchlogs.filterLogEvents(params, function (err, data) {
      if (err) {
        log(err, err.stack)
      } else {
        data.events.forEach(function (event) {
          log(event.message)
        })
      }
    })
  }
}

LogsCommand.args = [
  {name: 'logGroupName'},
]

LogsCommand.description = `Retrieves logs
`

LogsCommand.flags = {
  env: flags.string({char: 'e', description: 'environment'}),
  num: flags.integer({char: 'n', description: 'number of lines to display'}),
  start: flags.string({description: 'start of the time range'}),
  stop: flags.string({description: 'end of the time range'}),
}

module.exports = LogsCommand
