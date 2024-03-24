import {Timestamp} from "@angular/fire/firestore";
import {DataModel} from "../core/data-model";

export interface Race extends DataModel {
  name: string;
  type: string;
  bosses: string[];
  start: Timestamp;
  banner: string;
}
