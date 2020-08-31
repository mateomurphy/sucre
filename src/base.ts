import Command, { flags } from "@oclif/command";
import AWS from "aws-sdk";
import * as fs from "fs";
import * as path from "path";

AWS.config.update({ region: "us-east-1" });

interface UserConfig {
  cluster: string | undefined;
  logGroupName: string | undefined;
  logStreamNamePrefix: string | undefined;
  taskDefinition: string | undefined;
}

export default abstract class extends Command {
  userConfig = {} as UserConfig;

  async init() {
    const configPath = path.join(process.cwd(), "sucre.json");

    try {
      await fs.promises.access(configPath);
      this.userConfig = JSON.parse(
        await fs.promises.readFile(configPath, { encoding: "utf8" })
      );
    } catch (err) {
      console.error(err);
    }
  }
}
