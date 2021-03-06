import { flags } from "@oclif/command";
import Command from "../../base";
import ecs from "../../api/ecs";

import { renderServices } from "../../render";

export class ServicesCommand extends Command {
  static description = `describe services`;

  static flags = {
    cluster: flags.string({
      char: "C",
      description: "the cluster of the services",
    }),
  };

  async run() {
    const cluster = this.getFlag("cluster");

    const { serviceArns } = await ecs.listServices({ cluster });

    const data = await ecs.describeServices({
      cluster: cluster,
      services: serviceArns,
    });

    renderServices(data);
  }
}
