import { Command, flags } from "@oclif/command";
import AWS from "aws-sdk";
import { formatLogEvent, handleTime, paginate, promisify } from "../../utils";

AWS.config.update({ region: "us-east-1" });

const cloudwatchlogs = new AWS.CloudWatchLogs();
const filterLogEvents = promisify(cloudwatchlogs, "filterLogEvents");

export class LogsCommand extends Command {
  static description = `retrieve logs`;

  static args = [{ name: "logGroupName" }];

  static flags = {
    end: flags.string({
      char: "e",
      description: "end of the time range",
    }),
    // env: flags.string({description: "environment" }),
    num: flags.integer({
      char: "n",
      description: "number of lines to display",
    }),
    prefix: flags.string({
      char: "p",
      description: "filter log stream by prefix",
    }),
    start: flags.string({
      char: "s",
      description: "start of the time range",
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
      endTime: endTime,
      interleaved: true,
      limit: flags.num || 1000,
      logGroupName: logGroupName,
      logStreamNamePrefix: flags.prefix,
      startTime: startTime,
    };

    this.fetch(params);

    if (flags.tail) {
      delete params.endTime;
      delete params.limit;

      setInterval(() => {
        if (this.lastSeenTime) {
          params.startTime = this.lastSeenTime;
        }
        this.fetch(params);
      }, 1000);
    }
  }

  async fetch(params: AWS.CloudWatchLogs.FilterLogEventsRequest) {
    for await (let data of paginate(filterLogEvents, params)) {
      this.outputLogEvents(data);
    }
  }

  outputLogEvents(data: AWS.CloudWatchLogs.FilterLogEventsResponse) {
    if (data.events) {
      data.events.forEach((event) => {
        if (event.timestamp) {
          this.updateLastSeenTime(event.timestamp + 1);
        }
        this.log(formatLogEvent(event));
      });
    }
  }

  updateLastSeenTime(time: number | undefined) {
    this.lastSeenTime = time;
  }
}
