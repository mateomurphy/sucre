import Command, { flags } from "@oclif/command";
import * as fs from "fs";
import * as fsExtra from "fs-extra";
import * as path from "path";

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
      this.userConfig = await fsExtra.readJSON(configPath);
    } catch (err) {
      console.error(err);
    }
  }
}
