import { flags } from "@oclif/command";
import Command from "../../base";
import cwl from "../../api/cwl";
import { paginateManually } from "../../utils";
import { renderLogStreams } from "../../render";

export class StreamsCommand extends Command {
  static description = `retrieve log streams`;

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

    for await (let value of paginateManually(cwl.describeLogStreams, params)) {
      renderLogStreams(value);
    }
  }
}
