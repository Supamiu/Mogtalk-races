import {DataModel} from "../core/data-model";
import {Timestamp} from "@angular/fire/firestore";

export interface ClearReport extends DataModel {
  team?: string;
  teamName: string;
  phase?: string;
  date: Timestamp;
  screenshot?: string;
  url?: string;
  race: string;
  raceName: string;
  accepted: boolean;
  customTeam?: {
    name: string;
    datacenter: string;
    streams: string[]
  }
}
