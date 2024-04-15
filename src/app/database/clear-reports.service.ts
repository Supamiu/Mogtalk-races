import {inject, Injectable} from "@angular/core";
import {FirestoreStorage} from "../core/firestore.service";
import {ClearReport} from "../model/clear-report";
import {from, Observable, switchMap, take} from "rxjs";
import {deleteObject, ref, Storage} from "@angular/fire/storage";
import {where} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class ClearReportsService extends FirestoreStorage<ClearReport> {
  #afs = inject(Storage)

  pending$ = this.query(where('accepted', '==', false));

  override deleteOne(key: string): Observable<void> {
    return super.getOne(key).pipe(
      take(1),
      switchMap(report => {
        return super.deleteOne(key).pipe(
          switchMap(() => {
            return from(deleteObject(ref(this.#afs, `clear-reports/${report.raceName}/${report.teamName}/${report.$key}.png`)));
          })
        );
      })
    );
  }

  protected getCollectionName(): string {
    return "clear-reports";
  }
}
