import {inject, Injectable} from "@angular/core";
import {FirestoreStorage} from "../core/firestore.service";
import {ClearReport} from "../model/clear-report";
import {from, Observable, switchMap, take} from "rxjs";
import {deleteObject, ref, Storage} from "@angular/fire/storage";
import {where} from "@angular/fire/firestore";
import {HistoryEntry} from "../model/history-entry";

@Injectable({
  providedIn: 'root'
})
export class HistoryService extends FirestoreStorage<HistoryEntry> {

  protected getCollectionName(): string {
    return "history";
  }
}
