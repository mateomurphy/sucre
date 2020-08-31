import { flags } from "@oclif/command";
import Command from "../../base";
import { updateService } from "../../api/ecs";

export class ServicesRedeployCommand extends Command {
  static description = `redeploys a service`;

  static args = [{ name: "serviceName" }];

  static flags = {
    cluster: flags.string({
      char: "c",
      description: "the cluster of the service",
    }),
  };

  async run() {
    const { args, flags } = this.parse(ServicesRedeployCommand);
    const serviceName = args.serviceName;

    const cluster = this.userConfig.cluster || flags.cluster;

    const params = {
      cluster: cluster,
      forceNewDeployment: true,
      service: serviceName,
    };

    const data = await updateService(params);

    console.log(data);
  }
}
