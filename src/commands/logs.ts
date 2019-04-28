import { Command, flags } from "@oclif/command";
import AWS from "aws-sdk";
import { formatEvent, handleTime } from "../utils";

AWS.config.update({ region: "us-east-1" });

const cloudwatchlogs = new AWS.CloudWatchLogs();

export class LogsCommand extends Command {
  static description = `Retrieves logs`;

  static args = [{ name: "logGroupName" }];

  static flags = {
    // env: flags.string({ char: "e", description: "environment" }),
    num: flags.integer({
      char: "n",
      description: "number of lines to display",
    }),
    start: flags.string({
      char: "s",
      description: "start of the time range",
    }),
    end: flags.string({
      char: "e",
      description: "end of the time range",
    }),
    tail: flags.boolean({ char: "t", description: "tail logs" }),
  };

  lastSeenTime: number | undefined;

  async run() {
    const { args, flags } = this.parse(LogsCommand);
    const logGroupName = args.logGroupName;
    const startTime = handleTime(flags.start);
    const endTime = handleTime(flags.end);

    var params = {
      interleaved: true,
      logGroupName: logGroupName,
      startTime: startTime,
      endTime: endTime,
      limit: flags.num || 1000,
    };

    this.fetch(params);

    if (flags.tail) {
      delete params.endTime;
      setInterval(() => {
        if (this.lastSeenTime) {
          params.startTime = this.lastSeenTime;
        }
        this.fetch(params);
      }, 1000);
    }
  }

  updateLastSeenTime(time: number | undefined) {
    this.lastSeenTime = time;
  }

  fetch(params: AWS.CloudWatchLogs.FilterLogEventsRequest) {
    cloudwatchlogs.filterLogEvents(params, (err, data) => {
      if (err) {
        this.error(err);
      } else {
        if (data.events) {
          data.events.forEach((event) => {
            if (event.timestamp) {
              this.updateLastSeenTime(event.timestamp + 1);
            }
            this.log(formatEvent(event));
          });
        }
      }
    });
  }
}
