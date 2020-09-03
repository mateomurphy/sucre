import AWS from "aws-sdk";
import { promiseProxy } from "./utils";

const ecs = new AWS.ECS();

export default promiseProxy(ecs);
