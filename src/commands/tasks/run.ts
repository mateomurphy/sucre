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
      char: "c",
      description: "the cluster to run on",
    }),
    "task-definition": flags.string({
      char: "t",
      description: "the task definition to use",
    }),
  };

  async run() {
    const { argv, flags } = this.parse(RunCommand);

    const cluster = this.userConfig.cluster;
    const taskDefinition =
      flags["task-definition"] || this.userConfig.taskDefinition;
    const command = argv.flatMap((arg) => arg.split(" "));

    const params = {
      cluster: cluster,
      taskDefinition: taskDefinition,
      overrides: {
        containerOverrides: [
          {
            command: command,
            name: taskDefinition,
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
    const logGroupName = this.userConfig.logGroupName;
    const logStreamNamePrefix = this.userConfig.logStreamNamePrefix;

    const params = {
      logGroupName,
      logStreamName: `${logStreamNamePrefix}${taskUid}`,
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
