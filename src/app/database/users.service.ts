import {FirestoreStorage} from "../core/firestore.service";
import {inject, Injectable} from "@angular/core";
import {Firestore} from "@angular/fire/firestore";
import {User} from "../model/user";
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, of, shareReplay} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UsersService extends FirestoreStorage<User> {

  #http = inject(HttpClient);

  charactersCache: Record<number, Observable<any>> = {};

  constructor(firestore: Firestore) {
    super(firestore);
  }

  getCharacter(lodestoneId: number) {
    if (!this.charactersCache[lodestoneId]) {
      this.charactersCache[lodestoneId] = this.#http.get<any>(`https://lodestone.ffxivteamcraft.com/Character/${lodestoneId}`).pipe(
        catchError(() => {
          return of({notFound: true});
        }),
        shareReplay()
      );
    }
    return this.charactersCache[lodestoneId];
  }

  protected getCollectionName(): string {
    return "users";
  }
}
