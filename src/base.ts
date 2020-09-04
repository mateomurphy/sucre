import Command, { flags } from "@oclif/command";
import AWS from "aws-sdk";
import * as fs from "fs";
import * as path from "path";

AWS.config.update({ region: "us-east-1" });

interface UserConfig {
  cluster?: string;
  "log-group-name"?: string;
  "log-stream-name-prefix"?: string;
  "task-definition"?: string;
}

async function readUserConfig(): Promise<UserConfig> {
  const configPath = path.join(process.cwd(), "sucre.json");

  try {
    await fs.promises.access(configPath);
    return JSON.parse(
      await fs.promises.readFile(configPath, { encoding: "utf8" })
    );
  } catch (err) {
    console.error(err);
  }

  return {};
}

export default abstract class extends Command {
  userConfig = {} as UserConfig;

  params = {} as any;

  async catch(error: Error) {
    // do something or
    // re-throw to be handled globally
    throw error;
  }

  async init() {
    this.params = this.parse(<typeof Command>this.constructor);
    this.userConfig = await readUserConfig();
  }

  getFlag(key: string) {
    return this.params.flags[key] || this.userConfig[<keyof UserConfig>key];
  }
}
