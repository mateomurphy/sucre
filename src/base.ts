import Command from "@oclif/command";
import AWS from "aws-sdk";
import * as fs from "fs";
import * as path from "path";

AWS.config.update({ region: "us-east-1" });

type UserConfig = {
  cluster?: string;
  container?: string;
  "log-group-name"?: string;
  "log-stream-name-prefix"?: string;
  "task-definition"?: string;
  "task-definition-path"?: string;
};

async function readConfig(filePath: string): Promise<Record<string, any>> {
  const configPath = path.join(process.cwd(), filePath);

  try {
    await fs.promises.access(configPath);
    return JSON.parse(
      await fs.promises.readFile(configPath, { encoding: "utf8" })
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
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
    this.params = this.parse(this.constructor as typeof Command);
    this.userConfig = (await readConfig("sucre.json")) as UserConfig;

    const taskDefinitionPath = this.getFlag("task-definition-path");

    if (taskDefinitionPath) {
      await this.parseTaskDefinition(
        taskDefinitionPath,
        this.getFlag("container")
      );
    }
  }

  async parseTaskDefinition(filePath: string, containerName: string) {
    const taskDefinition = (await readConfig(
      filePath
    )) as AWS.ECS.TaskDefinition;

    if (!taskDefinition.containerDefinitions) {
      throw new Error("Task definition missing container definitions");
    }

    let container = null;

    if (containerName) {
      taskDefinition.containerDefinitions.forEach((definition) => {
        if (definition.name === containerName) {
          container = definition;
        }
      });
    }

    if (!container) {
      container = taskDefinition.containerDefinitions[0];
      this.userConfig.container = container.name;
    }

    if (
      container.logConfiguration &&
      container.logConfiguration.logDriver === "awslogs" &&
      container.logConfiguration.options
    ) {
      this.userConfig["log-group-name"] =
        container.logConfiguration.options["awslogs-group"];
      this.userConfig["log-stream-name-prefix"] =
        container.logConfiguration.options["awslogs-stream-prefix"];
    }
  }

  getFlag(key: string) {
    return this.params.flags[key] || this.userConfig[key as keyof UserConfig];
  }
}
