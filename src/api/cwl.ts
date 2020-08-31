import AWS from "aws-sdk";
import { promisify } from "./utils";

const cwl = new AWS.CloudWatchLogs();

export const describeLogGroups = promisify(cwl, "describeLogGroups");
export const describeLogStreams = promisify(cwl, "describeLogStreams");
export const filterLogEvents = promisify(cwl, "filterLogEvents");
export const getLogEvents = promisify(cwl, "getLogEvents");
