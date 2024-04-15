import {DataModel} from "../core/data-model";
import {Timestamp} from "@angular/fire/firestore";

export interface ClearReport extends DataModel {
  team: string;
  phase?: string;
  date: Timestamp;
  screenshot: string;
}
