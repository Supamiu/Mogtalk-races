import {Injectable} from "@angular/core";
import {FirestoreStorage} from "../core/firestore.service";
import {ClearReport} from "../model/clear-report";
import {where} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class ClearReportsService extends FirestoreStorage<ClearReport> {
  pending$ = this.query(where('accepted', '==', false));

  protected getCollectionName(): string {
    return "clear-reports";
  }
}
