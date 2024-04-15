import {FirestoreStorage} from "../core/firestore.service";
import {Injectable} from "@angular/core";
import {Team} from "../model/team";

@Injectable({
  providedIn: "root"
})
export class TeamsService extends FirestoreStorage<Team> {

  protected getCollectionName(): string {
    return "teams";
  }
}
