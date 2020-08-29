import { Command, flags } from "@oclif/command";
import { cli } from "cli-ux";
import colors from "colors/safe";
import AWS from "aws-sdk";
import { formatTimestamp } from "../utils";

AWS.config.update({ region: "us-east-1" });

const cloudwatchlogs = new AWS.CloudWatchLogs();

export class StreamsCommand extends Command {
  static description = `Retrieves log streams`;

  static args = [{ name: "logGroupName" }];

  async run() {
    const { args, flags } = this.parse(StreamsCommand);
    const logGroupName = args.logGroupName;

    const params = {
      descending: true,
      limit: 50,
      logGroupName: logGroupName,
      orderBy: "LastEventTime",
    };

    this.fetch(params);
  }

  fetch(params: AWS.CloudWatchLogs.DescribeLogStreamsRequest) {
    cloudwatchlogs.describeLogStreams(params, (err, data) => {
      if (err) {
        this.error(err);
      } else {
        if (data.logStreams) {
          cli.table(data.logStreams, {
            logStreamName: {
              header: "Name",
              get: (row) => colors.cyan(row.logStreamName || ""),
            },
            lastEventTimestamp: {
              header: "Last Event",
              get: (row) =>
                colors.yellow(formatTimestamp(row.lastEventTimestamp)),
            },
            creationTime: {
              header: "Creation Time",
              get: (row) => colors.green(formatTimestamp(row.creationTime)),
            },
          });
        }
      }
    });
  }
}
