import { flags } from "@oclif/command";
import Command from "../../base";
import AWS from "aws-sdk";
import cwl from "../../api/cwl";
import { formatLogEvent, handleTime, paginate } from "../../utils";

export class LogsCommand extends Command {
  static description = `retrieve logs`;

  static args = [{ name: "logGroupName" }];

  static flags: Record<string, any> = {
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
    const { args } = this.parse(LogsCommand);
    const logGroupName = args.logGroupName;
    const startTime = handleTime(this.getFlag("start"));
    const endTime = handleTime(this.getFlag("end"));

    const params = {
      endTime: endTime,
      interleaved: true,
      limit: this.getFlag("num") || 1000,
      logGroupName: logGroupName,
      logStreamNamePrefix: this.getFlag("prefix"),
      startTime: startTime,
    };

    this.fetch(params);

    if (this.getFlag("tail")) {
      delete params.endTime;
      delete params.limit;

      setInterval(() => {
        if (this.lastSeenTime) {
          params.startTime = this.lastSeenTime;
        }
        this.fetch(params);
      }, 3000);
    }
  }

  async fetch(params: AWS.CloudWatchLogs.FilterLogEventsRequest) {
    for await (const data of paginate(cwl.filterLogEvents, params)) {
      this.renderLogEvents(data);
    }
  }

  renderLogEvents(data: AWS.CloudWatchLogs.FilterLogEventsResponse) {
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
