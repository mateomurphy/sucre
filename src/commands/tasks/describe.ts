import { flags } from "@oclif/command";
import Command from "../../base";
import AWS from "aws-sdk";

AWS.config.update({ region: "us-east-1" });

const ecs = new AWS.ECS();

export class TasksDescribeCommand extends Command {
  static description = `Describes tasks`;
  static strict = false;
  static flags = {
    cluster: flags.string({
      char: "c",
      description: "the cluster to run on",
    }),
  };

  async run() {
    const { argv, flags } = this.parse(TasksDescribeCommand);
    // const taskName = args.taskName;

    const cluster = this.userConfig.cluster;
    const taskDefinition = "mentorly-stage";

    const params = {
      cluster: cluster,
      tasks: argv,
    };

    ecs.describeTasks(params, (err, data) => {
      if (err) {
        this.error(err);
      } else {
        console.log(data);
      }
    });
  }
}
