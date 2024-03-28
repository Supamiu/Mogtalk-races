import {DataModel} from "../core/data-model";

export interface Team extends DataModel {
  name: string;
  members: number[];
}
