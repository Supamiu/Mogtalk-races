import {DataModel} from "../core/data-model";

export interface User extends DataModel {
  lodestoneId: number;
  admin: boolean;
}
