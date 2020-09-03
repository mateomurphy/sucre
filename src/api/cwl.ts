import AWS from "aws-sdk";
import { promiseProxy } from "./utils";

const cwl = new AWS.CloudWatchLogs();

export default promiseProxy(cwl);
