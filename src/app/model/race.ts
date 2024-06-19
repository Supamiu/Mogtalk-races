import {Timestamp} from "@angular/fire/firestore";
import {DataModel} from "../core/data-model";
import {Team} from "./team";

export interface Race extends DataModel {
  name: string;
  type: string;
  phases: string[];
  start: Timestamp;
  banner: string;
  teams: string[];
  stopped?: Timestamp;
}

/**
 * We want to be able to save a clear timestamp per phase
 */
