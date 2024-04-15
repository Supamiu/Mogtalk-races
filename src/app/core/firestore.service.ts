import {DataModel} from "./data-model";
import {distinctUntilChanged, finalize, from, map, Observable, shareReplay, Subject} from "rxjs";
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  query,
  QueryDocumentSnapshot,
  runTransaction,
  setDoc,
  Transaction,
  UpdateData,
  updateDoc,
  WithFieldValue,
  WriteBatch,
  writeBatch
} from "@angular/fire/firestore";
import {QueryConstraint} from "@firebase/firestore";
import {inject} from "@angular/core";

export abstract class FirestoreStorage<T extends DataModel> {

  protected firestore = inject(Firestore);

  protected converter: FirestoreDataConverter<T> = {
    toFirestore: (modelObject: WithFieldValue<T>): DocumentData => {
      delete modelObject.$key;
      delete modelObject.notFound;
      return modelObject;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return {
        ...snapshot.data(),
        $key: snapshot.id
      } as T;
    }
  };

  protected cache: Record<string, Observable<T>> = {};

  protected updateSources: Record<string, Subject<UpdateData<T>>> = {};
  protected setSources: Record<string, Subject<T>> = {};

  protected readonly collection = collection(this.firestore, this.getCollectionName()).withConverter(this.converter);

  protected docRef(key: string): DocumentReference<T> {
    return doc(this.firestore, this.getCollectionName(), key).withConverter(this.converter);
  }

  public query(...filterQuery: QueryConstraint[]): Observable<T[]> {
    return collectionData(query(this.collection, ...filterQuery).withConverter(this.converter)).pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }

  public getOne(key: string, isForCurrentUser = false): Observable<T> {
    if (!this.cache[key]) {
      const source$ = docData(this.docRef(key)).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        map(res => {
          if (!res) {
            return {
              $key: key,
              notFound: true
            } as T;
          }
          return res;
        })
      );
      this.cache[key] = source$.pipe(
        shareReplay({refCount: true, bufferSize: 1}),
        finalize(() => delete this.cache[key])
      );
    }
    return this.cache[key];
  }

  public addOne(row: Omit<T, "$key">): Observable<string> {
    return from(addDoc(this.collection, row)).pipe(
      map(ref => ref.id)
    );
  }

  public deleteOne(key: string): Observable<void> {
    return from(deleteDoc(this.docRef(key)));
  }

  public setOne(key: string, row: Omit<T, "$key" | "notFound">): Observable<void> {
    if (this.setSources[key]) {
      this.setSources[key].next({...row, $key: key} as T);
    }
    return from(setDoc(this.docRef(key), row));
  }

  public updateOne(_key: string | undefined, row: UpdateData<T>): Observable<void> {
    const key = _key as string;
    if (this.updateSources[key]) {
      this.updateSources[key].next(row);
    }
    return from(updateDoc(this.docRef(key), row));
  }

  protected transaction<R>(transaction: (t: Transaction) => Promise<R>): Observable<R> {
    return from(runTransaction(this.firestore, transaction));
  }

  protected batch(): WriteBatch {
    return writeBatch(this.firestore);
  }

  protected abstract getCollectionName(): string;
}
