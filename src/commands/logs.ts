import {Command, flags} from '@oclif/command'
import AWS from 'aws-sdk'
import {handleTime} from '../utils'

AWS.config.update({region: 'us-east-1'})

export class LogsCommand extends Command {
  static description = `Retrieves logs`

  static args = [
    {name: 'logGroupName'},
  ]

  static flags = {
    env: flags.string({char: 'e', description: 'environment'}),
    num: flags.integer({char: 'n', description: 'number of lines to display'}),
    start: flags.string({description: 'start of the time range'}),
    stop: flags.string({description: 'end of the time range'}),
  }

  async run() {
    const {args, flags} = this.parse(LogsCommand)

    const cloudwatchlogs = new AWS.CloudWatchLogs()

    const logGroupName = args.logGroupName

    let startTime = handleTime(flags.start)
    let endTime = handleTime(flags.stop)

    var params = {
      interleaved: true,
      logGroupName: logGroupName,
      startTime: startTime,
      endTime: endTime,
      limit: flags.num || 1000,
    }

    cloudwatchlogs.filterLogEvents(params, (err, data) => {
      if (err) {
        this.error(err)
      } else {
        if (data.events) {
          data.events.forEach(event => {
            this.log(event.message)
          })
        }
      }
    })
  }
}
