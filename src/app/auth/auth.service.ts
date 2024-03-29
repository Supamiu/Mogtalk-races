import {inject, Injectable} from "@angular/core";
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user
} from "@angular/fire/auth";
import {UsersService} from "../database/users.service";
import {filter, from, map, switchMap} from "rxjs";

@Injectable({providedIn: 'root'})
export class AuthService {
  #afAuth = inject(Auth);
  #usersService = inject(UsersService);

  user$ = user(this.#afAuth).pipe(
    filter(Boolean),
    switchMap(u => this.#usersService.getOne(u.uid))
  );

  loggedIn$ = authState(this.#afAuth).pipe(
    map(Boolean)
  )

  registerWithEmail(email: string, password: string, lodestoneId: number) {
    return from(createUserWithEmailAndPassword(this.#afAuth, email, password)).pipe(
      switchMap(creds => this.#usersService.setOne(creds.user.uid, {lodestoneId, admin: false}))
    )
  }

  loginWithEmail(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.#afAuth, email, password));
  }

  signOut() {
    return from(signOut(this.#afAuth));
  }
}
