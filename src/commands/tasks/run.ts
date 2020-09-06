import { flags } from "@oclif/command";
import Command from "../../base";
import AWS from "aws-sdk";
import colors from "chalk";
import cli from "cli-ux";
import { format } from "util";
import cwl from "../../api/cwl";
import ecs from "../../api/ecs";
import { formatTimestamp, resourceName } from "../../utils";

export class RunCommand extends Command {
  static aliases = ["run"];
  static description = `run a one-off process inside a container`;
  static strict = false;
  static flags = {
    cluster: flags.string({
      char: "C",
      description: "the cluster to run on",
    }),
    container: flags.string({
      char: "c",
      description: "the container to use",
    }),
    "log-group-name": flags.string(),
    "log-stream-name-prefix": flags.string(),
    "task-definition": flags.string({
      char: "t",
      description: "the task definition to use",
    }),
    "task-definition-path": flags.string({
      char: "f",
      description: "the path to a task definition json file",
    }),
  };

  async run() {
    const { argv } = this.parse(RunCommand);

    const cluster = this.getFlag("cluster");
    const container = this.getFlag("container");
    const taskDefinition = this.getFlag("task-definition");
    const command = argv.flatMap((arg) => arg.split(" "));

    const params = {
      cluster: cluster,
      taskDefinition: taskDefinition,
      overrides: {
        containerOverrides: [
          {
            command: command,
            name: container,
          },
        ],
      },
    };

    const actionName = format(
      "Running %s on %s",
      colors.white(command.join(" ")),
      colors.cyan(taskDefinition || "")
    );

    cli.action.start(actionName);

    const data = await ecs.runTask(params);

    if (data && data.tasks) {
      const taskArn = data.tasks[0].taskArn;
      cli.action.start(
        actionName,
        format("Started task %s", colors.cyan(resourceName(taskArn)))
      );

      const result = await ecs.waitFor("tasksStopped", {
        cluster: cluster,
        tasks: [taskArn],
      });

      await cli.wait(3000);
      cli.action.stop();
      await this.fetchLogs(resourceName(taskArn));
    } else {
      cli.action.stop("No task run");
    }
  }

  async fetchLogs(taskUid: string) {
    const container = this.getFlag("container");
    const logGroupName = this.getFlag("log-group-name");
    const logStreamNamePrefix = this.getFlag("log-stream-name-prefix");

    const params = {
      logGroupName,
      logStreamName: `${logStreamNamePrefix}/${container}/${taskUid}`,
      startFromHead: true,
    };

    const data = await cwl.getLogEvents(params);

    data.events.forEach((event: AWS.CloudWatchLogs.OutputLogEvent) => {
      this.log(
        "[%s] %s",
        colors.yellow(formatTimestamp(event.timestamp)),
        colors.reset(event.message || "")
      );
    });
  }
}
