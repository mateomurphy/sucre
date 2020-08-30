import { Command, flags } from "@oclif/command";
import { cli } from "cli-ux";
import colors from "colors/safe";
import AWS from "aws-sdk";
import { formatTimestamp, paginateManually, promisify } from "../../utils";

AWS.config.update({ region: "us-east-1" });

const cloudwatchlogs = new AWS.CloudWatchLogs();
const describeLogStreams = promisify(cloudwatchlogs, "describeLogStreams");

export class StreamsCommand extends Command {
  static description = `Retrieves log streams`;

  static args = [{ name: "logGroupName" }];

  static flags = {
    prefix: flags.string({
      char: "p",
      description: "filter log stream by prefix",
    }),
  };

  async run() {
    const { args, flags } = this.parse(StreamsCommand);
    const logGroupName = args.logGroupName;

    const params = {
      descending: true,
      limit: 50,
      logGroupName: logGroupName,
      logStreamNamePrefix: flags.prefix,
      orderBy: "LastEventTime",
    };

    for await (let value of paginateManually(describeLogStreams, params)) {
      outputLogStreams(value);
    }
  }
}

function outputLogStreams(data: AWS.CloudWatchLogs.DescribeLogStreamsResponse) {
  if (!data.logStreams) {
    return "No data";
  }

  cli.table(data.logStreams, {
    logStreamName: {
      header: "Name",
      get: (row) => colors.cyan(row.logStreamName || ""),
    },
    lastEventTimestamp: {
      header: "Last Event",
      get: (row) => colors.yellow(formatTimestamp(row.lastEventTimestamp)),
    },
    creationTime: {
      header: "Creation Time",
      get: (row) => colors.green(formatTimestamp(row.creationTime)),
    },
  });
}
