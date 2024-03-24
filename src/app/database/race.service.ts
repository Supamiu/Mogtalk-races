import {FirestoreStorage} from "../core/firestore.service";
import {Race} from "../model/race";
import {Injectable} from "@angular/core";
import {Firestore} from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class RaceService extends FirestoreStorage<Race> {
  constructor(firestore: Firestore) {
    super(firestore)
  }

  protected getCollectionName(): string {
    return "races";
  }
}
