import {DataModel} from "../core/data-model";

export interface Team extends DataModel {
  owner: string;
  name: string;
  members: number[];
}
