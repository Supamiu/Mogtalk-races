import {FirestoreStorage} from "../core/firestore.service";
import {Injectable} from "@angular/core";
import {Firestore} from "@angular/fire/firestore";
import {User} from "../model/user";

@Injectable({
  providedIn: "root"
})
export class UsersService extends FirestoreStorage<User> {
  constructor(firestore: Firestore) {
    super(firestore)
  }

  protected getCollectionName(): string {
    return "users";
  }
}
