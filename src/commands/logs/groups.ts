import { Command, flags } from "@oclif/command";
import { cli } from "cli-ux";
import colors from "colors/safe";
import AWS from "aws-sdk";
import { formatTimestamp } from "../../utils";

AWS.config.update({ region: "us-east-1" });

const cloudwatchlogs = new AWS.CloudWatchLogs();

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

  fetch(params: AWS.CloudWatchLogs.DescribeLogGroupsRequest) {
    cloudwatchlogs.describeLogGroups(params, (err, data) => {
      if (err) {
        this.error(err);
      } else {
        if (data.logGroups) {
          cli.table(data.logGroups, {
            logStreamName: {
              header: "Name",
              get: (row) => colors.cyan(row.logGroupName || ""),
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
