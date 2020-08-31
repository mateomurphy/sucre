import { flags } from "@oclif/command";
import Command from "../../base";
import { describeServices, listServices } from "../../api/ecs";

import { renderServices } from "../../render";

export class ServicesCommand extends Command {
  static description = `describe services`;

  static flags = {
    cluster: flags.string({
      char: "c",
      description: "the cluster of the services",
    }),
  };

  async run() {
    const { argv, flags } = this.parse(ServicesCommand);
    // const taskName = args.taskName;

    const cluster = this.userConfig.cluster;

    const { serviceArns } = await listServices({ cluster });

    const data = await describeServices({
      cluster: cluster,
      services: serviceArns,
    });

    renderServices(data);
  }
}
