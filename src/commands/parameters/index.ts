import { flags } from "@oclif/command";
import Command from "../../base";
import { ssm } from "../../api";
import { paginate } from "../../utils";
import { renderParameters } from "../../render";

export class ParametersCommand extends Command {
  static description = `list parameters`;

  static flags = {
    service: flags.string({
      char: "s",
      description: "the name of the service",
      required: true,
    }),
  };

  async run() {
    const path = `/${this.getFlag("service")}/`;

    const params = {
      Path: path,
      MaxResults: 10,
    };

    let result = [] as Array<any>;

    for await (const value of paginate(ssm.getParametersByPath, params)) {
      result = result.concat(value.Parameters);
    }

    result.sort((a, b) => a.Name.localeCompare(b.Name));

    renderParameters(result, path);
  }
}
