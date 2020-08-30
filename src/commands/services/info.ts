import { flags } from "@oclif/command";
import Command from "../../base";
import { cli } from "cli-ux";
import colors from "colors/safe";
import AWS from "aws-sdk";
import { coloredStatus, log, promisify, resourceName } from "../../utils";

AWS.config.update({ region: "us-east-1" });

const ecs = new AWS.ECS();
const describeServices = promisify(ecs, "describeServices");
const describeTasks = promisify(ecs, "describeTasks");
const listTasks = promisify(ecs, "listTasks");

export class ServicesInfoCommand extends Command {
  static description = `Describes services`;

  static args = [{ name: "serviceName" }];

  static flags = {
    cluster: flags.string({
      char: "c",
      description: "the cluster to describe",
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

    outputServiceInfo(services);
    log(colors.bold("\nTasks"));
    outputTasks(taskData);
    if (flags.events) {
      log(colors.bold("\nEvents"));
      outputEvents(services);
    }
  }
}

function outputTasks(data: AWS.ECS.DescribeTasksResponse) {
  if (!data.tasks) {
    return "No data";
  }

  cli.table(data.tasks, {
    taskArn: {
      header: "Task",
      get: (row) => colors.cyan(resourceName(row.taskArn)),
    },
    taskDefinitionArn: {
      header: "Task definition",
      get: (row) => resourceName(row.taskDefinitionArn),
    },
    lastStatus: {
      header: "Last status",
      get: (row) => coloredStatus(row.lastStatus),
    },
    desiredStatus: {
      header: "Desired status",
      get: (row) => row.lastStatus,
    },
    group: {},
    launchType: {},
  });
}

function outputEvents(data: AWS.ECS.DescribeServicesResponse) {
  if (!data.services) {
    return "No data";
  }

  const events = data.services[0].events || [];

  cli.table(events, {
    createdAt: {
      header: "Created at",
      get: (row) =>
        colors.yellow(row.createdAt ? row.createdAt.toISOString() : ""),
    },
    message: { header: "Message" },
    id: { header: "ID", extended: true },
  });
}

function outputServiceInfo(data: AWS.ECS.DescribeServicesResponse) {
  if (!data.services) {
    return "No data";
  }

  const service = data.services[0];

  const tableData = [
    { value: service.serviceName, name: "Name" },
    { value: coloredStatus(service.status), name: "Status" },
    {
      value: resourceName(service.taskDefinition),
      name: "Task definition",
    },
    { value: service.schedulingStrategy, name: "Service type" },
    { value: service.launchType, name: "Launch type" },
    { value: resourceName(service.roleArn), name: "Service role" },
    { value: service.desiredCount, name: "Desired count" },
    { value: service.runningCount, name: "Running count" },
    { value: service.pendingCount, name: "Pending count" },
  ];

  cli.table(tableData, { name: { minWidth: 17 }, value: {} });
}
