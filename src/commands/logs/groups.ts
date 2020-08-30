import { Command, flags } from "@oclif/command";
import { cli } from "cli-ux";
import colors from "colors/safe";
import AWS from "aws-sdk";
import { formatTimestamp, promisify } from "../../utils";

AWS.config.update({ region: "us-east-1" });

const cloudwatchlogs = new AWS.CloudWatchLogs();
const describeLogGroups = promisify(cloudwatchlogs, "describeLogGroups");

export class StreamsCommand extends Command {
  static description = `Retrieves log groups`;

  static args = [{ name: "logGroupNamePrefix" }];

  async run() {
    const { args, flags } = this.parse(StreamsCommand);
    const logGroupNamePrefix = args.logGroupNamePrefix;

    const params = {
      limit: 50,
      logGroupNamePrefix: logGroupNamePrefix,
    };

    this.fetch(params);
  }

  async fetch(params: AWS.CloudWatchLogs.DescribeLogGroupsRequest) {
    const data = await describeLogGroups(params);

    console.log(data);

    if (data.logGroups) {
      cli.table(data.logGroups, {
        logStreamName: {
          header: "Name",
          get: (row: any) => colors.cyan(row.logGroupName || ""),
        },
        creationTime: {
          header: "Creation Time",
          get: (row) => colors.green(formatTimestamp(row.creationTime)),
        },
      });
    }
  }
}
