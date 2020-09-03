import { flags } from "@oclif/command";
import Jetty from "jetty";
import Command from "../../base";
import ecs from "../../api/ecs";
import { log, poll } from "../../utils";
import {
  renderServiceInfo,
  renderTasks,
  renderServiceEvents,
} from "../../render";

const jetty = new Jetty(process.stdout);

export class ServicesInfoCommand extends Command {
  static description = `describe a service`;

  static args = [{ name: "serviceName" }];

  static flags = {
    cluster: flags.string({
      char: "c",
      description: "the cluster of the service",
    }),
    watch: flags.boolean({
      char: "w",
      description: "watch for changes",
    }),
  };

  async run() {
    const { args, flags } = this.parse(ServicesInfoCommand);
    const serviceName = args.serviceName;
    const watch = flags.watch;
    const cluster = this.userConfig.cluster;

    poll(watch, async () => {
      try {
        const [services, tasks] = await Promise.all([
          ecs.describeServices({
            cluster: cluster,
            services: [serviceName],
          }),

          ecs.listTasks({
            cluster: cluster,
            serviceName: serviceName,
          }),
        ]);

        const taskData = await ecs.describeTasks({
          cluster: cluster,
          tasks: tasks.taskArns,
        });

        jetty.clear().moveTo([0, 0]);
        renderServiceInfo(services);
        log();
        renderTasks(taskData);
        log();
        renderServiceEvents(services);
      } catch (ex) {
        console.log("error");
        console.error(ex);
        return;
      }
    });
  }
}
