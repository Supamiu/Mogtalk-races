import {FirestoreStorage} from "../core/firestore.service";
import {Race} from "../model/race";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class RaceService extends FirestoreStorage<Race> {

  protected getCollectionName(): string {
    return "races";
  }
}
