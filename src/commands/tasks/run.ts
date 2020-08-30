import { Command, flags } from "@oclif/command";
import AWS from "aws-sdk";
import colors from "colors/safe";
import cli from "cli-ux";
import { format } from "util";

AWS.config.update({ region: "us-east-1" });

const ecs = new AWS.ECS();

export class RunCommand extends Command {
  static aliases = ["run"];
  static description = `Runs a command`;
  static strict = false;
  static flags = {
    cluster: flags.string({
      char: "c",
      description: "the cluster to run on",
    }),
  };

  async run() {
    const { argv, flags } = this.parse(RunCommand);
    // const taskName = args.taskName;

    const cluster = "api";
    const taskDefinition = "mentorly-stage";
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

    console.log(command);

    cli.action.start(
      format(
        "Running %s on %s",
        colors.white(command.join(" ")),
        colors.cyan(taskDefinition)
      )
    );

    ecs.runTask(params, (err, data) => {
      if (err) {
        this.error(err);
      } else {
        cli.action.stop();
        if (data && data.tasks) {
          const taskArn = data.tasks[0].taskArn;
          console.log(taskArn);
        }
      }
    });
  }
}
