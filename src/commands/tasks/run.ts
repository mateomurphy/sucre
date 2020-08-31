import { flags } from "@oclif/command";
import Command from "../../base";
import AWS from "aws-sdk";
import colors from "chalk";
import cli from "cli-ux";
import { format } from "util";
import { formatTimestamp, promisify, resourceName } from "../../utils";

AWS.config.update({ region: "us-east-1" });

const ecs = new AWS.ECS();
const runTask = promisify(ecs, "runTask");
const waitFor = promisify(ecs, "waitFor");

const cloudWatchLogs = new AWS.CloudWatchLogs();
const getLogEvents = promisify(cloudWatchLogs, "getLogEvents");

export class RunCommand extends Command {
  static aliases = ["run"];
  static description = `run a one-off process inside a container`;
  static strict = false;
  static flags = {
    cluster: flags.string({
      char: "c",
      description: "the cluster to run on",
    }),
  };

  async run() {
    const { argv, flags } = this.parse(RunCommand);

    const cluster = this.userConfig.cluster;
    const taskDefinition = this.userConfig.taskDefinition;
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

    const data = await runTask(params);

    if (data && data.tasks) {
      const taskArn = data.tasks[0].taskArn;
      cli.action.start(
        actionName,
        format("Started task %s", colors.cyan(resourceName(taskArn)))
      );

      const result = await waitFor("tasksStopped", {
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

    const data = await getLogEvents(params);

    data.events.forEach((event: AWS.CloudWatchLogs.OutputLogEvent) => {
      this.log(
        "[%s] %s",
        colors.yellow(formatTimestamp(event.timestamp)),
        colors.reset(event.message || "")
      );
    });
  }
}
