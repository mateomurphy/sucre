import { Command, flags } from "@oclif/command";
import { cli } from "cli-ux";
import colors from "colors/safe";
import AWS from "aws-sdk";
import { promisify, resourceName } from "../utils";

AWS.config.update({ region: "us-east-1" });

const ecs = new AWS.ECS();
const listServices = promisify(ecs, "listServices");
const describeServices = promisify(ecs, "describeServices");

export class ServicesCommand extends Command {
  static description = `Describes services`;

  static flags = {
    cluster: flags.string({
      char: "c",
      description: "the cluster to describe",
    }),
  };

  async run() {
    const { argv, flags } = this.parse(ServicesCommand);
    // const taskName = args.taskName;

    const cluster = "api";

    const { serviceArns } = await listServices({ cluster });

    const params = {
      cluster: cluster,
      services: serviceArns,
    };

    const data = await describeServices(params);

    this.outputServices(data);
  }

  outputServices(data: AWS.ECS.DescribeServicesResponse) {
    if (!data.services) {
      return "No data";
    }

    cli.table(data.services, {
      name: {
        header: "Name",
        get: (row) => colors.cyan(row.serviceName || "Unknown"),
      },
      status: {
        header: "Status",
        get: (row) => {
          if (row.status === "ACTIVE") {
            return colors.green("ACTIVE");
          }

          return row.status;
        },
      },
      taskDefinition: {
        header: "Task definition",
        get: (row) => {
          return resourceName(row.taskDefinition);
        },
      },
      desiredCount: {
        header: "Desired",
      },
      runningCount: {
        header: "Running",
      },
      pendingCount: {
        header: "Pending",
      },
    });
  }
}
