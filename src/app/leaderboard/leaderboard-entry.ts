import {Team} from "../model/team";
import {Timestamp} from "@angular/fire/firestore";

export interface LeaderboardEntry extends Team {
  rank: number;
  clears: Timestamp[];
}
