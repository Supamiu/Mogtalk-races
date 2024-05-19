import {DataModel} from "../core/data-model";
import {Timestamp} from "@angular/fire/firestore";
import {ClearReport} from "./clear-report";

export enum HistoryEntryType {
  REPORT_SUBMITTED,
  REPORT_ACCEPTED,
  REPORT_REJECTED,
  REPORT_EDITED
}

// Structure is like that so we can add more events to register later on

export interface BaseHistoryEntry extends DataModel {
  author: string;
  date: Timestamp;
  type: HistoryEntryType;
}

export interface ReportEntry extends BaseHistoryEntry {
  type: HistoryEntryType.REPORT_SUBMITTED | HistoryEntryType.REPORT_ACCEPTED | HistoryEntryType.REPORT_REJECTED;
  report: ClearReport;
}

export interface ReportEditEntry extends BaseHistoryEntry {
  type: HistoryEntryType.REPORT_EDITED;
  report: ClearReport;
  previous_date: Timestamp;
  new_date: Timestamp;
}

export type HistoryEntry = ReportEntry | ReportEditEntry;


