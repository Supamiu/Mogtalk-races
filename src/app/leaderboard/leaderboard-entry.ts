import {Team} from "../model/team";
import {ClearReport} from "../model/clear-report";

export interface LeaderboardEntry extends Team {
  rank: number;
  clears: Array<{ date: Date, clear: ClearReport } | undefined>;
}
