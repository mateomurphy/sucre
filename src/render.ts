import AWS from "aws-sdk";
import colors from "chalk";
import { cli } from "cli-ux";
import {
  coloredStatus,
  formatDate,
  formatTimestamp,
  formatServiceEventMessage,
  resourceName,
} from "./utils";

type LogGroup = AWS.CloudWatchLogs.LogGroup;

export function renderLogGroups(
  data: AWS.CloudWatchLogs.DescribeLogGroupsResponse
) {
  if (!data.logGroups) {
    return "No data";
  }

  cli.table(data.logGroups, {
    logStreamName: {
      header: "Name",
      get: (row: LogGroup) => colors.cyan(row.logGroupName || ""),
    },
    creationTime: {
      header: "Creation Time",
      get: (row: LogGroup) => colors.green(formatTimestamp(row.creationTime)),
    },
  });
}

type LogStream = AWS.CloudWatchLogs.LogStream;

export function renderLogStreams(
  data: AWS.CloudWatchLogs.DescribeLogStreamsResponse
) {
  if (!data.logStreams) {
    return "No data";
  }

  cli.table(data.logStreams, {
    logStreamName: {
      header: "Name",
      get: (row: LogStream) => colors.cyan(row.logStreamName || ""),
    },
    lastEventTimestamp: {
      header: "Last Event",
      get: (row: LogStream) =>
        colors.yellow(formatTimestamp(row.lastEventTimestamp)),
    },
    creationTime: {
      header: "Creation Time",
      get: (row: LogStream) => colors.green(formatTimestamp(row.creationTime)),
    },
  });
}

type Parameter = AWS.SSM.Parameter;

export function renderParameters(data: AWS.SSM.ParameterList, path: string) {
  if (!data) {
    return "No data";
  }

  cli.table(data, {
    Name: {
      header: "Name",
      get: (row: Parameter) => colors.green((row.Name || "").replace(path, "")),
    },
    Value: {
      header: "Value",
      get: (row: Parameter) => row.Value,
    },
  });
}

type Service = AWS.ECS.Service;

export function renderServices(data: AWS.ECS.DescribeServicesResponse) {
  if (!data.services) {
    return "No data";
  }

  cli.table(data.services, {
    name: {
      header: "Name",
      get: (row: Service) => colors.cyan(row.serviceName || "Unknown"),
    },
    status: {
      header: "Status",
      get: (row: Service) => coloredStatus(row.status),
    },
    taskDefinition: {
      header: "Task definition",
      get: (row: Service) => {
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

type ServiceEvent = AWS.ECS.ServiceEvent;

export function renderServiceEvents(data: AWS.ECS.DescribeServicesResponse) {
  if (!data.services) {
    return "No data";
  }

  const events = (data.services[0].events || []).slice(0, 20);

  cli.table(events, {
    createdAt: {
      header: "Time",
      get: (row: ServiceEvent) => colors.yellow(formatDate(row.createdAt)),
    },
    message: {
      header: "Message",
      get: (row: ServiceEvent) => formatServiceEventMessage(row.message),
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

type Task = AWS.ECS.Task;

export function renderTasks(data: AWS.ECS.DescribeTasksResponse) {
  if (!data.tasks) {
    return "No data";
  }

  cli.table(data.tasks, {
    taskArn: {
      header: "Task",
      get: (row: Task) => colors.cyan(resourceName(row.taskArn)),
    },
    taskDefinitionArn: {
      header: "Task definition",
      get: (row: Task) => resourceName(row.taskDefinitionArn),
    },
    lastStatus: {
      header: "Last status",
      get: (row: Task) => coloredStatus(row.lastStatus),
    },
    desiredStatus: {
      header: "Desired status",
      get: (row: Task) => row.lastStatus,
    },
    group: {},
    launchType: {},
  });
}
