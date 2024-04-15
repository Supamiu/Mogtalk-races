import {Team} from "../model/team";

export interface LeaderboardEntry extends Team {
  rank: number;
  clears: Array<Date | undefined>;
}
