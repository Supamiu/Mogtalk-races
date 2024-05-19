import {DataModel} from "../core/data-model";

export interface Team extends DataModel {
  name: string;
  previousNames: string[];
  datacenter: string;
  region: string;
  streams: string[];

  // Maybe add these later on if we want ot have members inside the teams
  // members: number[];
  // This is for when we'll have users able to claim and maintain teams
  // owner: string;
}
