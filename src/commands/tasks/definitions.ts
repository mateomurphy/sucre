import Command from "../../base";
import ecs from "../../api/ecs";
import { paginateManually, resourceName } from "../../utils";

export class TasksDefinitionsCommand extends Command {
  static description = `list task definitions`;
  static flags = {};
  static args = [{ name: "familyPrefix" }];

  async run() {
    const { args } = this.parse(TasksDefinitionsCommand);
    const params = {
      familyPrefix: args.familyPrefix,
      maxResults: 20,
    };

    for await (let value of paginateManually(ecs.listTaskDefinitions, params)) {
      value.taskDefinitionArns.forEach((arn: string) => {
        this.log(resourceName(arn));
      });
    }
  }
}
