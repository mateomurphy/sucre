import Command from "../../base";
import ecs from "../../api/ecs";
import { paginateManually } from "../../utils";

export class TasksFamiliesCommand extends Command {
  static description = `list task definition families`;

  static flags = {};

  static args = [];

  async run() {
    const params = {
      maxResults: 20,
    };

    for await (const value of paginateManually(
      ecs.listTaskDefinitionFamilies,
      params
    )) {
      value.families.forEach((name: string) => {
        this.log(name);
      });
    }
  }
}
