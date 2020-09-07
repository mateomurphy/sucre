import { flags } from "@oclif/command";
import Command from "../../base";
import ecs from "../../api/ecs";

export class ServicesRedeployCommand extends Command {
  static description = `redeploys a service`;

  static args = [{ name: "serviceName" }];

  static flags = {
    cluster: flags.string({
      char: "C",
      description: "the cluster of the service",
    }),
    service: flags.string({
      char: "s",
      description: "the name of the service",
      required: true,
    }),
  };

  async run() {
    const serviceName = this.getFlag("service");
    const cluster = this.getFlag("cluster");

    const params = {
      cluster: cluster,
      forceNewDeployment: true,
      service: serviceName,
    };

    const data = await ecs.updateService(params);

    // eslint-disable-next-line no-console
    console.log(data);
  }
}
