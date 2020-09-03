// import { flags } from "@oclif/command";
import Command from "../../base";
import cwl from "../../api/cwl";
import { paginateManually } from "../../utils";
import { renderLogGroups } from "../../render";

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

    for await (let value of paginateManually(cwl.describeLogGroups, params)) {
      renderLogGroups(value);
    }
  }
}
