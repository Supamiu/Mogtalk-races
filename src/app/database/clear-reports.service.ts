import {Injectable} from "@angular/core";
import {FirestoreStorage} from "../core/firestore.service";
import {ClearReport} from "../model/clear-report";

@Injectable({
  providedIn: 'root'
})
export class ClearReportsService extends FirestoreStorage<ClearReport> {

  protected getCollectionName(): string {
    return "clear-reports";
  }
}
