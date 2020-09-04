import AWS from "aws-sdk";
import colors from "chalk";
import { cli } from "cli-ux";
import {
  coloredStatus,
  formatTimestamp,
  formatServiceEventMessage,
  resourceName,
} from "./utils";

export function renderLogGroups(
  data: AWS.CloudWatchLogs.DescribeLogGroupsResponse
) {
  if (!data.logGroups) {
    return "No data";
  }

  cli.table(data.logGroups, {
    logStreamName: {
      header: "Name",
      get: (row) => colors.cyan(row.logGroupName || ""),
    },
    creationTime: {
      header: "Creation Time",
      get: (row) => colors.green(formatTimestamp(row.creationTime)),
    },
  });
}

export function renderLogStreams(
  data: AWS.CloudWatchLogs.DescribeLogStreamsResponse
) {
  if (!data.logStreams) {
    return "No data";
  }

  cli.table(data.logStreams, {
    logStreamName: {
      header: "Name",
      get: (row) => colors.cyan(row.logStreamName || ""),
    },
    lastEventTimestamp: {
      header: "Last Event",
      get: (row) => colors.yellow(formatTimestamp(row.lastEventTimestamp)),
    },
    creationTime: {
      header: "Creation Time",
      get: (row) => colors.green(formatTimestamp(row.creationTime)),
    },
  });
}

export function renderServices(data: AWS.ECS.DescribeServicesResponse) {
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
      get: (row) => coloredStatus(row.status),
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

export function renderServiceEvents(data: AWS.ECS.DescribeServicesResponse) {
  if (!data.services) {
    return "No data";
  }

  const events = (data.services[0].events || []).slice(0, 20);

  cli.table(events, {
    createdAt: {
      header: "Created at",
      get: (row) =>
        colors.yellow(row.createdAt ? row.createdAt.toISOString() : ""),
    },
    message: {
      header: "Message",
      get: (row) => formatServiceEventMessage(row.message),
    },
    id: { header: "ID", extended: true },
  });
}

export function renderServiceInfo(data: AWS.ECS.DescribeServicesResponse) {
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

export function renderTasks(data: AWS.ECS.DescribeTasksResponse) {
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
