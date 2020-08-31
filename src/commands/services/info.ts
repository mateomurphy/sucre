import { flags } from "@oclif/command";
import Command from "../../base";
import colors from "chalk";
import { describeServices, describeTasks, listTasks } from "../../api/ecs";
import { log } from "../../utils";
import {
  renderServiceInfo,
  renderTasks,
  renderServiceEvents,
} from "../../render";

export class ServicesInfoCommand extends Command {
  static description = `describe a service`;

  static args = [{ name: "serviceName" }];

  static flags = {
    cluster: flags.string({
      char: "c",
      description: "the cluster of the service",
    }),
    events: flags.boolean({
      char: "e",
      description: "Output events",
    }),
  };

  async run() {
    const { args, flags } = this.parse(ServicesInfoCommand);
    const serviceName = args.serviceName;

    const cluster = this.userConfig.cluster;

    const [services, tasks] = await Promise.all([
      describeServices({
        cluster: cluster,
        services: [serviceName],
      }),

      listTasks({
        cluster: cluster,
        serviceName: serviceName,
      }),
    ]);

    const taskData = await describeTasks({
      cluster: cluster,
      tasks: tasks.taskArns,
    });

    renderServiceInfo(services);
    log(colors.bold("\nTasks"));
    renderTasks(taskData);
    if (flags.events) {
      log(colors.bold("\nEvents"));
      renderServiceEvents(services);
    }
  }
}
