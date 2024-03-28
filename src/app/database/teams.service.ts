import {FirestoreStorage} from "../core/firestore.service";
import {Injectable} from "@angular/core";
import {Firestore} from "@angular/fire/firestore";
import {Team} from "../model/team";

@Injectable({
  providedIn: "root"
})
export class TeamsService extends FirestoreStorage<Team> {
  constructor(firestore: Firestore) {
    super(firestore)
  }

  protected getCollectionName(): string {
    return "teams";
  }
}
