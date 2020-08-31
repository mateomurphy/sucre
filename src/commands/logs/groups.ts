// import { flags } from "@oclif/command";
import Command from "../../base";
import { cli } from "cli-ux";
import colors from "chalk";
import AWS from "aws-sdk";
import { describeLogGroups } from "../../api/cwl";
import { formatTimestamp, paginateManually } from "../../utils";

export class StreamsCommand extends Command {
  static description = `retrieve log streams`;

  static args = [{ name: "logGroupNamePrefix" }];

  async run() {
    const { args, flags } = this.parse(StreamsCommand);
    const logGroupNamePrefix = args.logGroupNamePrefix;

    const params = {
      limit: 50,
      logGroupNamePrefix: logGroupNamePrefix,
    };

    for await (let value of paginateManually(describeLogGroups, params)) {
      outputLogGroups(value);
    }
  }
}

function outputLogGroups(data: AWS.CloudWatchLogs.DescribeLogGroupsResponse) {
  if (!data.logGroups) {
    return "No data";
  }

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
