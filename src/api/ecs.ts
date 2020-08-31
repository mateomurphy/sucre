import AWS from "aws-sdk";
import { promisify } from "./utils";

const ecs = new AWS.ECS();

export const describeServices = promisify(ecs, "describeServices");
export const describeTasks = promisify(ecs, "describeTasks");
export const listServices = promisify(ecs, "listServices");
export const listTasks = promisify(ecs, "listTasks");
export const runTask = promisify(ecs, "runTask");
export const updateService = promisify(ecs, "updateService");
export const waitFor = promisify(ecs, "waitFor");
